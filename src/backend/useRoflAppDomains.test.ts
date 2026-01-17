import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useRoflAppDomains } from './useRoflAppDomains'
import {
  GetRuntimeRoflAppsIdInstancesRak,
  GetRuntimeRoflmarketInstances,
  GetRuntimeRoflmarketProvidersAddress,
} from '../nexus/api'
import { isMachineRemoved } from '../components/MachineStatusIcon/isMachineRemoved'
import { useRoflAppBackendAuthContext } from '../contexts/RoflAppBackendAuth/hooks'
import { downloadArtifact } from './api'
import { parsePublishedPortsFromCompose } from './parsePublishedPortsFromCompose'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'

// Mock all dependencies
vi.mock('../nexus/api', () => ({
  GetRuntimeRoflAppsIdInstancesRak: vi.fn(),
  GetRuntimeRoflmarketInstances: vi.fn(),
  GetRuntimeRoflmarketProvidersAddress: vi.fn(),
}))

vi.mock('../components/MachineStatusIcon/isMachineRemoved.ts', () => ({
  isMachineRemoved: vi.fn(),
}))

vi.mock('../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: vi.fn(),
}))

vi.mock('./api', () => ({
  downloadArtifact: vi.fn(),
}))

vi.mock('./parsePublishedPortsFromCompose.ts', () => ({
  parsePublishedPortsFromCompose: vi.fn(),
}))

