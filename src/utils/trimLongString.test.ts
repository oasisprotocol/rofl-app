import { describe, it, expect } from 'vitest'
import { trimLongString } from './trimLongString'

describe('trimLongString', () => {
  describe('Basic Functionality', () => {
    it('should not trim short strings', () => {
      const result = trimLongString('short', 10, 10)
      expect(result).toBe('short')
    })

    it('should trim long strings with default values', () => {
      const result = trimLongString('01234567890123456789012345678901')
      expect(result).toBe('012345…678901')
    })

    it('should trim long strings with custom trim values', () => {
      const result = trimLongString('01234567890123456789', 4, 4)
      expect(result).toBe('0123…6789')
    })

    it('should handle custom ellipsis', () => {
      const result = trimLongString('01234567890123456789012345678901', 6, 6, '...')
      expect(result).toBe('012345...678901')
    })

    it('should handle zero trimEnd', () => {
      const result = trimLongString('0123456789', 4, 0)
      expect(result).toBe('0123…')
    })

    it('should return original string when trimmed length equals string length', () => {
      const result = trimLongString('012345', 6, 6)
      expect(result).toBe('012345')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const result = trimLongString('', 6, 6)
      expect(result).toBeUndefined()
    })

    it('should handle undefined input', () => {
      const result = trimLongString(undefined as any, 6, 6)
      expect(result).toBeUndefined()
    })

    it('should handle null input', () => {
      const result = trimLongString(null as any, 6, 6)
      expect(result).toBeUndefined()
    })

    it('should handle single character string', () => {
      const result = trimLongString('a', 6, 6)
      expect(result).toBe('a')
    })

    it('should handle two character string', () => {
      const result = trimLongString('ab', 6, 6)
      expect(result).toBe('ab')
    })

    it('should handle string exactly at trim boundary', () => {
      const result = trimLongString('0123456', 3, 3)
      // trimStart (3) + ellipsis (1) + trimEnd (3) = 7, which equals length
      expect(result).toBe('012…456')
    })

    it('should handle string one char over trim boundary', () => {
      const result = trimLongString('01234567', 3, 3)
      // trimStart (3) + ellipsis (1) + trimEnd (3) = 7, which is less than 8
      expect(result).toBe('012…567')
    })

    it('should handle very long string', () => {
      const longString = 'a'.repeat(1000)
      const result = trimLongString(longString, 10, 10)
      expect(result).toBe('aaaaaaaaaa…aaaaaaaaaa')
      expect(result?.length).toBe(21) // 10 + 1 + 10
    })

    it('should handle negative trimStart', () => {
      const result = trimLongString('0123456789', -5, 3)
      // Math.max(-5, 1) = 1
      expect(result).toBe('0…789')
    })

    it('should handle negative trimEnd', () => {
      const result = trimLongString('0123456789', 3, -5)
      // Math.max(-5, 0) = 0, but slice(-0) returns empty string, so it returns full string
      expect(result).toBe('012…0123456789')
    })

    it('should handle zero trimStart', () => {
      const result = trimLongString('0123456789', 0, 3)
      // Math.max(0, 1) = 1
      expect(result).toBe('0…789')
    })

    it('should handle both trimStart and trimEnd as zero', () => {
      const result = trimLongString('0123456789', 0, 0)
      // Math.max(0, 1) = 1 for trimStart, Math.max(0, 0) = 0 for trimEnd
      expect(result).toBe('0…')
    })
  })

  describe('Unicode and Special Characters', () => {
    it('should handle Unicode characters', () => {
      const result = trimLongString('Hello世界🌍World', 5, 5)
      // slice works on character positions, not grapheme clusters
      expect(result).toBe('Hello…World')
    })

    it('should handle emoji strings', () => {
      const result = trimLongString('😀😁😂🤣😃😄😅😆😉😊', 2, 2)
      // Emojis are multiple bytes but single positions in slice
      expect(result).toBe('😀…😊')
    })

    it('should handle mixed emoji and text', () => {
      const result = trimLongString('Hello🌍World🚀Test', 5, 4)
      expect(result).toBe('Hello…Test')
    })

    it('should handle special characters', () => {
      const result = trimLongString('a@b$c%d^e&f*g', 3, 3)
      expect(result).toBe('a@b…f*g')
    })

    it('should handle newlines and tabs', () => {
      const result = trimLongString('012345\n\t6789', 3, 2)
      expect(result).toBe('012…89')
    })

    it('should handle zero-width characters', () => {
      const result = trimLongString('012345\u200B6789', 3, 2)
      expect(result).toBe('012…89')
    })
  })

  describe('Ellipsis Variations', () => {
    it('should handle single character ellipsis', () => {
      const result = trimLongString('0123456789', 3, 3, '-')
      // slice(0, 3) = '012', slice(-3) = '789'
      expect(result).toBe('012-789')
    })

    it('should handle multi-character ellipsis', () => {
      const result = trimLongString('0123456789', 3, 3, '...')
      // 3 + 3 + 3 = 9, which is less than 10
      expect(result).toBe('012...789')
    })

    it('should handle empty string ellipsis', () => {
      const result = trimLongString('0123456789', 3, 3, '')
      // 3 + 0 + 3 = 6, which is less than 10
      expect(result).toBe('012789')
    })

    it('should handle very long ellipsis', () => {
      const result = trimLongString('0123456789', 2, 2, '......')
      // 2 + 6 + 2 = 10, which equals length
      expect(result).toBe('01......89')
    })

    it('should handle emoji ellipsis', () => {
      const result = trimLongString('0123456789', 3, 3, '💫')
      expect(result).toBe('012💫789')
    })

    it('should handle Unicode ellipsis', () => {
      const result = trimLongString('0123456789', 3, 3, '⋯')
      expect(result).toBe('012⋯789')
    })
  })

  describe('Boundary Conditions', () => {
    it('should handle string length equal to trimStart + ellipsis + 1', () => {
      const result = trimLongString('0123456', 5, 1)
      // 5 + 1 + 1 = 7, which equals length
      expect(result).toBe('01234…6')
    })

    it('should handle string length equal to trimStart + ellipsis + trimEnd', () => {
      const result = trimLongString('0123456789', 4, 5)
      // 4 + 1 + 5 = 10, which equals length
      expect(result).toBe('0123…56789')
    })

    it('should handle very large trimStart', () => {
      const result = trimLongString('0123456789', 100, 3)
      expect(result).toBe('0123456789')
    })

    it('should handle very large trimEnd', () => {
      const result = trimLongString('0123456789', 3, 100)
      expect(result).toBe('0123456789')
    })

    it('should handle both trimStart and trimEnd very large', () => {
      const result = trimLongString('0123456789', 100, 100)
      expect(result).toBe('0123456789')
    })
  })

  describe('Real-World Use Cases', () => {
    it('should trim Ethereum addresses', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
      const result = trimLongString(address, 6, 4)
      expect(result).toBe('0x742d…0bEb')
    })

    it('should trim transaction hashes', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const result = trimLongString(txHash, 10, 8)
      expect(result).toBe('0x12345678…90abcdef')
    })

    it('should trim URLs', () => {
      const url = 'https://example.com/very/long/path/that/needs/to/be/trimmed'
      const result = trimLongString(url, 20, 10)
      expect(result).toBe('https://example.com/…be/trimmed')
    })

    it('should trim email addresses', () => {
      const email = 'very.long.email.address@example.com'
      const result = trimLongString(email, 10, 10)
      expect(result).toBe('very.long.…xample.com')
    })

    it('should trim file paths', () => {
      const path = '/very/long/path/to/some/file.txt'
      const result = trimLongString(path, 10, 8)
      expect(result).toBe('/very/long…file.txt')
    })
  })

  describe('Consistency', () => {
    it('should produce consistent results for same input', () => {
      const input = '01234567890123456789012345678901'
      const result1 = trimLongString(input, 6, 6)
      const result2 = trimLongString(input, 6, 6)
      expect(result1).toBe(result2)
    })

    it('should handle multiple calls with different parameters', () => {
      const input = '01234567890123456789012345678901'
      const result1 = trimLongString(input, 5, 5)
      const result2 = trimLongString(input, 6, 6)
      const result3 = trimLongString(input, 7, 7)
      expect(result1).toBe('01234…78901')
      expect(result2).toBe('012345…678901')
      expect(result3).toBe('0123456…5678901')
    })
  })
})
