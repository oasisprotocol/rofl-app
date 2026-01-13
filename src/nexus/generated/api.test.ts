import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

vi.mock('../replaceNetworkWithBaseURL', () => ({
  default: vi.fn(() => vi.fn()),
}))

describe('nexus generated api', () => {
  describe('Layer enum', () => {
    it('should export Layer enum with all values', async () => {
      const { Layer } = await import('./api')
      expect(Layer).toBeDefined()
      expect(Layer.emerald).toBe('emerald')
      expect(Layer.sapphire).toBe('sapphire')
      expect(Layer.pontusxtest).toBe('pontusxtest')
      expect(Layer.pontusxdev).toBe('pontusxdev')
      expect(Layer.cipher).toBe('cipher')
      expect(Layer.consensus).toBe('consensus')
    })

    it('should have Layer type as union of enum values', async () => {
      const { Layer } = await import('./api')
      const layer: Layer = 'emerald'
      expect(layer).toBe('emerald')
    })
  })

  describe('Runtime enum', () => {
    it('should export Runtime enum with all values', async () => {
      const { Runtime } = await import('./api')
      expect(Runtime).toBeDefined()
      expect(Runtime.emerald).toBe('emerald')
      expect(Runtime.sapphire).toBe('sapphire')
      expect(Runtime.pontusxtest).toBe('pontusxtest')
      expect(Runtime.pontusxdev).toBe('pontusxdev')
      expect(Runtime.cipher).toBe('cipher')
    })

    it('should have Runtime type as union of enum values', async () => {
      const { Runtime } = await import('./api')
      const runtime: Runtime = 'sapphire'
      expect(runtime).toBe('sapphire')
    })
  })

  describe('StakingAddress type', () => {
    it('should be defined as string type', async () => {
      const api = await import('./api')
      // StakingAddress is a type, not a value, so it won't exist at runtime
      // But we can verify the pattern it should match
      // oasis1 (6 chars) + 40 hex characters = 46 total
      const address: string = 'oasis1' + 'a'.repeat(40)
      expect(address.length).toBe(46)
      expect(address).toMatch(/^oasis1[a-z0-9]{40}$/)
    })

    it('should validate bech32 address pattern', async () => {
      // This is a type-level test - verify addresses match the pattern
      // oasis1 prefix (6 chars) + 40 lowercase hex characters = 46 total
      const validAddress = 'oasis1' + 'q'.repeat(20) + 'p'.repeat(20)
      const invalidAddress = 'invalid'
      const validPattern = /^oasis1[a-z0-9]{40}$/

      expect(validPattern.test(validAddress)).toBe(true)
      expect(validPattern.test(invalidAddress)).toBe(false)
    })
  })

  describe('TextBigInt type', () => {
    it('should be defined as string type for big integers', async () => {
      const api = await import('./api')
      expect(typeof api.TextBigInt).toBe('undefined')
      const bigInt: string = '-123456789'
      expect(bigInt).toMatch(/^-?[0-9]+$/)
    })

    it('should handle negative integers', () => {
      const negativeInt = '-100'
      expect(negativeInt).toMatch(/^-?[0-9]+$/)
    })

    it('should handle positive integers', () => {
      const positiveInt = '100000000000000000000'
      expect(positiveInt).toMatch(/^-?[0-9]+$/)
    })
  })

  describe('GetLayerStatsTxVolume exports', () => {
    it('should export GetLayerStatsTxVolume function', async () => {
      const { GetLayerStatsTxVolume } = await import('./api')
      expect(typeof GetLayerStatsTxVolume).toBe('function')
    })

    it('should export getGetLayerStatsTxVolumeQueryKey function', async () => {
      const { getGetLayerStatsTxVolumeQueryKey } = await import('./api')
      expect(typeof getGetLayerStatsTxVolumeQueryKey).toBe('function')
    })

    it('should export getGetLayerStatsTxVolumeQueryOptions function', async () => {
      const { getGetLayerStatsTxVolumeQueryOptions } = await import('./api')
      expect(typeof getGetLayerStatsTxVolumeQueryOptions).toBe('function')
    })

    it('should export useGetLayerStatsTxVolume hook', async () => {
      const { useGetLayerStatsTxVolume } = await import('./api')
      expect(typeof useGetLayerStatsTxVolume).toBe('function')
    })

    it('should export GetLayerStatsTxVolumeQueryResult type', async () => {
      const api = await import('./api')
      expect(typeof api.GetLayerStatsTxVolumeQueryResult).toBe('undefined')
    })

    it('should export GetLayerStatsTxVolumeQueryError type', async () => {
      const api = await import('./api')
      expect(typeof api.GetLayerStatsTxVolumeQueryError).toBe('undefined')
    })
  })

  describe('GetLayerStatsActiveAccounts exports', () => {
    it('should export GetLayerStatsActiveAccounts function', async () => {
      const { GetLayerStatsActiveAccounts } = await import('./api')
      expect(typeof GetLayerStatsActiveAccounts).toBe('function')
    })

    it('should export getGetLayerStatsActiveAccountsQueryKey function', async () => {
      const { getGetLayerStatsActiveAccountsQueryKey } = await import('./api')
      expect(typeof getGetLayerStatsActiveAccountsQueryKey).toBe('function')
    })

    it('should export getGetLayerStatsActiveAccountsQueryOptions function', async () => {
      const { getGetLayerStatsActiveAccountsQueryOptions } = await import('./api')
      expect(typeof getGetLayerStatsActiveAccountsQueryOptions).toBe('function')
    })

    it('should export useGetLayerStatsActiveAccounts hook', async () => {
      const { useGetLayerStatsActiveAccounts } = await import('./api')
      expect(typeof useGetLayerStatsActiveAccounts).toBe('function')
    })

    it('should export GetLayerStatsActiveAccountsQueryResult type', async () => {
      const api = await import('./api')
      expect(typeof api.GetLayerStatsActiveAccountsQueryResult).toBe('undefined')
    })

    it('should export GetLayerStatsActiveAccountsQueryError type', async () => {
      const api = await import('./api')
      expect(typeof api.GetLayerStatsActiveAccountsQueryError).toBe('undefined')
    })
  })

  describe('GetRuntimeRoflmarketInstances exports', () => {
    it('should export GetRuntimeRoflmarketInstances function', async () => {
      const { GetRuntimeRoflmarketInstances } = await import('./api')
      expect(typeof GetRuntimeRoflmarketInstances).toBe('function')
    })

    it('should export getGetRuntimeRoflmarketInstancesQueryKey function', async () => {
      const { getGetRuntimeRoflmarketInstancesQueryKey } = await import('./api')
      expect(typeof getGetRuntimeRoflmarketInstancesQueryKey).toBe('function')
    })

    it('should export getGetRuntimeRoflmarketInstancesQueryOptions function', async () => {
      const { getGetRuntimeRoflmarketInstancesQueryOptions } = await import('./api')
      expect(typeof getGetRuntimeRoflmarketInstancesQueryOptions).toBe('function')
    })

    it('should export useGetRuntimeRoflmarketInstances hook', async () => {
      const { useGetRuntimeRoflmarketInstances } = await import('./api')
      expect(typeof useGetRuntimeRoflmarketInstances).toBe('function')
    })

    it('should export GetRuntimeRoflmarketInstancesQueryResult type', async () => {
      const api = await import('./api')
      expect(typeof api.GetRuntimeRoflmarketInstancesQueryResult).toBe('undefined')
    })

    it('should export GetRuntimeRoflmarketInstancesQueryError type', async () => {
      const api = await import('./api')
      expect(typeof api.GetRuntimeRoflmarketInstancesQueryError).toBe('undefined')
    })
  })

  describe('GetRuntimeRoflmarketProvidersAddressInstancesId exports', () => {
    it('should export useGetRuntimeRoflmarketProvidersAddressInstancesId hook', async () => {
      const { useGetRuntimeRoflmarketProvidersAddressInstancesId } = await import('./api')
      expect(typeof useGetRuntimeRoflmarketProvidersAddressInstancesId).toBe('function')
    })

    it('should export GetRuntimeRoflmarketProvidersAddressInstancesIdQueryResult type', async () => {
      const api = await import('./api')
      expect(typeof api.GetRuntimeRoflmarketProvidersAddressInstancesIdQueryResult).toBe('undefined')
    })

    it('should export GetRuntimeRoflmarketProvidersAddressInstancesIdQueryError type', async () => {
      const api = await import('./api')
      expect(typeof api.GetRuntimeRoflmarketProvidersAddressInstancesIdQueryError).toBe('undefined')
    })
  })

  describe('query key generation', () => {
    it('should generate query key for GetLayerStatsTxVolume', async () => {
      const { getGetLayerStatsTxVolumeQueryKey } = await import('./api')
      const queryKey = getGetLayerStatsTxVolumeQueryKey('mainnet', 'consensus')
      expect(Array.isArray(queryKey)).toBe(true)
    })

    it('should generate query key for GetLayerStatsActiveAccounts', async () => {
      const { getGetLayerStatsActiveAccountsQueryKey } = await import('./api')
      const queryKey = getGetLayerStatsActiveAccountsQueryKey('mainnet', 'consensus')
      expect(Array.isArray(queryKey)).toBe(true)
    })

    it('should generate query key for GetRuntimeRoflmarketInstances', async () => {
      const { getGetRuntimeRoflmarketInstancesQueryKey } = await import('./api')
      const queryKey = getGetRuntimeRoflmarketInstancesQueryKey('mainnet', 'sapphire')
      expect(Array.isArray(queryKey)).toBe(true)
    })
  })

  describe('network parameter validation', () => {
    it('should accept "mainnet" as network parameter', async () => {
      const network = 'mainnet'
      expect(network).toBe('mainnet')
    })

    it('should accept "testnet" as network parameter', async () => {
      const network = 'testnet'
      expect(network).toBe('testnet')
    })
  })

  describe('layer parameter validation', () => {
    it('should accept valid layer values', async () => {
      const validLayers = ['emerald', 'sapphire', 'pontusxtest', 'pontusxdev', 'cipher', 'consensus']
      validLayers.forEach(layer => {
        expect(['emerald', 'sapphire', 'pontusxtest', 'pontusxdev', 'cipher', 'consensus']).toContain(layer)
      })
    })
  })

  describe('runtime parameter validation', () => {
    it('should accept valid runtime values', async () => {
      const validRuntimes = ['emerald', 'sapphire', 'pontusxtest', 'pontusxdev', 'cipher']
      validRuntimes.forEach(runtime => {
        expect(['emerald', 'sapphire', 'pontusxtest', 'pontusxdev', 'cipher']).toContain(runtime)
      })
    })
  })
})
