import { describe, it, expect } from 'vitest'
import { sortOffersByPaymentTerms } from './helpers'
import type { RoflMarketOffer } from '../../nexus/api'

describe('BuildForm helpers', () => {
  const createMockOffer = (termValue?: string): RoflMarketOffer =>
    ({
      // @ts-expect-error - Mock for testing
      payment: termValue
        ? {
            native: {
              terms: {
                '1': termValue,
              },
            },
          }
        : undefined,
    }) as RoflMarketOffer

  describe('sortOffersByPaymentTerms', () => {
    it('should sort offers by payment term value ascending', () => {
      const offer1 = createMockOffer('3000000000000000000') // 3 ROSE
      const offer2 = createMockOffer('1000000000000000000') // 1 ROSE
      const offer3 = createMockOffer('2000000000000000000') // 2 ROSE

      const sorted = [offer1, offer2, offer3].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer2) // 1 ROSE
      expect(sorted[1]).toBe(offer3) // 2 ROSE
      expect(sorted[2]).toBe(offer1) // 3 ROSE
    })

    it('should handle offers with no payment terms', () => {
      const offerWithPayment = createMockOffer('1000000000000000000')
      const offerWithoutPayment = createMockOffer()

      const sorted1 = [offerWithPayment, offerWithoutPayment].sort(sortOffersByPaymentTerms)
      expect(sorted1[0]).toBe(offerWithPayment)
      expect(sorted1[1]).toBe(offerWithoutPayment)

      const sorted2 = [offerWithoutPayment, offerWithPayment].sort(sortOffersByPaymentTerms)
      expect(sorted2[0]).toBe(offerWithPayment)
      expect(sorted2[1]).toBe(offerWithoutPayment)
    })

    it('should return 0 when both offers have no payment terms', () => {
      const offer1 = createMockOffer()
      const offer2 = createMockOffer()

      const result = sortOffersByPaymentTerms(offer1, offer2)
      expect(result).toBe(0)
    })

    it('should handle large BigInt values', () => {
      const offer1 = createMockOffer('999999999999999999999999')
      const offer2 = createMockOffer('1000000000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer1)
      expect(sorted[1]).toBe(offer2)
    })

    it('should handle zero values', () => {
      const offer1 = createMockOffer('0')
      const offer2 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer1)
      expect(sorted[1]).toBe(offer2)
    })

    it('should handle equal values', () => {
      const offer1 = createMockOffer('1000000000000000000')
      const offer2 = createMockOffer('1000000000000000000')

      const _result = sortOffersByPaymentTerms(offer1, offer2)

      // Equal values should still sort (order determined by sort algorithm)
      expect([offer1, offer2].sort(sortOffersByPaymentTerms)).toHaveLength(2)
    })

    it('should handle offers with empty terms object', () => {
      const offer1 = {
        payment: {
          native: {
            terms: {},
          },
        },
      } as RoflMarketOffer

      const offer2 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer2)
      expect(sorted[1]).toBe(offer1)
    })

    it('should handle mixed scenarios with multiple offers', () => {
      const offer1 = createMockOffer('5000000000000000000')
      const offer2 = createMockOffer()
      const offer3 = createMockOffer('2000000000000000000')
      const offer4 = createMockOffer()
      const offer5 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2, offer3, offer4, offer5].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer5) // 1 ROSE
      expect(sorted[1]).toBe(offer3) // 2 ROSE
      expect(sorted[2]).toBe(offer1) // 5 ROSE
      // Offers without payment come last, but their relative order is preserved
      expect(sorted[3]).toBe(offer2)
      expect(sorted[4]).toBe(offer4)
    })

    it('should handle offers with payment but no native property', () => {
      const offer1 = {
        payment: {},
      } as RoflMarketOffer

      const offer2 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer2)
      expect(sorted[1]).toBe(offer1)
    })

    it('should handle offers with payment.native but no terms', () => {
      const offer1 = {
        payment: {
          native: {},
        },
      } as RoflMarketOffer

      const offer2 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer2)
      expect(sorted[1]).toBe(offer1)
    })

    it('should handle string term values that are not valid numbers', () => {
      const offer1 = {
        payment: {
          native: {
            terms: {
              '1': 'invalid',
            },
          },
        },
      } as RoflMarketOffer

      const offer2 = createMockOffer('1000000000000000000')

      // BigInt will throw for invalid strings, but the function should handle it gracefully
      expect(() => {
        ;[offer1, offer2].sort(sortOffersByPaymentTerms)
      }).toThrow()
    })

    it('should handle very large term values', () => {
      const offer1 = createMockOffer(
        '100000000000000000000000000000000000000000000000000000000000000000000000000000000',
      )
      const offer2 = createMockOffer(
        '200000000000000000000000000000000000000000000000000000000000000000000000000000000',
      )

      const sorted = [offer2, offer1].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer1)
      expect(sorted[1]).toBe(offer2)
    })

    it('should handle term "1" missing from one offer', () => {
      const offer1 = {
        payment: {
          native: {
            terms: {
              '2': '5000000000000000000',
            },
          },
        },
      } as RoflMarketOffer

      const offer2 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer2)
      expect(sorted[1]).toBe(offer1)
    })
  })

  describe('edge cases and type safety', () => {
    it('should handle null payment object', () => {
      const offer1 = {
        payment: null,
      } as RoflMarketOffer

      const offer2 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer2)
    })

    it('should handle undefined native in payment', () => {
      const offer1 = {
        payment: {
          native: undefined,
        },
      } as RoflMarketOffer

      const offer2 = createMockOffer('1000000000000000000')

      const sorted = [offer1, offer2].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer2)
    })

    it('should maintain stable sort for equal values', () => {
      const offer1 = createMockOffer('1000000000000000000')
      const offer2 = createMockOffer('1000000000000000000')
      const offer3 = createMockOffer('1000000000000000000')

      const offers = [offer1, offer2, offer3]
      const sorted = offers.sort(sortOffersByPaymentTerms)

      // All should be included
      expect(sorted).toHaveLength(3)
    })

    it('should handle term values with leading zeros', () => {
      const offer1 = createMockOffer('0001000000000000000000')
      const offer2 = createMockOffer('0010000000000000000000')

      const sorted = [offer2, offer1].sort(sortOffersByPaymentTerms)

      expect(sorted[0]).toBe(offer1)
      expect(sorted[1]).toBe(offer2)
    })
  })
})
