import { z } from 'zod'

export const buildFormSchema = z
  .object({
    provider: z.string().min(1, {
      message: 'Provider is required.',
    }),
    duration: z.enum(['hours', 'days', 'months']),
    number: z.coerce.number().int().positive({
      message: 'Number is required.',
    }),
    offerId: z.string().min(1, {
      message: 'Resources are required.',
    }),
    roseCostInBaseUnits: z.string().optional(),
    offerCpu: z.number(),
    offerMemory: z.number(),
    offerStorage: z.number(),
  })
  .refine(
    data => {
      const maxLimits = {
        hours: 8760, // 1 year in hours (365 * 24)
        days: 365, // 1 year in days
        months: 12, // 1 year in months
      }

      const maxAllowed = maxLimits[data.duration as keyof typeof maxLimits]
      return data.number <= maxAllowed
    },
    {
      message: 'Duration cannot exceed 1 year. Maximum allowed: 8760 hours, 365 days, or 12 months.',
      path: ['number'], // target field name
    },
  )

export type BuildFormData = z.infer<typeof buildFormSchema>
