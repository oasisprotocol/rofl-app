import { z } from 'zod'
import { BuildFormData } from '../../types/build-form.ts'

/**
 * This is like z.string().url(), but also accepts domain names without the protocol prefix,
 * and empty strings
 */
const flexibleUrl = z.preprocess(
  input => {
    const str = String(input).trim()
    // Add https: if no protocol is specified, and it looks like a URL (not a handle)
    if (
      str &&
      !str.startsWith('http://') &&
      !str.startsWith('https://') &&
      !str.startsWith('@') && // Exclude Twitter handles
      !str.startsWith('discord:') // Exclude Discord handles
    ) {
      return `https://${str}`
    }
    return str
  },
  z
    .string()
    .refine(
      value => {
        // Check for Twitter (X) handles: @username (alphanumeric, underscore, 1-15 chars)
        const twitterHandlePattern = /^@([a-zA-Z0-9_]{1,15})$/
        // Check for Discord handles (both old and new style)
        const oldDiscordHandlePattern = /^discord:[a-zA-Z0-9_]+#[0-9]{4}$/
        const newDiscordHandlePattern = /^discord:[a-z0-9][a-z0-9_.]{0,30}[a-z0-9]$/
        // Check for URLs: protocol, domain, and plausible TLD
        const urlPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/

        return (
          twitterHandlePattern.test(value) ||
          oldDiscordHandlePattern.test(value) ||
          newDiscordHandlePattern.test(value) ||
          urlPattern.test(value)
        )
      },
      {
        message:
          'Invalid URL or social handle: must be a valid URL, Twitter handle (@username), or Discord handle (discord:username#1234)',
      },
    )
    .or(z.literal('')),
) as z.ZodType<string> // Explicitly assert the output type

export const metadataFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  author: z.literal('').or(
    z.string().refine(
      value => {
        // This code is auto generated based on Go's net/mail.ParseAddress
        // Accept formats: email@domain.com, Name <email@domain.com>, "Name" <email@domain.com>, <email@domain.com>

        // Rejects consecutive dots, leading/trailing dots, and other invalid patterns
        const emailRegex =
          /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/

        // Trim whitespace
        const trimmed = value.trim()

        // Case 1: Simple email address (user@domain.com)
        if (emailRegex.test(trimmed)) {
          return true
        }

        // Case 2: Email in angle brackets only (<user@domain.com>)
        const angleBracketsOnly = /^<([^<>]+)>$/.exec(trimmed)
        if (angleBracketsOnly) {
          return emailRegex.test(angleBracketsOnly[1].trim())
        }

        // Case 3: Display name with email in angle brackets
        // Matches: Name <email>, "Name" <email>, "Name with spaces" <email>
        const displayNameWithEmail = /^(.+?)\s*<([^<>]+)>$/.exec(trimmed)
        if (displayNameWithEmail) {
          const displayName = displayNameWithEmail[1].trim()
          const email = displayNameWithEmail[2].trim()

          // Display name should not be empty and email should be valid
          if (displayName.length > 0 && emailRegex.test(email)) {
            return true
          }
        }

        return false
      },
      {
        message: 'Author must be a valid email address or in the format "Name <email@domain.com>".',
      },
    ),
  ),
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
  homepage: flexibleUrl,
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
  WITHDRAW_FUNDS_TO: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Please enter a valid Ethereum address (0x...).',
  }),
  WITHDRAW: z.enum(['false', 'true']),
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
}
