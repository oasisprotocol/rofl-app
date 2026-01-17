import { describe, it, expect } from 'vitest'
import { buildFormSchema, BuildFormData } from './build-form'

describe('buildFormSchema', () => {
  const validData = {
    provider: '0xprovider1',
    duration: 'hours' as const,
    number: '10',
    offerId: 'offer1',
    roseCostInBaseUnits: '1000000',
    offerCpus: 2,
    offerMemory: 4,
    offerStorage: 10,
  }

  describe('valid data', () => {
    it('should validate correct data with hours duration', () => {
      const result = buildFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate correct data with days duration', () => {
      const data = { ...validData, duration: 'days' as const, number: '7' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate correct data with months duration', () => {
      const data = { ...validData, duration: 'months' as const, number: '3' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate without optional roseCostInBaseUnits', () => {
      const data = { ...validData, roseCostInBaseUnits: undefined }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should coerce string number to number', () => {
      const result = buildFormSchema.safeParse(validData)
      if (result.success) {
        expect(typeof result.data.number).toBe('number')
        expect(result.data.number).toBe(10)
      }
    })

    it('should parse successfully', () => {
      const data = buildFormSchema.parse(validData)
      expect(data).toBeDefined()
      expect(data.number).toBe(10)
    })

    it('should accept string numbers as input', () => {
      const data = { ...validData, number: '100' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.number).toBe(100)
      }
    })
  })

  describe('provider validation', () => {
    it('should reject empty provider', () => {
      const data = { ...validData, provider: '' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Provider is required.')
      }
    })

    it('should reject missing provider', () => {
      const data = { ...validData, provider: undefined as any }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept any non-empty string for provider', () => {
      const data = { ...validData, provider: 'any-provider-string' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept provider with special characters', () => {
      const data = { ...validData, provider: '0x123_ABC-456.def' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('duration validation', () => {
    it('should accept hours duration', () => {
      const data = { ...validData, duration: 'hours' as const }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept days duration', () => {
      const data = { ...validData, duration: 'days' as const }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept months duration', () => {
      const data = { ...validData, duration: 'months' as const }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid duration', () => {
      const data = { ...validData, duration: 'weeks' as any }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject null duration', () => {
      const data = { ...validData, duration: null as any }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should only accept allowed duration values', () => {
      const allowedDurations = ['hours', 'days', 'months'] as const
      allowedDurations.forEach(duration => {
        const data = { ...validData, duration }
        const result = buildFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('number validation', () => {
    it('should reject zero', () => {
      const data = { ...validData, number: '0' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Number is required.')
      }
    })

    it('should reject negative numbers', () => {
      const data = { ...validData, number: '-5' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Number is required.')
      }
    })

    it('should reject decimal numbers', () => {
      const data = { ...validData, number: '5.5' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject non-numeric strings', () => {
      const data = { ...validData, number: 'abc' as any }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept integer strings', () => {
      const data = { ...validData, number: '42' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.number).toBe(42)
      }
    })

    it('should coerce numeric string to integer', () => {
      const result = buildFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(Number.isInteger(result.data.number)).toBe(true)
      }
    })
  })

  describe('offerId validation', () => {
    it('should reject empty offerId', () => {
      const data = { ...validData, offerId: '' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Resources are required.')
      }
    })

    it('should reject missing offerId', () => {
      const data = { ...validData, offerId: undefined as any }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept any non-empty string for offerId', () => {
      const data = { ...validData, offerId: 'any-offer-id-123' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('duration limit validation', () => {
    it('should reject hours exceeding 8760 (1 year)', () => {
      const data = { ...validData, duration: 'hours' as const, number: '8761' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 1 year')
      }
    })

    it('should accept exactly 8760 hours', () => {
      const data = { ...validData, duration: 'hours' as const, number: '8760' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject days exceeding 365 (1 year)', () => {
      const data = { ...validData, duration: 'days' as const, number: '366' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 1 year')
      }
    })

    it('should accept exactly 365 days', () => {
      const data = { ...validData, duration: 'days' as const, number: '365' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject months exceeding 12 (1 year)', () => {
      const data = { ...validData, duration: 'months' as const, number: '13' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 1 year')
      }
    })

    it('should accept exactly 12 months', () => {
      const data = { ...validData, duration: 'months' as const, number: '12' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should show maximum limits in error message', () => {
      const data = { ...validData, duration: 'hours' as const, number: '10000' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        const errorMessage = result.error.issues[0].message
        expect(errorMessage).toContain('8760 hours')
        expect(errorMessage).toContain('365 days')
        expect(errorMessage).toContain('12 months')
      }
    })
  })

  describe('BuildFormData type', () => {
    it('should infer correct type from schema', () => {
      const data: BuildFormData = {
        provider: '0xprovider1',
        duration: 'hours',
        number: 10,
        offerId: 'offer1',
        roseCostInBaseUnits: '1000000',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }

      expect(data.provider).toBe('0xprovider1')
      expect(data.duration).toBe('hours')
      expect(data.number).toBe(10)
    })

    it('should have optional roseCostInBaseUnits', () => {
      const data: BuildFormData = {
        provider: '0xprovider1',
        duration: 'hours',
        number: 10,
        offerId: 'offer1',
        roseCostInBaseUnits: undefined,
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }

      expect(data.roseCostInBaseUnits).toBeUndefined()
    })

    it('should have required provider field', () => {
      const data: BuildFormData = {
        provider: 'test',
        duration: 'hours',
        number: 10,
        offerId: 'offer1',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }
      expect(typeof data.provider).toBe('string')
    })

    it('should have duration as union type', () => {
      const data: BuildFormData = {
        provider: 'test',
        duration: 'days',
        number: 10,
        offerId: 'offer1',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }
      expect(['hours', 'days', 'months']).toContain(data.duration)
    })

    it('should have number as number type', () => {
      const data: BuildFormData = {
        provider: 'test',
        duration: 'hours',
        number: 42,
        offerId: 'offer1',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }
      expect(typeof data.number).toBe('number')
    })

    it('should have offerCpus as number', () => {
      const data: BuildFormData = {
        provider: 'test',
        duration: 'hours',
        number: 10,
        offerId: 'offer1',
        offerCpus: 4,
        offerMemory: 8,
        offerStorage: 100,
      }
      expect(typeof data.offerCpus).toBe('number')
    })

    it('should have offerMemory as number', () => {
      const data: BuildFormData = {
        provider: 'test',
        duration: 'hours',
        number: 10,
        offerId: 'offer1',
        offerCpus: 2,
        offerMemory: 16,
        offerStorage: 50,
      }
      expect(typeof data.offerMemory).toBe('number')
    })

    it('should have offerStorage as number', () => {
      const data: BuildFormData = {
        provider: 'test',
        duration: 'hours',
        number: 10,
        offerId: 'offer1',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 200,
      }
      expect(typeof data.offerStorage).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('should handle minimum valid values', () => {
      const data = { ...validData, number: '1' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle maximum valid values', () => {
      const data = { ...validData, duration: 'hours' as const, number: '8760' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept long provider addresses', () => {
      const data = { ...validData, provider: '0x'.padEnd(42, 'a') }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept long offer IDs', () => {
      const data = { ...validData, offerId: 'offer-' + 'x'.repeat(100) }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle whitespace in provider', () => {
      const data = { ...validData, provider: '  provider  ' }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.provider).toBe('  provider  ')
      }
    })

    it('should accept valid offer resource values', () => {
      const data = {
        ...validData,
        offerCpus: 8,
        offerMemory: 32,
        offerStorage: 500,
      }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept zero for offer resources', () => {
      const data = {
        ...validData,
        offerCpus: 0,
        offerMemory: 0,
        offerStorage: 0,
      }
      const result = buildFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Schema structure', () => {
    it('should be a Zod schema', () => {
      expect(buildFormSchema).toBeDefined()
      expect(typeof buildFormSchema.parse).toBe('function')
      expect(typeof buildFormSchema.safeParse).toBe('function')
    })

    it('should export BuildFormData type', () => {
      // This test verifies the type exists and can be used
      const data: BuildFormData = {
        provider: 'test',
        duration: 'hours',
        number: 10,
        offerId: 'test-offer',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }
      expect(data).toBeDefined()
    })

    it('should support both parse and safeParse', () => {
      const parseResult = buildFormSchema.parse(validData)
      expect(parseResult).toBeDefined()

      const safeParseResult = buildFormSchema.safeParse(validData)
      expect(safeParseResult.success).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('should return detailed errors for invalid data', () => {
      const invalidData = {
        provider: '',
        duration: 'invalid' as any,
        number: 'invalid',
        offerId: '',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }
      const result = buildFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should handle multiple validation errors', () => {
      const invalidData = {
        provider: '',
        duration: 'weeks' as any,
        number: '-5',
        offerId: '',
        offerCpus: 2,
        offerMemory: 4,
        offerStorage: 10,
      }
      const result = buildFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        // Should have multiple errors
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
      }
    })
  })
})
