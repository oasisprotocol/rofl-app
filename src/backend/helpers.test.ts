import { describe, it, expect } from 'vitest'
import { convertToDurationTerms } from './helpers'

describe('convertToDurationTerms', () => {
  describe('months', () => {
    it('should convert months to MONTH term', () => {
      const result = convertToDurationTerms({ duration: 'months', number: 6 })
      expect(result).toEqual({
        term: 2, // MONTH enum value
        term_count: 6,
      })
    })

    it('should handle single month', () => {
      const result = convertToDurationTerms({ duration: 'months', number: 1 })
      expect(result).toEqual({
        term: 2, // MONTH enum value
        term_count: 1,
      })
    })

    it('should handle large month values', () => {
      const result = convertToDurationTerms({ duration: 'months', number: 24 })
      expect(result).toEqual({
        term: 2, // MONTH enum value
        term_count: 24,
      })
    })
  })

  describe('days', () => {
    it('should convert days to hours (24 hours per day)', () => {
      const result = convertToDurationTerms({ duration: 'days', number: 7 })
      expect(result).toEqual({
        term: 1, // HOUR enum value
        term_count: 168, // 7 * 24
      })
    })

    it('should handle single day', () => {
      const result = convertToDurationTerms({ duration: 'days', number: 1 })
      expect(result).toEqual({
        term: 1, // HOUR enum value
        term_count: 24, // 1 * 24
      })
    })

    it('should handle multiple days', () => {
      const result = convertToDurationTerms({ duration: 'days', number: 30 })
      expect(result).toEqual({
        term: 1, // HOUR enum value
        term_count: 720, // 30 * 24
      })
    })
  })

  describe('hours', () => {
    it('should convert hours directly', () => {
      const result = convertToDurationTerms({ duration: 'hours', number: 12 })
      expect(result).toEqual({
        term: 1, // HOUR enum value
        term_count: 12,
      })
    })

    it('should handle single hour', () => {
      const result = convertToDurationTerms({ duration: 'hours', number: 1 })
      expect(result).toEqual({
        term: 1, // HOUR enum value
        term_count: 1,
      })
    })

    it('should handle large hour values', () => {
      const result = convertToDurationTerms({ duration: 'hours', number: 720 })
      expect(result).toEqual({
        term: 1, // HOUR enum value
        term_count: 720,
      })
    })
  })

  describe('edge cases and errors', () => {
    it('should throw error for invalid duration type', () => {
      // @ts-expect-error Testing invalid input
      expect(() => convertToDurationTerms({ duration: 'weeks', number: 2 })).toThrow(
        'Invalid duration: weeks',
      )
    })

    it('should throw error for unrecognized duration', () => {
      // @ts-expect-error Testing invalid input
      expect(() => convertToDurationTerms({ duration: 'years', number: 1 })).toThrow(
        'Invalid duration: years',
      )
    })

    it('should throw error for empty string duration', () => {
      // @ts-expect-error Testing invalid input
      expect(() => convertToDurationTerms({ duration: '', number: 1 })).toThrow('Invalid duration: ')
    })

    it('should handle zero values', () => {
      const monthsResult = convertToDurationTerms({ duration: 'months', number: 0 })
      expect(monthsResult).toEqual({
        term: 2, // MONTH enum value
        term_count: 0,
      })

      const hoursResult = convertToDurationTerms({ duration: 'hours', number: 0 })
      expect(hoursResult).toEqual({
        term: 1, // HOUR enum value
        term_count: 0,
      })

      const daysResult = convertToDurationTerms({ duration: 'days', number: 0 })
      expect(daysResult).toEqual({
        term: 1, // HOUR enum value
        term_count: 0,
      })
    })

    it('should handle negative values', () => {
      const result = convertToDurationTerms({ duration: 'months', number: -1 })
      expect(result).toEqual({
        term: 2, // MONTH enum value
        term_count: -1,
      })
    })
  })

  describe('type safety', () => {
    it('should return correct term type for months', () => {
      const result = convertToDurationTerms({ duration: 'months', number: 1 })
      expect(result.term).toBe(2) // MONTH enum value
    })

    it('should return HOUR term for both days and hours', () => {
      const daysResult = convertToDurationTerms({ duration: 'days', number: 1 })
      const hoursResult = convertToDurationTerms({ duration: 'hours', number: 1 })

      expect(daysResult.term).toBe(1) // HOUR enum value
      expect(hoursResult.term).toBe(1) // HOUR enum value
    })

    it('should preserve number type for term_count', () => {
      const result = convertToDurationTerms({ duration: 'months', number: 5 })
      expect(typeof result.term_count).toBe('number')
    })
  })

  describe('real-world scenarios', () => {
    it('should handle typical deployment durations', () => {
      const oneMonth = convertToDurationTerms({ duration: 'months', number: 1 })
      const oneWeek = convertToDurationTerms({ duration: 'days', number: 7 })
      const oneDay = convertToDurationTerms({ duration: 'days', number: 1 })
      const twelveHours = convertToDurationTerms({ duration: 'hours', number: 12 })

      expect(oneMonth.term_count).toBe(1)
      expect(oneWeek.term_count).toBe(168)
      expect(oneDay.term_count).toBe(24)
      expect(twelveHours.term_count).toBe(12)
    })

    it('should handle long-term deployments', () => {
      const oneYear = convertToDurationTerms({ duration: 'months', number: 12 })
      const twoYears = convertToDurationTerms({ duration: 'months', number: 24 })

      expect(oneYear.term_count).toBe(12)
      expect(twoYears.term_count).toBe(24)
    })

    it('should handle short-term deployments', () => {
      const sixHours = convertToDurationTerms({ duration: 'hours', number: 6 })
      const twelveHours = convertToDurationTerms({ duration: 'hours', number: 12 })
      const oneDay = convertToDurationTerms({ duration: 'days', number: 1 })

      expect(sixHours.term_count).toBe(6)
      expect(twelveHours.term_count).toBe(12)
      expect(oneDay.term_count).toBe(24)
    })
  })
})
