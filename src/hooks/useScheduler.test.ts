import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useScheduler } from './useScheduler'

// Mock the useNetwork hook
const mockUseNetwork = vi.fn()
vi.mock('./useNetwork', () => ({
  useNetwork: () => mockUseNetwork(),
}))

// Mock nexus API hooks
const mockUseGetRuntimeRoflmarketProvidersAddress = vi.fn()
const mockUseGetRuntimeRoflAppsIdInstances = vi.fn()

vi.mock('../nexus/api', () => ({
  useGetRuntimeRoflmarketProvidersAddress: (...args: unknown[]) =>
    mockUseGetRuntimeRoflmarketProvidersAddress(...args),
  useGetRuntimeRoflAppsIdInstances: (...args: unknown[]) => mockUseGetRuntimeRoflAppsIdInstances(...args),
}))

describe('useScheduler', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  describe('basic functionality', () => {
    it('should be a function', async () => {
      const module = await import('./useScheduler')
      expect(typeof module.useScheduler).toBe('function')
    })

    it('should export hook', async () => {
      const module = await import('./useScheduler')
      expect(module).toBeDefined()
      expect(module.useScheduler).toBeDefined()
    })

    it('should return api object with api property', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id-123',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak-456',
                metadata: {
                  'net.oasis.scheduler.api': 'https://scheduler.example.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak-456', 'provider-123'), {
        wrapper,
      })

      expect(result.current).toBeDefined()
      expect(result.current).toHaveProperty('api')
    })
  })

  describe('successful data fetching', () => {
    it('should return api url when all data is available', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id-123',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak-456',
                metadata: {
                  'net.oasis.scheduler.api': 'https://scheduler.example.com/api',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak-456', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://scheduler.example.com/api')
    })

    it('should find correct instance by rak when multiple instances exist', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id-789',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'instance-1',
                metadata: {
                  'net.oasis.scheduler.api': 'https://instance1.example.com',
                },
              },
              {
                rak: 'instance-2',
                metadata: {
                  'net.oasis.scheduler.api': 'https://instance2.example.com',
                },
              },
              {
                rak: 'target-instance',
                metadata: {
                  'net.oasis.scheduler.api': 'https://target.example.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('target-instance', 'provider-456'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://target.example.com')
    })

    it('should work with mainnet network', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'mainnet-scheduler',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'mainnet-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://mainnet.scheduler.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('mainnet-rak', 'mainnet-provider'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://mainnet.scheduler.com')
      expect(mockUseGetRuntimeRoflmarketProvidersAddress).toHaveBeenCalledWith(
        'mainnet',
        'sapphire',
        'mainnet-provider',
      )
    })

    it('should work with testnet network', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'testnet-scheduler',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'testnet-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://testnet.scheduler.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('testnet-rak', 'testnet-provider'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://testnet.scheduler.com')
      expect(mockUseGetRuntimeRoflmarketProvidersAddress).toHaveBeenCalledWith(
        'testnet',
        'sapphire',
        'testnet-provider',
      )
    })
  })

  describe('loading and pending states', () => {
    it('should return undefined api when provider data is loading', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: false,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should return undefined api when scheduler instances data is loading', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should handle both queries loading', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })
  })

  describe('error and edge cases', () => {
    it('should return undefined api when provider data is missing', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should return undefined api when scheduler id is missing', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: undefined,
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should return undefined api when scheduler instances data is missing', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should return undefined api when scheduler instances array is empty', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should return undefined api when no matching instance rak is found', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'different-rak-1',
                metadata: {
                  'net.oasis.scheduler.api': 'https://different1.com',
                },
              },
              {
                rak: 'different-rak-2',
                metadata: {
                  'net.oasis.scheduler.api': 'https://different2.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('target-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should return undefined api when instance metadata is missing', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                // metadata is missing
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should return undefined api when metadata does not contain scheduler api key', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'some.other.key': 'some-value',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should handle empty string for scheduler api in metadata', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': '',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('')
    })
  })

  describe('query parameters and behavior', () => {
    it('should call provider query with correct parameters', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      renderHook(() => useScheduler('scheduler-rak', 'test-provider'), {
        wrapper,
      })

      expect(mockUseGetRuntimeRoflmarketProvidersAddress).toHaveBeenCalledWith(
        'testnet',
        'sapphire',
        'test-provider',
      )
    })

    it('should call scheduler instances query with scheduler id', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'retrieved-scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      renderHook(() => useScheduler('scheduler-rak', 'test-provider'), {
        wrapper,
      })

      expect(mockUseGetRuntimeRoflAppsIdInstances).toHaveBeenCalledWith(
        'mainnet',
        'sapphire',
        'retrieved-scheduler-id',
      )
    })

    it('should call scheduler instances query with empty string when scheduler id is undefined', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: undefined,
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      renderHook(() => useScheduler('scheduler-rak', 'test-provider'), {
        wrapper,
      })

      expect(mockUseGetRuntimeRoflAppsIdInstances).toHaveBeenCalledWith('mainnet', 'sapphire', '')
    })
  })

  describe('reactivity', () => {
    it('should update api when provider data changes', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { rerender } = renderHook(({ schedulerRak, provider }) => useScheduler(schedulerRak, provider), {
        wrapper,
        initialProps: { schedulerRak: 'scheduler-rak', provider: 'provider-1' },
      })

      // Initial render with first provider
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-1',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api1.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      rerender({ schedulerRak: 'scheduler-rak', provider: 'provider-2' })

      // After provider change
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-2',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api2.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      expect(mockUseGetRuntimeRoflmarketProvidersAddress).toHaveBeenCalledWith(
        'mainnet',
        'sapphire',
        'provider-2',
      )
    })

    it('should use network from useNetwork hook', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(mockUseNetwork).toHaveBeenCalled()
      expect(mockUseGetRuntimeRoflmarketProvidersAddress).toHaveBeenCalledWith(
        'testnet',
        'sapphire',
        'provider-123',
      )
    })
  })

  describe('data structure validation', () => {
    it('should handle nested data structure correctly', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api.example.com',
                  'other.metadata': 'value',
                },
                id: 'instance-id',
                status: 'active',
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://api.example.com')
    })

    it('should handle instance with additional properties', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                id: 'test-instance-id',
                status: 'running',
                created_at: '2024-01-01',
                updated_at: '2024-01-02',
                metadata: {
                  'net.oasis.scheduler.api': 'https://test-api.com',
                  version: '1.0.0',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://test-api.com')
    })
  })

  describe('special characters and edge cases in API URLs', () => {
    it('should handle API URLs with special characters', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api':
                    'https://api.example.com:8080/path?query=value&other=123#fragment',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://api.example.com:8080/path?query=value&other=123#fragment')
    })

    it('should handle API URLs with different protocols', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'wss://websocket.example.com/scheduler',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('wss://websocket.example.com/scheduler')
    })

    it('should handle localhost URLs for development', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'http://localhost:3000/api',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('http://localhost:3000/api')
    })
  })

  describe('parameter validation', () => {
    it('should handle empty string for schedulerRak', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'different-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api.example.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()
    })

    it('should match instance with empty string rak when searching with empty string', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: '',
                metadata: {
                  'net.oasis.scheduler.api': 'https://empty-rak-api.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('', 'provider-123'), {
        wrapper,
      })

      // When searching for empty string, it should match an instance with empty string rak
      expect(result.current.api).toBe('https://empty-rak-api.com')
    })

    it('should handle empty string for provider', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      renderHook(() => useScheduler('scheduler-rak', ''), {
        wrapper,
      })

      expect(mockUseGetRuntimeRoflmarketProvidersAddress).toHaveBeenCalledWith('mainnet', 'sapphire', '')
    })

    it('should handle special characters in schedulerRak', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak-with-special-chars-123',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api.example.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(
        () => useScheduler('scheduler-rak-with-special-chars-123', 'provider-123'),
        {
          wrapper,
        },
      )

      expect(result.current.api).toBe('https://api.example.com')
    })

    it('should handle very long provider strings', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      const longProvider = 'p'.repeat(1000)

      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      renderHook(() => useScheduler('scheduler-rak', longProvider), {
        wrapper,
      })

      expect(mockUseGetRuntimeRoflmarketProvidersAddress).toHaveBeenCalledWith(
        'mainnet',
        'sapphire',
        longProvider,
      )
    })
  })

  describe('metadata edge cases', () => {
    it('should handle metadata with null value for scheduler api', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': null,
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeNull()
    })

    it('should handle metadata with numeric value for scheduler api', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 12345,
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe(12345)
    })

    it('should handle metadata with object value for scheduler api', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': { url: 'https://api.example.com' },
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toEqual({ url: 'https://api.example.com' })
    })

    it('should handle instance with metadata but wrong key casing', () => {
      mockUseNetwork.mockReturnValue('testnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api.example.com',
                  'Net.Oasis.Scheduler.Api': 'https://wrong-casing.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBe('https://api.example.com')
    })
  })

  describe('multiple instances with same RAK', () => {
    it('should return first matching instance when duplicate RAKs exist', () => {
      mockUseNetwork.mockReturnValue('mainnet')
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'duplicate-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://first.example.com',
                },
              },
              {
                rak: 'duplicate-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://second.example.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const { result } = renderHook(() => useScheduler('duplicate-rak', 'provider-123'), {
        wrapper,
      })

      // Should return the first match
      expect(result.current.api).toBe('https://first.example.com')
    })
  })

  describe('state transitions', () => {
    it('should transition from loading to loaded', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      // Start with loading state
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })

      const { result, rerender } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()

      // Transition to loaded state
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api.example.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      rerender()

      expect(result.current.api).toBe('https://api.example.com')
    })

    it('should handle transition from error to success', () => {
      mockUseNetwork.mockReturnValue('testnet')

      // Start with error state (undefined data after fetch)
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      const { result, rerender } = renderHook(() => useScheduler('scheduler-rak', 'provider-123'), {
        wrapper,
      })

      expect(result.current.api).toBeUndefined()

      // Transition to success
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'scheduler-id',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://api.example.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      rerender()

      expect(result.current.api).toBe('https://api.example.com')
    })
  })

  describe('network changes', () => {
    it('should handle network switch from mainnet to testnet', () => {
      const { rerender } = renderHook(
        ({ network }) => {
          mockUseNetwork.mockReturnValue(network)
          return useScheduler('scheduler-rak', 'provider-123')
        },
        {
          wrapper,
          initialProps: { network: 'mainnet' as 'mainnet' | 'testnet' },
        },
      )

      // Initial mainnet setup
      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'mainnet-scheduler',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://mainnet.api.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      // Switch to testnet
      rerender({ network: 'testnet' })

      mockUseGetRuntimeRoflmarketProvidersAddress.mockReturnValue({
        data: {
          data: {
            scheduler: 'testnet-scheduler',
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflAppsIdInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                rak: 'scheduler-rak',
                metadata: {
                  'net.oasis.scheduler.api': 'https://testnet.api.com',
                },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      expect(mockUseNetwork).toHaveBeenCalled()
    })
  })
})
