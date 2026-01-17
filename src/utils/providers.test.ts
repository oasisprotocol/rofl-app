import { describe, it, expect } from 'vitest'
import { WHITELISTED_PROVIDER_ADDRESSES, getWhitelistedProviders } from './providers'

describe('providers', () => {
  describe('WHITELISTED_PROVIDER_ADDRESSES', () => {
    it('should have mainnet address', () => {
      expect(WHITELISTED_PROVIDER_ADDRESSES.mainnet).toBe('oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr')
    })

    it('should have testnet address', () => {
      expect(WHITELISTED_PROVIDER_ADDRESSES.testnet).toBe('oasis1qp2ens0hsp7gh23wajxa4hpetkdek3swyyulyrmz')
    })
  })

  describe('getWhitelistedProviders', () => {
    const mainnetAddress = WHITELISTED_PROVIDER_ADDRESSES.mainnet
    const testnetAddress = WHITELISTED_PROVIDER_ADDRESSES.testnet

    it('should return empty array when providers is undefined', () => {
      expect(getWhitelistedProviders(undefined, 'mainnet')).toEqual([])
      expect(getWhitelistedProviders(undefined, 'testnet')).toEqual([])
    })

    it('should return empty array when providers is null', () => {
      expect(getWhitelistedProviders(null as any, 'mainnet')).toEqual([])
    })

    it('should return empty array when providers is empty', () => {
      expect(getWhitelistedProviders([], 'mainnet')).toEqual([])
    })

    it('should filter providers by mainnet address', () => {
      const providers = [
        { address: mainnetAddress, metadata: { name: 'Mainnet Provider' } },
        { address: 'oasis1otheraddress', metadata: { name: 'Other Provider' } },
        { address: testnetAddress, metadata: { name: 'Testnet Provider' } },
      ]

      const result = getWhitelistedProviders(providers, 'mainnet')
      expect(result).toHaveLength(1)
      expect(result[0].address).toBe(mainnetAddress)
      expect(result[0].metadata?.name).toBe('Mainnet Provider')
    })

    it('should filter providers by testnet address', () => {
      const providers = [
        { address: mainnetAddress, metadata: { name: 'Mainnet Provider' } },
        { address: 'oasis1otheraddress', metadata: { name: 'Other Provider' } },
        { address: testnetAddress, metadata: { name: 'Testnet Provider' } },
      ]

      const result = getWhitelistedProviders(providers, 'testnet')
      expect(result).toHaveLength(1)
      expect(result[0].address).toBe(testnetAddress)
      expect(result[0].metadata?.name).toBe('Testnet Provider')
    })

    it('should return all providers that match the whitelisted address', () => {
      const providers = [
        { address: mainnetAddress, metadata: { name: 'Provider 1' } },
        { address: mainnetAddress, metadata: { name: 'Provider 2' } },
        { address: 'oasis1otheraddress', metadata: { name: 'Other' } },
      ]

      const result = getWhitelistedProviders(providers, 'mainnet')
      expect(result).toHaveLength(2)
      expect(result[0].metadata?.name).toBe('Provider 1')
      expect(result[1].metadata?.name).toBe('Provider 2')
    })

    it('should handle providers without metadata', () => {
      const providers = [{ address: mainnetAddress }, { address: 'oasis1otheraddress' }] as any

      const result = getWhitelistedProviders(providers, 'mainnet')
      expect(result).toHaveLength(1)
      expect(result[0].address).toBe(mainnetAddress)
    })

    it('should return empty array when no providers match', () => {
      const providers = [
        { address: 'oasis1otheraddress1', metadata: { name: 'Other 1' } },
        { address: 'oasis1otheraddress2', metadata: { name: 'Other 2' } },
      ]

      expect(getWhitelistedProviders(providers, 'mainnet')).toEqual([])
      expect(getWhitelistedProviders(providers, 'testnet')).toEqual([])
    })
  })
})