describe('backend/useRoflAppDomains', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(RoflAppBackendAuthProvider, null, children),
    )

  const mockAppID = 'rofl1testappid'
  const mockNetwork: 'mainnet' | 'testnet' = 'testnet'

  const mockMachine = {
    id: '3039',
    provider: 'provider1',
    metadata: {
      'net.oasis.scheduler.rak': 'scheduler-rak-123',
    },
    deployment: {
      metadata: {},
    },
  }

  const mockProvider = {
    scheduler: 'scheduler-address',
  }

  const mockScheduler = {
    metadata: {
      'net.oasis.proxy.domain': 'proxy.example.com',
    },
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false, gcTime: 0 },
      },
    })

    // Reset all mocks to clear any previous mock implementations
    vi.mocked(useRoflAppBackendAuthContext).mockReset()
    vi.mocked(isMachineRemoved).mockReset()
    vi.mocked(downloadArtifact).mockReset()
    vi.mocked(parsePublishedPortsFromCompose).mockReset()
    vi.mocked(GetRuntimeRoflmarketInstances).mockReset()
    vi.mocked(GetRuntimeRoflmarketProvidersAddress).mockReset()
    vi.mocked(GetRuntimeRoflAppsIdInstancesRak).mockReset()

    // Set up default successful responses
    vi.mocked(useRoflAppBackendAuthContext).mockReturnValue({ token: 'test-token' })
    vi.mocked(isMachineRemoved).mockReturnValue(false)
    vi.mocked(downloadArtifact).mockResolvedValue(undefined as any)
    vi.mocked(parsePublishedPortsFromCompose).mockReturnValue([])
    vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
      data: { instances: [mockMachine] },
    } as any)
    vi.mocked(GetRuntimeRoflmarketProvidersAddress).mockResolvedValue({
      data: mockProvider,
    } as any)
    vi.mocked(GetRuntimeRoflAppsIdInstancesRak).mockResolvedValue({
      data: mockScheduler,
    } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useRoflAppDomains - basic functionality', () => {
    it('should fetch and return app domains with implied extra config', async () => {
      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([
        {
          ServiceName: '',
          Domain: 'https://p<exposed ports>.m12345.proxy.example.com',
        },
      ])
    })

    it('should have refetch function', () => {
      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      expect(typeof result.current.refetch).toBe('function')
    })

    it('should handle published ports from compose', async () => {
      const composeYaml = 'version: "3"'
      vi.mocked(downloadArtifact).mockResolvedValue(composeYaml as any)
      vi.mocked(parsePublishedPortsFromCompose).mockReturnValue([
        {
          ServiceName: 'web',
          Port: '80',
          ProxyMode: 'terminate-tls',
          GenericDomain: 'p80',
        },
      ])

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([
        {
          ServiceName: 'web',
          Domain: 'https://p80.m12345.proxy.example.com',
        },
      ])
    })

    it('should handle custom domain from compose', async () => {
      const composeYaml = 'version: "3"'
      vi.mocked(downloadArtifact).mockResolvedValue(composeYaml)
      vi.mocked(parsePublishedPortsFromCompose).mockReturnValue([
        {
          ServiceName: 'web',
          Port: '80',
          ProxyMode: 'terminate-tls',
          GenericDomain: 'p80',
          CustomDomain: 'my-custom.example.com',
        },
      ])

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([
        {
          ServiceName: 'web',
          Domain: 'https://my-custom.example.com',
        },
      ])
    })
  })

  describe('useRoflAppDomains - early return scenarios', () => {
    it('should return empty array when machine has no scheduler RAK', async () => {
      const machineWithoutRAK = {
        ...mockMachine,
        metadata: {},
      }

      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [machineWithoutRAK] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([])
    })

    it('should return empty array when scheduler has no proxy domain', async () => {
      const schedulerWithoutDomain = {
        metadata: {},
      }

      vi.mocked(GetRuntimeRoflAppsIdInstancesRak).mockResolvedValue({
        data: schedulerWithoutDomain,
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([])
    })

    it('should return empty array when scheduler returns undefined metadata', async () => {
      vi.mocked(GetRuntimeRoflAppsIdInstancesRak).mockResolvedValue({
        data: {},
      })

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([])
    })

    it('should filter out removed machines', async () => {
      vi.mocked(isMachineRemoved).mockReturnValue(true)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([])
    })

    it('should return empty array when no machines exist', async () => {
      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([])
    })
  })

  describe('useRoflAppDomains - error handling', () => {
    it('should handle GetRuntimeRoflmarketInstances errors', async () => {
      vi.mocked(GetRuntimeRoflmarketInstances).mockRejectedValue(new Error('API error'))

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })

      expect(result.current.error).toBeDefined()
    })

    it('should handle GetRuntimeRoflmarketProvidersAddress errors', async () => {
      vi.mocked(GetRuntimeRoflmarketProvidersAddress).mockRejectedValue(new Error('Provider API error'))

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })

      expect(result.current.error).toBeDefined()
    })

    it('should handle GetRuntimeRoflAppsIdInstancesRak errors', async () => {
      vi.mocked(GetRuntimeRoflAppsIdInstancesRak).mockRejectedValue(new Error('Scheduler API error'))

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })

      expect(result.current.error).toBeDefined()
    })

    it('should handle downloadArtifact errors gracefully', async () => {
      vi.mocked(downloadArtifact).mockRejectedValue(new Error('Download failed'))

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useRoflAppDomains - token handling', () => {
    it('should use token from auth context when downloading artifact', async () => {
      vi.mocked(downloadArtifact).mockResolvedValue('compose content' as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(downloadArtifact).toHaveBeenCalledWith(`${mockAppID}-compose-yaml`, 'test-token')
    })

    it('should handle empty token gracefully', async () => {
      vi.mocked(useRoflAppBackendAuthContext).mockReturnValue({ token: '' })

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toBeDefined()
    })

    it('should handle undefined token gracefully', async () => {
      vi.mocked(useRoflAppBackendAuthContext).mockReturnValue({ token: undefined as any })

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useRoflAppDomains - network handling', () => {
    it('should work with mainnet network', async () => {
      const { result } = renderHook(() => useRoflAppDomains('mainnet', mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(GetRuntimeRoflmarketInstances).toHaveBeenCalledWith('mainnet', 'sapphire', {
        deployed_app_id: mockAppID,
      })
    })

    it('should work with testnet network', async () => {
      const { result } = renderHook(() => useRoflAppDomains('testnet', mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(GetRuntimeRoflmarketInstances).toHaveBeenCalledWith('testnet', 'sapphire', {
        deployed_app_id: mockAppID,
      })
    })
  })

  describe('useRoflAppDomains - custom domains from metadata', () => {
    it('should handle single custom domain', async () => {
      const machineWithCustomDomain = {
        ...mockMachine,
        deployment: {
          metadata: {
            'net.oasis.proxy.custom_domains': 'single.example.com',
          },
        },
      }

      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [machineWithCustomDomain] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([
        {
          ServiceName: '',
          Domain: 'https://single.example.com',
        },
        {
          ServiceName: '',
          Domain: 'https://p<exposed ports>.m12345.proxy.example.com',
        },
      ])
    })

    it('should handle multiple custom domains separated by spaces', async () => {
      const machineWithCustomDomains = {
        ...mockMachine,
        deployment: {
          metadata: {
            'net.oasis.proxy.custom_domains': 'domain1.com domain2.com domain3.com',
          },
        },
      }

      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [machineWithCustomDomains] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toHaveLength(4)
      expect(result.current.data?.[0].Domain).toBe('https://domain1.com')
      expect(result.current.data?.[1].Domain).toBe('https://domain2.com')
      expect(result.current.data?.[2].Domain).toBe('https://domain3.com')
      expect(result.current.data?.[3].Domain).toBe('https://p<exposed ports>.m12345.proxy.example.com')
    })

    it('should handle deployment without metadata', async () => {
      const machineWithoutMetadata = {
        ...mockMachine,
        deployment: {},
      }

      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [machineWithoutMetadata] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([
        {
          ServiceName: '',
          Domain: 'https://p<exposed ports>.m12345.proxy.example.com',
        },
      ])
    })

    it('should handle machine without deployment metadata', async () => {
      const machineWithoutDeployment = {
        ...mockMachine,
        deployment: {} as any,
      }

      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [machineWithoutDeployment] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      // When deployment exists but has no metadata, should work fine
      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useRoflAppDomains - compose parsing', () => {
    it('should handle undefined compose YAML', async () => {
      vi.mocked(downloadArtifact).mockResolvedValue(undefined as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(parsePublishedPortsFromCompose).not.toHaveBeenCalled()
    })

    it('should use implied config when compose has no published ports', async () => {
      vi.mocked(downloadArtifact).mockResolvedValue('compose' as any)
      vi.mocked(parsePublishedPortsFromCompose).mockReturnValue([])

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toEqual([
        {
          ServiceName: '',
          Domain: 'https://p<exposed ports>.m12345.proxy.example.com',
        },
      ])
    })
  })

  describe('useRoflAppDomains - domain URL construction', () => {
    it('should construct correct domain with machine ID', async () => {
      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data?.[0].Domain).toContain('.proxy.example.com')
      expect(result.current.data?.[0].Domain).toContain('m')
    })

    it('should handle large machine IDs', async () => {
      const machineWithLargeID = {
        ...mockMachine,
        id: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      }

      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [machineWithLargeID] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data?.[0].Domain).toContain('m')
      expect(result.current.data?.[0].Domain).toContain('.proxy.example.com')
    })

    it('should handle multiple machines', async () => {
      const machine2 = {
        ...mockMachine,
        id: '109a',
      }

      vi.mocked(GetRuntimeRoflmarketInstances).mockResolvedValue({
        data: { instances: [mockMachine, machine2] },
      } as any)

      const { result } = renderHook(() => useRoflAppDomains(mockNetwork, mockAppID), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data).toEqual([
        {
          ServiceName: '',
          Domain: 'https://p<exposed ports>.m12345.proxy.example.com',
        },
        {
          ServiceName: '',
          Domain: 'https://p<exposed ports>.m4250.proxy.example.com',
        },
      ])
    })
  })
})
