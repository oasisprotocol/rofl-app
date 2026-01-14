import { z, RefinementCtx } from 'zod'
import { BuildFormData } from '../../types/build-form.ts'
import * as yaml from 'yaml'
import { sepolia } from 'viem/chains'

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

export const customBuildFormSchema = z.object({
  compose: z
    .string()
    .min(1, {
      message: 'Please provide a valid compose file.',
    })
    .superRefine((data, ctx: RefinementCtx) => {
      try {
        yaml.parse(data)
      } catch (error) {
        const yamlError = error as { message: string; linePos: { line: number; col: number }[] }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: yamlError.message,
        })
      }
    }),
  secrets: z.record(z.string()).default({}),
  name: z.string().default(''),
  value: z.string().default(''),
})

// Make sure that the secrets object contains variables prefixed with (const ROFL_8004_SERVICE_ENV_PREFIX)
export const erc8004Schema = z
  .object({
    secrets: z.object({
      ERC8004_CHAIN_SELECTION: z.enum([sepolia.id.toString(), 'custom']).optional(),
      ERC8004_RPC_URL: z
        .string()
        .url({ message: 'Please enter a valid URL.' })
        .max(200, {
          message: 'RPC URL must be less than 200 characters.',
        })
        .optional()
        .or(z.literal('')),
      ERC8004_VALIDATOR_ADDRESS: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          value => {
            if (!value || value === '') return true
            return /^0x[a-fA-F0-9]{40}$/.test(value)
          },
          {
            message: 'Please enter a valid address.',
          },
        ),
      ERC8004_PINATA_JWT: z
        .string()
        .min(1, {
          message: 'Pinata JWT is required.',
        })
        .max(1000, {
          message: 'Pinata JWT must be less than 1000 characters.',
        }),
      ERC8004_SIGNING_KEY: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
          value => {
            if (!value || value === '') return true
            return /^[a-fA-F0-9]{64}$/.test(value)
          },
          {
            message: 'Please enter a valid private key (64 hexadecimal characters).',
          },
        ),
      ERC8004_AGENT_NAME: z.string().optional(),
      ERC8004_AGENT_DESCRIPTION: z.string().optional(),
      ERC8004_AGENT_IMAGE: z
        .string()
        .url({ message: 'Please enter a valid URL.' })
        .optional()
        .or(z.literal('')),
      ERC8004_AGENT_VERSION: z.string().optional(),
      ERC8004_AGENT_CATEGORY: z.string().optional(),
      ERC8004_AGENT_MCP: z.string().optional(),
      ERC8004_AGENT_A2A: z.string().optional(),
      ERC8004_AGENT_ENS: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    // Custom validation: if using custom chain, RPC URL is required
    if (data.secrets.ERC8004_CHAIN_SELECTION === 'custom' && !data.secrets.ERC8004_RPC_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RPC URL is required when using a custom chain.',
        path: ['secrets', 'ERC8004_RPC_URL'],
      })
    }
  })

export const tgbotFormSchema = z.object({
  secrets: z.object({
    OLLAMA_MODEL: z.string().min(1, {
      message: 'Model is required.',
    }),
    TELEGRAM_API_TOKEN: z
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
  }),
})

export const xAgentFormSchema = z.object({
  secrets: z.object({
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
  }),
})

export const hlCopyTraderFormSchema = z.object({
  secrets: z.object({
    COPY_TRADE_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: 'Please enter a valid Ethereum address (0x...).',
    }),
    WITHDRAW_FUNDS_TO: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: 'Please enter a valid Ethereum address (0x...).',
    }),
    WITHDRAW: z.enum(['false', 'true']),
  }),
})

export type MetadataFormData = z.infer<typeof metadataFormSchema>
export type CustomBuildFormData = z.infer<typeof customBuildFormSchema>
export type ERC8004FormData = z.infer<typeof erc8004Schema>
export type AgentFormData = z.infer<typeof tgbotFormSchema>
export type XAgentFormData = z.infer<typeof xAgentFormSchema>
export type HlCopyTraderFormData = z.infer<typeof hlCopyTraderFormSchema>

export type AppDataInputs = (CustomBuildFormData | AgentFormData | XAgentFormData | HlCopyTraderFormData) &
  ERC8004FormData

export type AppData = {
  templateId?: string
  metadata?: MetadataFormData
  inputs?: AppDataInputs
  network: 'mainnet' | 'testnet'
  build?: BuildFormData
}
