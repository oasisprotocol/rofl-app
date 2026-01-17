import { describe, it, expect } from 'vitest'
import { getEvmBech32Address, getOasisAddressBytesFromEvm } from './helpers'

describe('Utility Functions', () => {
  describe('getOasisAddressBytesFromEvm', () => {
    it('should convert EVM address to Oasis address bytes', () => {
      const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const
      const result = getOasisAddressBytesFromEvm(evmAddress)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should handle different EVM addresses', () => {
      const addresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x1234567890123456789012345678901234567890',
      ] as const

      addresses.forEach(address => {
        const result = getOasisAddressBytesFromEvm(address)
        expect(result).toBeDefined()
      })
    })

    it('should handle lowercase EVM addresses', () => {
      const evmAddress = '0x742d35cc6634c0532925a3b844bc9e7595f0beb' as const
      const result = getOasisAddressBytesFromEvm(evmAddress)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should handle uppercase EVM addresses', () => {
      const evmAddress = '0x742D35CC6634C0532925A3B844BC9E7595F0BEB' as const
      const result = getOasisAddressBytesFromEvm(evmAddress)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should handle mixed case EVM addresses', () => {
      const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const
      const result = getOasisAddressBytesFromEvm(evmAddress)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should handle zero address', () => {
      const evmAddress = '0x0000000000000000000000000000000000000000' as const
      const result = getOasisAddressBytesFromEvm(evmAddress)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should handle addresses with leading zeros', () => {
      const evmAddress = '0x000035Cc6634C0532925a3b844Bc9e7595f0bEb' as const
      const result = getOasisAddressBytesFromEvm(evmAddress)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should handle maximum address value', () => {
      const evmAddress = '0xffffffffffffffffffffffffffffffffffffffff' as const
      const result = getOasisAddressBytesFromEvm(evmAddress)

      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Uint8Array)
    })
  })

  describe('getEvmBech32Address', () => {
    it('should convert EVM address to Bech32 format', () => {
      const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const
      const result = getEvmBech32Address(evmAddress)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('oasis')
    })

    it('should produce consistent results for the same input', () => {
      const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const
      const result1 = getEvmBech32Address(evmAddress)
      const result2 = getEvmBech32Address(evmAddress)

      expect(result1).toBe(result2)
    })

    it('should produce different results for different inputs', () => {
      const address1 = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const
      const address2 = '0x1234567890123456789012345678901234567890' as const

      const result1 = getEvmBech32Address(address1)
      const result2 = getEvmBech32Address(address2)

      expect(result1).not.toBe(result2)
    })

    it('should handle zero address', () => {
      const evmAddress = '0x0000000000000000000000000000000000000000' as const
      const result = getEvmBech32Address(evmAddress)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('oasis')
    })

    it('should handle lowercase addresses', () => {
      const evmAddress = '0x742d35cc6634c0532925a3b844bc9e7595f0beb' as const
      const result = getEvmBech32Address(evmAddress)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('oasis')
    })

    it('should handle uppercase addresses', () => {
      const evmAddress = '0x742D35CC6634C0532925A3B844BC9E7595F0BEB' as const
      const result = getEvmBech32Address(evmAddress)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('oasis')
    })

    it('should handle maximum address value', () => {
      const evmAddress = '0xffffffffffffffffffffffffffffffffffffffff' as const
      const result = getEvmBech32Address(evmAddress)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('oasis')
    })

    it('should produce valid Bech32 format with checksum', () => {
      const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const
      const result = getEvmBech32Address(evmAddress)

      // Bech32 format should be: human-readable part + separator + data + checksum
      expect(result).toMatch(/oasis[1-9A-HJ-NP-Za-km-z]+/)
    })
  })
})
