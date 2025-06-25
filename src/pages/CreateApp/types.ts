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

export const agentFormSchema = z.object({
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

export const buildFormSchema = z.object({
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

export type TemplateFormData = string
export type MetadataFormData = z.infer<typeof metadataFormSchema>
export type AgentFormData = z.infer<typeof agentFormSchema>
export type BuildFormData = z.infer<typeof buildFormSchema>

export type AppData = {
  template?: string
  metadata?: MetadataFormData
  agent?: AgentFormData
  build?: BuildFormData
  payment?: Record<string, unknown>
}
