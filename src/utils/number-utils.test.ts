import { describe, it, expect } from 'vitest'
import { fromBaseUnits, convertToNano, multiplyBaseUnits } from './number-utils'

describe('number-utils', () => {
  describe('fromBaseUnits', () => {
    it('should convert value with default 18 decimals', () => {
      expect(fromBaseUnits('1000000000000000000')).toBe('1')
      expect(fromBaseUnits('100000000000000000')).toBe('0.1')
      expect(fromBaseUnits('10000000000000000')).toBe('0.01')
    })

    it('should convert value with custom decimals', () => {
      expect(fromBaseUnits('1000000', 6)).toBe('1')
      expect(fromBaseUnits('100000', 5)).toBe('1')
      expect(fromBaseUnits('100', 2)).toBe('1')
    })

    it('should handle zero', () => {
      expect(fromBaseUnits('0')).toBe('0')
    })

    it('should handle fractional values correctly', () => {
      expect(fromBaseUnits('1500000000000000000')).toBe('1.5')
      expect(fromBaseUnits('1234567890000000000')).toBe('1.23456789')
    })

    it('should handle large numbers', () => {
      expect(fromBaseUnits('1000000000000000000000')).toBe('1000')
    })

    it('should handle negative decimals (conversion to larger units)', () => {
      expect(fromBaseUnits('1', -9)).toBe('1000000000')
      expect(fromBaseUnits('100', -9)).toBe('100000000000')
    })

    it('should handle very small decimal values', () => {
      expect(fromBaseUnits('1', 0)).toBe('1')
      expect(fromBaseUnits('100', 2)).toBe('1')
    })

    it('should handle very large decimal values', () => {
      expect(fromBaseUnits('1000000000000000000', 30)).toBe('0.000000000001')
    })

    it('should throw error for invalid input', () => {
      expect(() => fromBaseUnits('invalid')).toThrow('Not a number')
      expect(() => fromBaseUnits('NaN')).toThrow('Not a number')
      expect(() => fromBaseUnits('')).toThrow()
    })

    it('should preserve precision for exact conversions', () => {
      expect(fromBaseUnits('1000000000000000000', 18)).toBe('1')
      expect(fromBaseUnits('500000000000000000', 18)).toBe('0.5')
    })
  })

  describe('convertToNano', () => {
    it('should convert value to nano units (-9 decimals)', () => {
      expect(convertToNano('1')).toBe('1000000000')
      expect(convertToNano('100')).toBe('100000000000')
      expect(convertToNano('0.5')).toBe('500000000')
    })

    it('should handle zero', () => {
      expect(convertToNano('0')).toBe('0')
    })

    it('should handle very small values', () => {
      expect(convertToNano('0.000000001')).toBe('1')
      expect(convertToNano('0.0000000001')).toBe('0.1')
    })

    it('should handle large values', () => {
      expect(convertToNano('1000000')).toBe('1000000000000000')
      expect(convertToNano('0.000001')).toBe('1000')
    })

    it('should throw error for invalid input', () => {
      expect(() => convertToNano('invalid')).toThrow('Not a number')
      expect(() => convertToNano('NaN')).toThrow('Not a number')
      expect(() => convertToNano('')).toThrow()
    })

    it('should handle scientific notation input', () => {
      expect(convertToNano('1e-9')).toBe('1')
      expect(convertToNano('1e-6')).toBe('1000')
    })
  })

  describe('multiplyBaseUnits', () => {
    it('should multiply base units with number multiplier', () => {
      expect(multiplyBaseUnits('1000000000000000000', 2)).toBe('2000000000000000000')
      expect(multiplyBaseUnits('500000000000000000', 3)).toBe('1500000000000000000')
    })

    it('should multiply base units with string multiplier', () => {
      expect(multiplyBaseUnits('1000000000000000000', '2')).toBe('2000000000000000000')
      expect(multiplyBaseUnits('1000000000000000000', '1.5')).toBe('1500000000000000000')
    })

    it('should handle zero', () => {
      expect(multiplyBaseUnits('1000000000000000000', 0)).toBe('0')
      expect(multiplyBaseUnits('0', 5)).toBe('0')
    })

    it('should handle decimal multipliers', () => {
      expect(multiplyBaseUnits('1000000000000000000', '0.5')).toBe('500000000000000000')
      expect(multiplyBaseUnits('2000000000000000000', '2.5')).toBe('5000000000000000000')
    })

    it('should return result with no decimal places', () => {
      const result = multiplyBaseUnits('1000000000000000000', '1.333333333333333333')
      expect(result).toMatch(/^\d+$/)
    })

    it('should throw error for invalid base units', () => {
      expect(() => multiplyBaseUnits('invalid', 2)).toThrow('Invalid base units value')
      expect(() => multiplyBaseUnits('NaN', 2)).toThrow('Invalid base units value')
      expect(() => multiplyBaseUnits('', 2)).toThrow('Invalid base units value')
    })

    it('should throw error for invalid multiplier', () => {
      expect(() => multiplyBaseUnits('1000000000000000000', 'invalid')).toThrow('Invalid multiplier')
      expect(() => multiplyBaseUnits('1000000000000000000', 'NaN')).toThrow('Invalid multiplier')
      expect(() => multiplyBaseUnits('1000000000000000000', '')).toThrow('Invalid multiplier')
    })

    it('should handle very large base units', () => {
      const result = multiplyBaseUnits('1000000000000000000000', 10)
      expect(result).toBe('10000000000000000000000')
    })

    it('should handle fractional multipliers with high precision', () => {
      expect(multiplyBaseUnits('1000000000000000000', '0.1')).toBe('100000000000000000')
      expect(multiplyBaseUnits('1000000000000000000', '0.01')).toBe('10000000000000000')
    })

    it('should handle negative multipliers', () => {
      expect(multiplyBaseUnits('1000000000000000000', -2)).toBe('-2000000000000000000')
      expect(multiplyBaseUnits('1000000000000000000', '-1.5')).toBe('-1500000000000000000')
    })
  })
})
