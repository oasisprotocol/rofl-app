import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ViewWithOnlyLogsPermission } from './ViewWithOnlyLogsPermission'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import * as oasisRT from '@oasisprotocol/client-rt'

// Mock dependencies
vi.mock('../../nexus/api', () => ({
  useGetRuntimeRoflmarketInstances: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, _asChild, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock('../../utils/hasViewLogsPermission', () => ({
  hasViewLogsPermission: vi.fn(),
}))

vi.mock('../MachineStatusIcon/isMachineRemoved', () => ({
  isMachineRemoved: vi.fn(),
}))

import { useGetRuntimeRoflmarketInstances } from '../../nexus/api'
import type { RoflApp } from '../../nexus/api'
import { useAccount } from 'wagmi'
import { hasViewLogsPermission } from '../../utils/hasViewLogsPermission'
import { isMachineRemoved } from '../MachineStatusIcon/isMachineRemoved'

const mockUseGetRuntimeRoflmarketInstances = vi.mocked(useGetRuntimeRoflmarketInstances)
const mockUseAccount = vi.mocked(useAccount)
const mockHasViewLogsPermission = vi.mocked(hasViewLogsPermission)
const mockIsMachineRemoved = vi.mocked(isMachineRemoved)

describe('ViewWithOnlyLogsPermission', () => {
  const mockApp: RoflApp = {
    id: 'test-app-id',
    admin: 'oasis1admin',
    admin_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    stake: '1000000000000',
    policy: {},
    sek: 'test-sek',
    metadata: {},
    secrets: {},
    removed: false,
    date_created: '2024-01-01T00:00:00Z',
    last_activity: '2024-01-01T00:00:00Z',
  }

  const mockMachines = [
    {
      id: 'machine-1',
      provider: '0xProvider1',
      status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
      removed: false,
      deployment: {
        metadata: {
          'net.oasis.scheduler.permissions': 'base64value',
        },
      },
    },
    {
      id: 'machine-2',
      provider: '0xProvider2',
      status: oasisRT.types.RoflmarketInstanceStatus.CREATED,
      removed: false,
      deployment: {
        metadata: {
          'net.oasis.scheduler.permissions': 'base64value2',
        },
      },
    },
  ] as any[]

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mocks
    mockUseAccount.mockReturnValue({
      isConnected: false,
      address: undefined,
      chainId: undefined,
      connector: undefined,
    })
    mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)
  })

  describe('when wallet is not connected', () => {
    it('should not render anything', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: mockMachines } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      expect(screen.queryByText('View logs')).not.toBeInTheDocument()
    })
  })

  describe('when wallet is connected', () => {
    const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

    beforeEach(() => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: mockAddress,
        chainId: 23294,
        connector: undefined,
      })
    })

    it('should render view logs buttons for machines with only logs permission', () => {
      mockIsMachineRemoved.mockReturnValue(false)
      mockHasViewLogsPermission.mockReturnValue(new Uint8Array([1, 2, 3]))

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: mockMachines } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      const buttons = screen.getAllByText('View logs')
      expect(buttons).toHaveLength(2)
    })

    it('should not render anything when no machines have logs permission', () => {
      mockIsMachineRemoved.mockReturnValue(false)
      mockHasViewLogsPermission.mockReturnValue(false)

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: mockMachines } },
        isLoading: false,
        error: null,
      } as any)

      const { container } = render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      expect(container.querySelector('button')).not.toBeInTheDocument()
    })

    it('should filter out removed machines', () => {
      const machinesWithRemoved = [
        { ...mockMachines[0], removed: false },
        { ...mockMachines[1], removed: true },
      ]

      mockIsMachineRemoved.mockImplementation(machine => machine.removed)
      mockHasViewLogsPermission.mockReturnValue(new Uint8Array([1, 2, 3]))

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: machinesWithRemoved } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      const buttons = screen.getAllByText('View logs')
      expect(buttons).toHaveLength(1)
    })

    it('should filter out machines without logs permission', () => {
      mockIsMachineRemoved.mockReturnValue(false)
      mockHasViewLogsPermission.mockImplementation((machine, _address) => {
        return machine.id === 'machine-1' ? new Uint8Array([1, 2, 3]) : false
      })

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: mockMachines } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      const buttons = screen.getAllByText('View logs')
      expect(buttons).toHaveLength(1)
    })

    it('should create correct links to machine logs', () => {
      mockIsMachineRemoved.mockReturnValue(false)
      mockHasViewLogsPermission.mockReturnValue(new Uint8Array([1, 2, 3]))

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: mockMachines } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      const links = screen.getAllByText('View logs').map(btn => btn.closest('a'))
      expect(links[0]).toHaveAttribute('href', '/dashboard/machines/0xProvider1/instances/machine-1')
      expect(links[1]).toHaveAttribute('href', '/dashboard/machines/0xProvider2/instances/machine-2')
    })

    it('should not render anything when query data is undefined', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any)

      const { container } = render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      expect(container.querySelector('button')).not.toBeInTheDocument()
    })

    it('should not render anything when instances array is empty', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: [] } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      expect(screen.queryByText('View logs')).not.toBeInTheDocument()
    })

    it('should use correct query parameters', () => {
      mockIsMachineRemoved.mockReturnValue(false)
      mockHasViewLogsPermission.mockReturnValue(new Uint8Array([1, 2, 3]))

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: mockMachines } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="testnet" />, {
        wrapper: createWrapper(),
      })

      expect(mockUseGetRuntimeRoflmarketInstances).toHaveBeenCalledWith('testnet', 'sapphire', {
        limit: 100,
        offset: 0,
        deployed_app_id: 'test-app-id',
      })
    })

    it('should filter machines with CANCELLED status as removed', () => {
      const machinesWithCancelled = [
        {
          ...mockMachines[0],
          status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
          removed: false,
        },
        {
          ...mockMachines[1],
          status: oasisRT.types.RoflmarketInstanceStatus.CANCELLED,
          removed: false,
        },
      ]

      mockIsMachineRemoved.mockImplementation(
        machine => machine.removed || machine.status === oasisRT.types.RoflmarketInstanceStatus.CANCELLED,
      )
      mockHasViewLogsPermission.mockReturnValue(new Uint8Array([1, 2, 3]))

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: machinesWithCancelled } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      const buttons = screen.getAllByText('View logs')
      expect(buttons).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('should handle machines with undefined deployment', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        chainId: 23294,
        connector: undefined,
      })

      const machinesWithUndefinedDeployment = [
        { ...mockMachines[0] },
        { ...mockMachines[1], deployment: undefined },
      ]

      mockIsMachineRemoved.mockReturnValue(false)
      mockHasViewLogsPermission.mockImplementation((machine: any) => {
        return machine.deployment ? new Uint8Array([1, 2, 3]) : false
      })

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: machinesWithUndefinedDeployment } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      const buttons = screen.queryAllByText('View logs')
      expect(buttons).toHaveLength(1)
    })

    it('should handle all machines filtered out', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        chainId: 23294,
        connector: undefined,
      })

      mockIsMachineRemoved.mockReturnValue(true)
      mockHasViewLogsPermission.mockReturnValue(new Uint8Array([1, 2, 3]))

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: { data: { instances: mockMachines } },
        isLoading: false,
        error: null,
      } as any)

      render(<ViewWithOnlyLogsPermission app={mockApp} network="mainnet" />, {
        wrapper: createWrapper(),
      })

      expect(screen.queryByText('View logs')).not.toBeInTheDocument()
    })
  })
})
