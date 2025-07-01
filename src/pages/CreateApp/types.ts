import { z } from 'zod'
import { BuildFormData } from '../../types/build-form.ts'

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

export const hlCopyTraderFormSchema = z.object({
  COPY_TRADE_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Please enter a valid Ethereum address (0x...).',
  }),
})

export type TemplateFormData = string
export type MetadataFormData = z.infer<typeof metadataFormSchema>
export type AgentFormData = z.infer<typeof tgbotFormSchema>
export type XAgentFormData = z.infer<typeof xAgentFormSchema>
export type HlCopyTraderFormData = z.infer<typeof hlCopyTraderFormSchema>

export type AppData = {
  template?: string
  metadata?: MetadataFormData
  agent?: AgentFormData | XAgentFormData | HlCopyTraderFormData
  build?: BuildFormData
  payment?: Record<string, unknown>
}
