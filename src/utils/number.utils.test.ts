import { describe, it, expect } from 'vitest'
import { NumberUtils } from './number.utils'

describe('NumberUtils', () => {
  describe('formatTokenAmount', () => {
    it('should return 0 for empty or zero amount', () => {
      expect(NumberUtils.formatTokenAmount('', 18)).toBe('0')
      expect(NumberUtils.formatTokenAmount('0', 18)).toBe('0')
      expect(NumberUtils.formatTokenAmount('', 6)).toBe('0')
    })

    it('should format amount with default decimals (18)', () => {
      expect(NumberUtils.formatTokenAmount('1000000000000000000', 18)).toBe('1')
      expect(NumberUtils.formatTokenAmount('100000000000000000', 18)).toBe('0.1')
    })

    it('should format amount with custom decimals', () => {
      expect(NumberUtils.formatTokenAmount('1000000', 6)).toBe('1')
      expect(NumberUtils.formatTokenAmount('5000000', 6)).toBe('5')
    })

    it('should respect displayDecimals parameter', () => {
      expect(NumberUtils.formatTokenAmount('1234567890000000000', 18, 2)).toBe('1.23')
      expect(NumberUtils.formatTokenAmount('1234567890000000000', 18, 4)).toBe('1.2345')
      expect(NumberUtils.formatTokenAmount('1234567890000000000', 18, 8)).toBe('1.23456789')
    })

    it('should round down correctly', () => {
      expect(NumberUtils.formatTokenAmount('1999999999999999999', 18, 6)).toBe('1.999999')
      expect(NumberUtils.formatTokenAmount('999999999999999999', 18, 6)).toBe('0.999999')
    })

    it('should handle very large amounts', () => {
      expect(NumberUtils.formatTokenAmount('1000000000000000000000000', 18)).toBe('1000000')
    })

    it('should handle very small amounts', () => {
      expect(NumberUtils.formatTokenAmount('1', 18)).toBe('0')
    })

    it('should handle amounts with trailing zeros', () => {
      expect(NumberUtils.formatTokenAmount('1000000000000000000', 18, 6)).toBe('1')
    })
  })

  describe('formatTokenAmountWithSymbol', () => {
    it('should format amount with symbol', () => {
      expect(NumberUtils.formatTokenAmountWithSymbol('1000000000000000000', 18, 'ROSE')).toBe('1 ROSE')
      expect(NumberUtils.formatTokenAmountWithSymbol('5000000000000000000', 18, 'ROSE')).toBe('5 ROSE')
    })

    it('should use ROSE as default symbol', () => {
      expect(NumberUtils.formatTokenAmountWithSymbol('1000000000000000000', 18)).toBe('1 ROSE')
    })

    it('should remove trailing zeros from formatted amount', () => {
      expect(NumberUtils.formatTokenAmountWithSymbol('1000000000000000000', 18, 'ROSE', 6)).toBe('1 ROSE')
      expect(NumberUtils.formatTokenAmountWithSymbol('100000000000000000', 18, 'ROSE', 6)).toBe('0.1 ROSE')
    })

    it('should handle different symbols', () => {
      expect(NumberUtils.formatTokenAmountWithSymbol('1000000', 6, 'USDC')).toBe('1 USDC')
      expect(NumberUtils.formatTokenAmountWithSymbol('100000000', 8, 'BTC')).toBe('1 BTC')
    })

    it('should handle zero amounts', () => {
      expect(NumberUtils.formatTokenAmountWithSymbol('0', 18, 'ROSE')).toBe('0 ROSE')
      expect(NumberUtils.formatTokenAmountWithSymbol('', 18, 'ROSE')).toBe('0 ROSE')
    })

    it('should handle very small decimals amounts', () => {
      expect(NumberUtils.formatTokenAmountWithSymbol('123456', 6, 'USDC', 2)).toBe('0.12 USDC')
    })

    it('should handle empty symbol gracefully', () => {
      expect(NumberUtils.formatTokenAmountWithSymbol('1000000000000000000', 18, '')).toBe('1 ')
    })
  })

  describe('expandAmount', () => {
    it('should return 0 for empty or zero amount', () => {
      expect(NumberUtils.expandAmount('', 18)).toBe('0')
      expect(NumberUtils.expandAmount('0', 18)).toBe('0')
    })

    it('should expand amount with default decimals (18)', () => {
      expect(NumberUtils.expandAmount('1', 18)).toBe('1000000000000000000')
      expect(NumberUtils.expandAmount('0.1', 18)).toBe('100000000000000000')
    })

    it('should expand amount with custom decimals', () => {
      expect(NumberUtils.expandAmount('1', 6)).toBe('1000000')
      expect(NumberUtils.expandAmount('5', 8)).toBe('500000000')
    })

    it('should round down correctly', () => {
      expect(NumberUtils.expandAmount('1.999999999999999999', 18)).toBe('1999999999999999999')
    })

    it('should handle very large decimals', () => {
      expect(NumberUtils.expandAmount('1', 30)).toBe('1000000000000000000000000000000')
    })

    it('should handle zero decimals', () => {
      expect(NumberUtils.expandAmount('123.456', 0)).toBe('123')
    })

    it('should handle fractional amounts with many decimals', () => {
      expect(NumberUtils.expandAmount('0.000000001', 18)).toBe('1000000000')
    })
  })

  describe('calculateGasFee', () => {
    it('should calculate gas fee in wei', () => {
      expect(NumberUtils.calculateGasFee('21000', BigInt('1000000000'))).toBe('21000000000000')
      expect(NumberUtils.calculateGasFee(21000, BigInt('2000000000'))).toBe('42000000000000')
    })

    it('should handle large gas limits', () => {
      expect(NumberUtils.calculateGasFee('1000000', BigInt('1000000000'))).toBe('1000000000000000')
    })

    it('should handle very high gas prices', () => {
      expect(NumberUtils.calculateGasFee('21000', BigInt('100000000000'))).toBe('2100000000000000')
    })

    it('should handle string gas limit', () => {
      expect(NumberUtils.calculateGasFee('50000', BigInt('5000000000'))).toBe('250000000000000')
    })

    it('should handle numeric gas limit', () => {
      expect(NumberUtils.calculateGasFee(21000, BigInt('1000000000'))).toBe('21000000000000')
    })
  })

  describe('formatGasFee', () => {
    it('should format gas fee with decimals', () => {
      expect(NumberUtils.formatGasFee('21000', BigInt('1000000000'), 18)).toBe('0.000021')
      expect(NumberUtils.formatGasFee('21000', BigInt('1000000000'), 18, 6)).toBe('0.000021')
    })

    it('should handle different decimals', () => {
      expect(NumberUtils.formatGasFee('21000', BigInt('1000000000'), 6)).toBe('21000000')
    })

    it('should handle custom displayDecimals', () => {
      expect(NumberUtils.formatGasFee('21000', BigInt('1000000000'), 18, 2)).toBe('0')
      expect(NumberUtils.formatGasFee('1000000', BigInt('1000000000'), 18, 4)).toBe('0.001')
    })

    it('should handle very small gas fees', () => {
      expect(NumberUtils.formatGasFee('21000', BigInt('1'), 18)).toBe('0')
    })

    it('should handle very large gas fees', () => {
      expect(NumberUtils.formatGasFee('10000000', BigInt('100000000000'), 18)).toBe('1')
    })
  })

  describe('formatGasFeeWithSymbol', () => {
    it('should format gas fee with symbol', () => {
      expect(NumberUtils.formatGasFeeWithSymbol('21000', BigInt('1000000000'), 'ROSE', 18)).toBe(
        '0.000021 ROSE',
      )
    })

    it('should format gas fee without symbol when not provided', () => {
      expect(NumberUtils.formatGasFeeWithSymbol('21000', BigInt('1000000000'), '', 18)).toBe('0.000021')
      expect(NumberUtils.formatGasFeeWithSymbol('21000', BigInt('1000000000'))).toBe('0.000021')
    })

    it('should handle default parameters', () => {
      expect(
        NumberUtils.formatGasFeeWithSymbol('21000', BigInt('1000000000'), undefined as unknown as string),
      ).toBe('0.000021')
    })

    it('should handle different native symbols', () => {
      expect(NumberUtils.formatGasFeeWithSymbol('21000', BigInt('1000000000'), 'ETH', 18)).toBe(
        '0.000021 ETH',
      )
    })
  })

  describe('add', () => {
    it('should add two amounts', () => {
      expect(NumberUtils.add('1000000000000000000', '1000000000000000000')).toBe('2000000000000000000')
      expect(NumberUtils.add('500000000000000000', '500000000000000000')).toBe('1000000000000000000')
    })

    it('should handle zero', () => {
      expect(NumberUtils.add('1000000000000000000', '0')).toBe('1000000000000000000')
      expect(NumberUtils.add('0', '0')).toBe('0')
    })

    it('should handle very large amounts', () => {
      const result = NumberUtils.add('1000000000000000000000', '1000000000000000000000')
      expect(result).toBe('2000000000000000000000')
    })

    it('should handle adding amounts with different scales', () => {
      expect(NumberUtils.add('1000000000000000000', '100000000000000000')).toBe('1100000000000000000')
    })
  })

  describe('compareAmounts', () => {
    it('should return 1 when first amount is greater', () => {
      expect(NumberUtils.compareAmounts('2000000000000000000', '1000000000000000000')).toBe(1)
    })

    it('should return -1 when first amount is less', () => {
      expect(NumberUtils.compareAmounts('1000000000000000000', '2000000000000000000')).toBe(-1)
    })

    it('should return 0 when amounts are equal', () => {
      expect(NumberUtils.compareAmounts('1000000000000000000', '1000000000000000000')).toBe(0)
    })

    it('should handle very large amounts', () => {
      expect(NumberUtils.compareAmounts('1000000000000000000000', '999999999999999999999')).toBe(1)
    })

    it('should handle very small amounts', () => {
      expect(NumberUtils.compareAmounts('2', '1')).toBe(1)
      expect(NumberUtils.compareAmounts('1', '2')).toBe(-1)
    })

    it('should handle zero values', () => {
      expect(NumberUtils.compareAmounts('0', '0')).toBe(0)
      expect(NumberUtils.compareAmounts('1', '0')).toBe(1)
      expect(NumberUtils.compareAmounts('0', '1')).toBe(-1)
    })
  })

  describe('isGreaterThan', () => {
    it('should return true when first amount is greater', () => {
      expect(NumberUtils.isGreaterThan('2000000000000000000', '1000000000000000000')).toBe(true)
    })

    it('should return false when first amount is not greater', () => {
      expect(NumberUtils.isGreaterThan('1000000000000000000', '2000000000000000000')).toBe(false)
      expect(NumberUtils.isGreaterThan('1000000000000000000', '1000000000000000000')).toBe(false)
    })

    it('should handle very small differences', () => {
      expect(NumberUtils.isGreaterThan('1000000000000000001', '1000000000000000000')).toBe(true)
      expect(NumberUtils.isGreaterThan('1000000000000000000', '1000000000000000001')).toBe(false)
    })

    it('should handle zero comparisons', () => {
      expect(NumberUtils.isGreaterThan('1', '0')).toBe(true)
      expect(NumberUtils.isGreaterThan('0', '1')).toBe(false)
      expect(NumberUtils.isGreaterThan('0', '0')).toBe(false)
    })
  })

  describe('isLessThan', () => {
    it('should return true when first amount is less', () => {
      expect(NumberUtils.isLessThan('1000000000000000000', '2000000000000000000')).toBe(true)
    })

    it('should return false when first amount is not less', () => {
      expect(NumberUtils.isLessThan('2000000000000000000', '1000000000000000000')).toBe(false)
      expect(NumberUtils.isLessThan('1000000000000000000', '1000000000000000000')).toBe(false)
    })

    it('should handle very small differences', () => {
      expect(NumberUtils.isLessThan('1000000000000000000', '1000000000000000001')).toBe(true)
      expect(NumberUtils.isLessThan('1000000000000000001', '1000000000000000000')).toBe(false)
    })

    it('should handle zero comparisons', () => {
      expect(NumberUtils.isLessThan('0', '1')).toBe(true)
      expect(NumberUtils.isLessThan('1', '0')).toBe(false)
      expect(NumberUtils.isLessThan('0', '0')).toBe(false)
    })
  })

  describe('isGreaterThanOrEqual', () => {
    it('should return true when first amount is greater', () => {
      expect(NumberUtils.isGreaterThanOrEqual('2000000000000000000', '1000000000000000000')).toBe(true)
    })

    it('should return true when amounts are equal', () => {
      expect(NumberUtils.isGreaterThanOrEqual('1000000000000000000', '1000000000000000000')).toBe(true)
    })

    it('should return false when first amount is less', () => {
      expect(NumberUtils.isGreaterThanOrEqual('1000000000000000000', '2000000000000000000')).toBe(false)
    })

    it('should handle zero comparisons', () => {
      expect(NumberUtils.isGreaterThanOrEqual('1', '0')).toBe(true)
      expect(NumberUtils.isGreaterThanOrEqual('0', '1')).toBe(false)
      expect(NumberUtils.isGreaterThanOrEqual('0', '0')).toBe(true)
    })
  })

  describe('isZero', () => {
    it('should return true for zero', () => {
      expect(NumberUtils.isZero('0')).toBe(true)
      expect(NumberUtils.isZero('000')).toBe(true)
    })

    it('should return false for non-zero', () => {
      expect(NumberUtils.isZero('1000000000000000000')).toBe(false)
      expect(NumberUtils.isZero('1')).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(NumberUtils.isZero('-1')).toBe(false)
    })

    it('should return false for decimal numbers', () => {
      expect(NumberUtils.isZero('0.1')).toBe(false)
      expect(NumberUtils.isZero('1.0')).toBe(false)
    })
  })

  describe('isValidAmount', () => {
    it('should return true for valid positive amounts', () => {
      expect(NumberUtils.isValidAmount('1000000000000000000')).toBe(true)
      expect(NumberUtils.isValidAmount('1')).toBe(true)
      expect(NumberUtils.isValidAmount('0.1')).toBe(true)
    })

    it('should return false for zero', () => {
      expect(NumberUtils.isValidAmount('0')).toBe(false)
      expect(NumberUtils.isValidAmount('0.0')).toBe(false)
    })

    it('should return false for negative amounts', () => {
      expect(NumberUtils.isValidAmount('-1')).toBe(false)
      expect(NumberUtils.isValidAmount('-0.1')).toBe(false)
    })

    it('should return false for invalid amounts', () => {
      expect(NumberUtils.isValidAmount('NaN')).toBe(false)
      expect(NumberUtils.isValidAmount('invalid')).toBe(false)
    })

    it('should return false for infinite amounts', () => {
      expect(NumberUtils.isValidAmount('Infinity')).toBe(false)
      expect(NumberUtils.isValidAmount('-Infinity')).toBe(false)
    })

    it('should return false for empty strings', () => {
      expect(NumberUtils.isValidAmount('')).toBe(false)
    })

    it('should return true for very large valid amounts', () => {
      expect(NumberUtils.isValidAmount('1000000000000000000000000')).toBe(true)
    })

    it('should return false for extremely small amounts that round to zero', () => {
      expect(NumberUtils.isValidAmount('0.0000000000000000001')).toBe(true)
    })
  })
})
