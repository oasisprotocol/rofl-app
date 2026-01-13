import { describe, it, expect } from 'vitest'
import { FormatUtils } from './format.utils'

describe('FormatUtils', () => {
  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(FormatUtils.formatTime(30)).toBe('30s')
      expect(FormatUtils.formatTime(59)).toBe('59s')
    })

    it('should format minutes correctly', () => {
      expect(FormatUtils.formatTime(60)).toBe('1m')
      expect(FormatUtils.formatTime(120)).toBe('2m')
      expect(FormatUtils.formatTime(3599)).toBe('59m')
    })

    it('should format hours and minutes correctly', () => {
      expect(FormatUtils.formatTime(3600)).toBe('1h 0m')
      expect(FormatUtils.formatTime(3661)).toBe('1h 1m')
      expect(FormatUtils.formatTime(7320)).toBe('2h 2m')
    })

    it('should handle zero', () => {
      expect(FormatUtils.formatTime(0)).toBe('0s')
    })

    it('should handle large time values', () => {
      expect(FormatUtils.formatTime(360000)).toBe('100h 0m')
      expect(FormatUtils.formatTime(366100)).toBe('101h 41m')
    })

    it('should handle edge cases', () => {
      expect(FormatUtils.formatTime(1)).toBe('1s')
      expect(FormatUtils.formatTime(60)).toBe('1m')
      expect(FormatUtils.formatTime(3600)).toBe('1h 0m')
    })

    it('should handle exact hour boundaries', () => {
      expect(FormatUtils.formatTime(7200)).toBe('2h 0m')
      expect(FormatUtils.formatTime(10800)).toBe('3h 0m')
      expect(FormatUtils.formatTime(86400)).toBe('24h 0m')
    })

    it('should handle minutes at hour boundaries', () => {
      expect(FormatUtils.formatTime(60)).toBe('1m')
      expect(FormatUtils.formatTime(300)).toBe('5m')
      expect(FormatUtils.formatTime(1800)).toBe('30m')
    })

    it('should handle fractional seconds (truncates)', () => {
      expect(FormatUtils.formatTime(59.9)).toBe('59.9s')
      expect(FormatUtils.formatTime(0.5)).toBe('0.5s')
    })
  })

  describe('formatTokenAmount', () => {
    it('should return -/- for null or empty token amount', () => {
      expect(FormatUtils.formatTokenAmount(null)).toBe('-/-')
      expect(FormatUtils.formatTokenAmount({ amount: '', decimals: 18, symbol: 'ROSE' })).toBe('-/-')
    })

    it('should return -/- for zero amount', () => {
      expect(FormatUtils.formatTokenAmount({ amount: '0', decimals: 18, symbol: 'ROSE' })).toBe('-/-')
    })

    it('should format token amount correctly', () => {
      const result = FormatUtils.formatTokenAmount({
        amount: '1000000000000000000',
        decimals: 18,
        symbol: 'ROSE',
      })
      expect(result).toBe('1 ROSE')
    })

    it('should handle different decimals', () => {
      const result = FormatUtils.formatTokenAmount({
        amount: '1000000',
        decimals: 6,
        symbol: 'USDC',
      })
      expect(result).toBe('1 USDC')
    })

    it('should handle fractional token amounts', () => {
      const result = FormatUtils.formatTokenAmount({
        amount: '500000000000000000',
        decimals: 18,
        symbol: 'ROSE',
      })
      expect(result).toBe('0.5 ROSE')
    })

    it('should handle large token amounts', () => {
      const result = FormatUtils.formatTokenAmount({
        amount: '1000000000000000000000',
        decimals: 18,
        symbol: 'ROSE',
      })
      expect(result).toBe('1000 ROSE')
    })

    it('should handle tokens with very small decimals', () => {
      const result = FormatUtils.formatTokenAmount({
        amount: '100',
        decimals: 2,
        symbol: 'TOKEN',
      })
      expect(result).toBe('1 TOKEN')
    })

    it('should handle tokens with no decimals', () => {
      const result = FormatUtils.formatTokenAmount({
        amount: '1',
        decimals: 0,
        symbol: 'WHOLE',
      })
      expect(result).toBe('1 WHOLE')
    })
  })

  describe('formatBalance', () => {
    it('should return Loading... when isLoading is true', () => {
      expect(FormatUtils.formatBalance(null, true)).toBe('Loading...')
    })

    it('should return -/- for null balance', () => {
      expect(FormatUtils.formatBalance(null, false)).toBe('-/-')
      expect(FormatUtils.formatBalance(null)).toBe('-/-')
    })

    it('should return formatted balance', () => {
      const balance = {
        formatted: '1.234567',
        value: BigInt('1234567000000000'),
      } as const
      expect(FormatUtils.formatBalance(balance, false)).toBe('1.234567')
    })

    it('should handle zero balance', () => {
      const balance = {
        formatted: '0',
        value: BigInt(0),
      } as const
      expect(FormatUtils.formatBalance(balance, false)).toBe('0')
    })

    it('should handle very large balances', () => {
      const balance = {
        formatted: '1000000.123456',
        value: BigInt('1000000123456000000000'),
      } as const
      expect(FormatUtils.formatBalance(balance, false)).toBe('1000000.123456')
    })

    it('should handle small balances', () => {
      const balance = {
        formatted: '0.000001',
        value: BigInt('1000000000000'),
      } as const
      expect(FormatUtils.formatBalance(balance, false)).toBe('0.000001')
    })
  })

  describe('formatNumberInput', () => {
    it('should remove non-digit characters except commas and dots', () => {
      expect(FormatUtils.formatNumberInput('abc123def')).toBe('123')
      // With multiple dots, it joins everything after the first dot
      expect(FormatUtils.formatNumberInput('1,234.56')).toBe('1.23456')
      expect(FormatUtils.formatNumberInput('1.234,56')).toBe('1.23456')
    })

    it('should handle multiple dots by keeping only first one', () => {
      expect(FormatUtils.formatNumberInput('1.2.3')).toBe('1.23')
      expect(FormatUtils.formatNumberInput('1.2.3.4.5')).toBe('1.2345')
    })

    it('should handle commas as decimal separators - converts to dots when mixed with dots', () => {
      // When there's both a comma and a dot, comma is converted to dot
      expect(FormatUtils.formatNumberInput('1,234.56')).toBe('1.23456')
      // When there's only a comma, it stays as comma (single part after split)
      expect(FormatUtils.formatNumberInput('1,5')).toBe('1,5')
    })

    it('should handle empty strings', () => {
      expect(FormatUtils.formatNumberInput('')).toBe('')
    })

    it('should handle special characters', () => {
      expect(FormatUtils.formatNumberInput('$1,234.56')).toBe('1.23456')
      // Euro format with comma as decimal separator and dot as thousands separator
      expect(FormatUtils.formatNumberInput('€1.234,56')).toBe('1.23456')
    })

    it('should handle numbers without decimal points', () => {
      expect(FormatUtils.formatNumberInput('12345')).toBe('12345')
      expect(FormatUtils.formatNumberInput('1,234,567')).toBe('1,234,567')
    })

    it('should handle trailing decimal point', () => {
      expect(FormatUtils.formatNumberInput('123.')).toBe('123.')
      expect(FormatUtils.formatNumberInput('123,')).toBe('123,')
    })

    it('should handle leading zeros', () => {
      expect(FormatUtils.formatNumberInput('000123')).toBe('000123')
      expect(FormatUtils.formatNumberInput('0.123')).toBe('0.123')
    })

    it('should handle spaces and special currency symbols', () => {
      expect(FormatUtils.formatNumberInput('  123  ')).toBe('123')
      expect(FormatUtils.formatNumberInput('£123.45')).toBe('123.45')
      expect(FormatUtils.formatNumberInput('¥1,234')).toBe('1,234')
    })

    it('should handle multiple commas and dots mixed', () => {
      expect(FormatUtils.formatNumberInput('1,234.56.78')).toBe('1.2345678')
      expect(FormatUtils.formatNumberInput('1.234,56.78')).toBe('1.2345678')
    })

    it('should handle numbers with only separators', () => {
      expect(FormatUtils.formatNumberInput(',')).toBe(',')
      expect(FormatUtils.formatNumberInput('.')).toBe('.')
    })
  })

  describe('formatLoadingState', () => {
    it('should return loading text when isLoading is true', () => {
      expect(FormatUtils.formatLoadingState(true, 'Done')).toBe('Loading...')
      expect(FormatUtils.formatLoadingState(true, 'Done', 'Chargement...')).toBe('Chargement...')
    })

    it('should return value when isLoading is false', () => {
      expect(FormatUtils.formatLoadingState(false, 'Done')).toBe('Done')
      expect(FormatUtils.formatLoadingState(undefined, 'Done')).toBe('Done')
    })

    it('should use default loading text', () => {
      expect(FormatUtils.formatLoadingState(true, 'Done')).toBe('Loading...')
    })

    it('should handle empty value', () => {
      expect(FormatUtils.formatLoadingState(true, '')).toBe('Loading...')
      expect(FormatUtils.formatLoadingState(false, '')).toBe('')
    })

    it('should handle special characters in loading text', () => {
      expect(FormatUtils.formatLoadingState(true, 'Done', '⏳ 加载中...')).toBe('⏳ 加载中...')
    })

    it('should handle undefined loading text (uses default)', () => {
      expect(FormatUtils.formatLoadingState(true, 'Done', undefined as unknown as string)).toBe('Loading...')
    })
  })
})
