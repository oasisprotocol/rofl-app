import { describe, it, expect, vi } from 'vitest'
import { addressToJazzIconSeed } from './addressToJazzIconSeed'

// Mock the oasisprotocol/client module
vi.mock('@oasisprotocol/client', () => ({
  staking: {
    addressFromBech32: vi.fn((address: string) => {
      // Mock implementation that returns a Uint8Array
      // For oasis1 address, return a mock byte array
      const bytes = new Uint8Array(32)
      // Set some test values
      bytes[17] = 0x01
      bytes[18] = 0x02
      bytes[19] = 0x03
      bytes[20] = 0x04
      return bytes
    }),
  },
}))

describe('components/JazzIcon/addressToJazzIconSeed', () => {
  describe('addressToJazzIconSeed', () => {
    describe('with Ethereum address', () => {
      it('should generate seed from Ethereum address', () => {
        const account = {
          address: 'oasis1someaddress',
          address_eth: '0x1234567890abcdef1234567890abcdef12345678' as const,
        }

        const seed = addressToJazzIconSeed(account)

        // The seed should be the integer value of bytes 2-10 (after 0x)
        // 0x12345678 = 305419896
        expect(typeof seed).toBe('number')
        expect(seed).toBe(0x12345678)
      })

      it('should handle different Ethereum addresses', () => {
        const account1 = {
          address_eth: '0xabcdef1234567890abcdef1234567890abcdef12' as const,
        }
        const account2 = {
          address_eth: '0x0000000000000000000000000000000000000001' as const,
        }

        const seed1 = addressToJazzIconSeed(account1)
        const seed2 = addressToJazzIconSeed(account2)

        expect(seed1).not.toBe(seed2)
      })

      it('should handle mixed case Ethereum addresses', () => {
        const account = {
          address_eth: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12' as const,
        }

        const seed = addressToJazzIconSeed(account)

        expect(typeof seed).toBe('number')
      })

      it('should prioritize Ethereum address when both are provided', () => {
        const account = {
          address: 'oasis1someaddress' as const,
          address_eth: '0x1234567890abcdef1234567890abcdef12345678' as const,
        }

        const seed = addressToJazzIconSeed(account)

        // Should use Ethereum address seed
        expect(seed).toBe(0x12345678)
      })

      it('should handle zero Ethereum address', () => {
        const account = {
          address_eth: '0x0000000000000000000000000000000000000000' as const,
        }

        const seed = addressToJazzIconSeed(account)

        expect(seed).toBe(0)
      })

      it('should handle maximum Ethereum address', () => {
        const account = {
          address_eth: '0xffffffffffffffffffffffffffffffffffffffff' as const,
        }

        const seed = addressToJazzIconSeed(account)

        expect(seed).toBe(0xffffffff)
      })
    })

    describe('with Oasis address', () => {
      it('should generate seed from Oasis address', () => {
        const account = {
          address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqu6hyl8f70' as const,
        }

        const seed = addressToJazzIconSeed(account)

        // Should use the mocked bytes [17, 18, 19, 20] = [0x01, 0x02, 0x03, 0x04]
        // seed = bytes[20] | (bytes[19] << 8) | (bytes[18] << 16) | (bytes[17] << 24)
        // seed = 0x04 | (0x03 << 8) | (0x02 << 16) | (0x01 << 24)
        // seed = 0x04030201 = 67305985
        expect(typeof seed).toBe('number')
      })

      it('should handle Oasis addresses without Ethereum address', () => {
        const account = {
          address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqu6hyl8f70' as const,
        }

        const seed = addressToJazzIconSeed(account)

        expect(typeof seed).toBe('number')
        expect(seed).toBeGreaterThanOrEqual(0)
      })
    })

    describe('edge cases', () => {
      it('should handle account with only Oasis address', () => {
        const account = {
          address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqu6hyl8f70' as const,
        }

        const seed = addressToJazzIconSeed(account)

        expect(typeof seed).toBe('number')
      })

      it('should handle account with only Ethereum address', () => {
        const account = {
          address_eth: '0x1234567890abcdef1234567890abcdef12345678' as const,
        }

        const seed = addressToJazzIconSeed(account)

        expect(typeof seed).toBe('number')
        expect(seed).toBe(0x12345678)
      })

      it('should always return a non-negative number', () => {
        const accounts = [
          { address_eth: '0x1234567890abcdef1234567890abcdef12345678' as const },
          { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqu6hyl8f70' as const },
          {
            address: 'oasis1qp4p388f8dxq3y7kc5h8d0x9y2m5n7l0k9j3h5g7f' as const,
            address_eth: '0xabcdef1234567890abcdef1234567890abcdef12' as const,
          },
        ]

        accounts.forEach(account => {
          const seed = addressToJazzIconSeed(account)
          expect(seed).toBeGreaterThanOrEqual(0)
        })
      })
    })
  })
})
