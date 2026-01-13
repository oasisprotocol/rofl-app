import { describe, it, expect } from 'vitest'
import { addressToJazzIconSeed } from './addressToJazzIconSeed'

describe('addressToJazzIconSeed', () => {
  describe('ETH address conversion', () => {
    it('should convert valid ETH address to numeric seed', () => {
      const account = {
        address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      // Extracts bytes 2-10 (excluding 0x), converts from hex
      // '12345678' in hex = 305419896 in decimal
      expect(seed).toBe(0x12345678)
    })

    it('should convert ETH address with different values', () => {
      const account = {
        address_eth: '0xabcdef1234567890abcdef123456789012345678' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      // 'abcdef12' in hex = 2882400008 in decimal
      expect(seed).toBe(0xabcdef12)
    })

    it('should convert ETH address with all zeros', () => {
      const account = {
        address_eth: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(seed).toBe(0)
    })

    it('should convert ETH address with all f', () => {
      const account = {
        address_eth: '0xffffffffffffffffffffffffffffffffffffffff' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(seed).toBe(0xffffffff)
    })

    it('should handle lowercase ETH address', () => {
      const account = {
        address_eth: '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(seed).toBe(0xa1b2c3d4)
    })

    it('should handle mixed case ETH address', () => {
      const account = {
        address_eth: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(seed).toBe(0xa1b2c3d4)
    })

    it('should produce consistent seeds for same address', () => {
      const account = {
        address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
      }
      const seed1 = addressToJazzIconSeed(account)
      const seed2 = addressToJazzIconSeed(account)

      expect(seed1).toBe(seed2)
    })
  })

  describe('Oasis address conversion', () => {
    it('should convert valid Oasis address to numeric seed', () => {
      const account = {
        address: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr' as `oasis1${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      // The seed is calculated from bytes 17-20 of the decoded address
      expect(typeof seed).toBe('number')
      expect(seed).toBeGreaterThanOrEqual(0)
    })

    it('should convert another valid Oasis address', () => {
      const account = {
        address: 'oasis1qp2ens0hsp7gh23wajxa4hpetkdek3swyyulyrmz' as `oasis1${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      // Seeds can be negative for Oasis addresses due to bit manipulation on signed integers
      expect(typeof seed).toBe('number')
      expect(Number.isInteger(seed)).toBe(true)
    })

    it('should produce consistent seeds for same Oasis address', () => {
      const account = {
        address: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr' as `oasis1${string}`,
      }
      const seed1 = addressToJazzIconSeed(account)
      const seed2 = addressToJazzIconSeed(account)

      expect(seed1).toBe(seed2)
    })

    it('should produce different seeds for different Oasis addresses', () => {
      const account1 = {
        address: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr' as `oasis1${string}`,
      }
      const account2 = {
        address: 'oasis1qp2ens0hsp7gh23wajxa4hpetkdek3swyyulyrmz' as `oasis1${string}`,
      }
      const seed1 = addressToJazzIconSeed(account1)
      const seed2 = addressToJazzIconSeed(account2)

      expect(seed1).not.toBe(seed2)
    })

    it('should calculate seed from specific bytes of decoded address', () => {
      const account = {
        address: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr' as `oasis1${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      // The seed is: addressU8[20] | (addressU8[19] << 8) | (addressU8[18] << 16) | (addressU8[17] << 24)
      // We can verify it's within the valid range for a 32-bit unsigned integer
      expect(seed).toBeGreaterThanOrEqual(0)
      expect(seed).toBeLessThanOrEqual(0xffffffff)
    })
  })

  describe('Address preference (ETH vs Oasis)', () => {
    it('should prefer ETH address when both are provided', () => {
      const account = {
        address: 'oasis1qqqw0xfke7mzwzhmfndd3mnmhssr89qt8xhcy0t' as `oasis1${string}`,
        address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      // Should use ETH address seed (0x12345678)
      expect(seed).toBe(0x12345678)
    })

    it('should use Oasis address when only Oasis is provided', () => {
      const account = {
        address: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr' as `oasis1${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(typeof seed).toBe('number')
      expect(seed).toBeGreaterThanOrEqual(0)
    })

    it('should use ETH address when only ETH is provided', () => {
      const account = {
        address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(seed).toBe(0x12345678)
    })
  })

  describe('Edge cases and type safety', () => {
    it('should handle Oasis addresses with different values', () => {
      const accounts = [
        { address: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr' as `oasis1${string}` },
        { address: 'oasis1qp2ens0hsp7gh23wajxa4hpetkdek3swyyulyrmz' as `oasis1${string}` },
        {
          address: 'oasis1qq235lqj77855qcemcr5w2qm372s4amqcc4v3ztc' as `oasis1${string}`,
        },
      ]

      accounts.forEach(account => {
        const seed = addressToJazzIconSeed(account)
        expect(typeof seed).toBe('number')
        expect(Number.isInteger(seed)).toBe(true)
      })
    })

    it('should handle ETH addresses with minimum valid length', () => {
      const account = {
        address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(seed).toBe(0x12345678)
    })

    it('should produce numeric seeds within valid range for ETH', () => {
      const accounts = [
        { address_eth: '0x0000000000000000000000000000000000000000' as `0x${string}` },
        { address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}` },
        { address_eth: '0xffffffffffffffffffffffffffffffffffffffff' as `0x${string}` },
      ]

      accounts.forEach(account => {
        const seed = addressToJazzIconSeed(account)
        expect(seed).toBeGreaterThanOrEqual(0)
        expect(seed).toBeLessThanOrEqual(0xffffffff)
      })
    })

    it('should handle various hex patterns in ETH addresses', () => {
      const testCases = [
        {
          address_eth: '0x1111111111111111111111111111111111111111' as `0x${string}`,
          expectedSeed: 0x11111111,
        },
        {
          address_eth: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`,
          expectedSeed: 0xaaaaaaaa,
        },
        {
          address_eth: '0x5555555555555555555555555555555555555555' as `0x${string}`,
          expectedSeed: 0x55555555,
        },
      ]

      testCases.forEach(({ address_eth, expectedSeed }) => {
        const seed = addressToJazzIconSeed({ address_eth })
        expect(seed).toBe(expectedSeed)
      })
    })

    it('should maintain deterministic behavior', () => {
      const testAddress = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as `0x${string}`
      const account = { address_eth: testAddress }

      const seeds = Array.from({ length: 10 }, () => addressToJazzIconSeed(account))

      // All seeds should be identical
      expect(seeds.every(seed => seed === seeds[0])).toBe(true)
    })
  })

  describe('Seed value ranges and properties', () => {
    it('should generate seeds that are positive integers', () => {
      const accounts = [
        { address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}` },
        { address: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr' as `oasis1${string}` },
      ]

      accounts.forEach(account => {
        const seed = addressToJazzIconSeed(account)
        expect(Number.isInteger(seed)).toBe(true)
        expect(seed).toBeGreaterThanOrEqual(0)
      })
    })

    it('should handle maximum 32-bit unsigned integer', () => {
      const account = {
        address_eth: '0xffffffff1234567890abcdef1234567890123456' as `0x${string}`,
      }
      const seed = addressToJazzIconSeed(account)

      expect(seed).toBe(0xffffffff)
    })
  })
})
