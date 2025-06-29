import { z } from 'zod'

export const metadataFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  author: z.string().min(1, {
    message: 'Author is required.',
  }),
  description: z.string().min(1, {
    message: 'Description is required.',
  }),
  version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      {
        message: 'Version must be valid semver format.',
      },
    ),
  license: z.string().min(1, {
    message: 'License is required.',
  }),
  homepage: z.string().url().or(z.literal('')),
})

export const tgbotFormSchema = z.object({
  OLLAMA_MODEL: z.string().min(1, {
    message: 'Model is required.',
  }),
  TOKEN: z
    .string()
    .min(1, {
      message: 'Token is required.',
    })
    .max(50, {
      message: 'Token must be less than 50 characters.',
    }),
  OLLAMA_SYSTEM_PROMPT: z
    .string()
    .min(1, {
      message: 'Prompt is required.',
    })
    .max(1000, {
      message: 'Prompt must be less than 1000 characters.',
    }),
})

export const xAgentFormSchema = z.object({
  SYSTEM_PROMPT: z
    .string()
    .min(1, {
      message: 'Bot persona is required.',
    })
    .max(2000, {
      message: 'Bot persona must be less than 2000 characters.',
    }),
  TWITTER_BEARER_TOKEN: z.string().min(1, {
    message: 'Twitter Bearer Token is required.',
  }),
  TWITTER_API_KEY: z.string().min(1, {
    message: 'Twitter API Key is required.',
  }),
  TWITTER_API_SECRET: z.string().min(1, {
    message: 'Twitter API Secret is required.',
  }),
  TWITTER_ACCESS_TOKEN: z.string().min(1, {
    message: 'Twitter Access Token is required.',
  }),
  TWITTER_ACCESS_TOKEN_SECRET: z.string().min(1, {
    message: 'Twitter Access Token Secret is required.',
  }),
  OPENAI_API_KEY: z.string().min(1, {
    message: 'OpenAI API Key is required.',
  }),
  OPENAI_MODEL: z.string().min(1, {
    message: 'Model is required.',
  }),
})

export const buildFormSchema = z
  .object({
    provider: z.string().min(1, {
      message: 'Provider is required.',
    }),
    duration: z.enum(['hours', 'days', 'months']),
    number: z.coerce.number().int().positive({
      message: 'Number is required.',
    }),
    resources: z.string().min(1, {
      message: 'Resources are required.',
    }),
    roseCostInBaseUnits: z.string().optional(),
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

export type TemplateFormData = string
export type MetadataFormData = z.infer<typeof metadataFormSchema>
export type AgentFormData = z.infer<typeof tgbotFormSchema>
export type XAgentFormData = z.infer<typeof xAgentFormSchema>
export type BuildFormData = z.infer<typeof buildFormSchema>

export type AppData = {
  template?: string
  metadata?: MetadataFormData
  agent?: AgentFormData | XAgentFormData
  build?: BuildFormData
  payment?: Record<string, unknown>
}
