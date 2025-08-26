import { parse } from 'yaml'
import tgbotThumbnail from '../../../templates/tgbot/app.webp'
import tgbotTemplate from '../../../templates/tgbot/rofl-template.yaml?raw'
import tgbotCompose from '../../../templates/tgbot/compose.yaml?raw'
import tbotDocs from '../../../templates/tgbot/README.md?raw'
import xagentThumbnail from '../../../templates/x-agent/app.webp'
import xagentTemplate from '../../../templates/x-agent/rofl-template.yaml?raw'
import xagentCompose from '../../../templates/x-agent/compose.yaml?raw'
import xAgentDocs from '../../../templates/x-agent/README.md?raw'
import hlCopyTraderThumbnail from '../../../templates/hl-copy-trader/app.webp'
import hlCopyTraderTemplate from '../../../templates/hl-copy-trader/rofl-template.yaml?raw'
import hlCompose from '../../../templates/hl-copy-trader/compose.yaml?raw'
import hlCopyTraderDocs from '../../../templates/hl-copy-trader/README.md?raw'
import defaultDeployments from '../../../templates/default-deployments.yaml?raw'
import type { MetadataFormData } from './types'
import { BuildFormData } from '../../types/build-form'
import { getEvmBech32Address } from '../../utils/helpers'

const parsedDefaultDeployments = parse(defaultDeployments)
const parsedTgbotTemplate = parse(tgbotTemplate)
const parsedXagentTemplate = parse(xagentTemplate)
const parsedHlTemplate = parse(hlCopyTraderTemplate)

type ParsedTemplate = {
  name?: string
  author?: string
  description?: string
  version?: string
  homepage?: string
  resources?: {
    cpus?: number
    memory?: number
    storage?: {
      size?: number
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

type RoflData = {
  resources?: {
    cpus?: number
    memory?: number
    storage?: {
      size?: number
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

const extractMetadata = (parsedTemplate: ParsedTemplate) => ({
  name: parsedTemplate.name || '',
  author: '',
  description: parsedTemplate.description || '',
  version: parsedTemplate.version || '',
  homepage: parsedTemplate.homepage || '',
})

export const defaultBuildConfig = {
  provider: '',
  duration: 'hours' as const,
  number: 2,
  offerId: '',
  offerCpus: 0,
  offerMemory: 0,
  offerStorage: 0,
}

export const extractResources = (parsedTemplate: ParsedTemplate) => ({
  ...defaultBuildConfig,
  offerCpus: parsedTemplate.resources?.cpus || 0,
  offerMemory: parsedTemplate.resources?.memory || 0,
  offerStorage: parsedTemplate.resources?.storage?.size || 0,
})

export const fillTemplate = (
  roflData: RoflData,
  metadata: Partial<MetadataFormData>,
  buildData: Partial<BuildFormData>,
  network: 'mainnet' | 'testnet',
  appId: string,
  address: `0x${string}`,
) => {
  return {
    ...roflData,
    title: metadata.name,
    description: metadata.description,
    author: metadata.author,
    version: metadata.version,
    homepage: metadata.homepage,
    resources: {
      ...roflData.resources,
      cpus: buildData.offerCpus,
      memory: buildData.offerMemory,
      storage: {
        ...roflData.resources?.storage,
        // Reserve 2GB to prevent "ORC exceeds instance storage resources".
        // https://github.com/oasisprotocol/cli/blob/ee329dbd9e6323d62d4bf69d98521d150721a58c/cmd/rofl/build/tdx.go#L258
        // https://github.com/oasisprotocol/oasis-sdk/blob/de3c30d/rofl-scheduler/src/manager.rs#L1256
        size: buildData.offerStorage! - 2048,
      },
    },
    deployments: {
      default: {
        ...parsedDefaultDeployments.deployments.default,
        app_id: appId,
        network,
        policy: {
          ...parsedDefaultDeployments.deployments.default.policy,
          endorsements: [
            {
              provider_instance_admin: getEvmBech32Address(address),
            },
          ],
        },
      },
    },
  }
}

export const templates = [
  {
    name: parsedTgbotTemplate.name,
    customStepTitle: 'Setup Agent',
    description: parsedTgbotTemplate.description,
    image: tgbotThumbnail,
    id: 'tgbot',
    initialValues: {
      metadata: extractMetadata(parsedTgbotTemplate),
      build: extractResources(parsedTgbotTemplate),
    },
    yaml: {
      compose: tgbotCompose,
      rofl: parsedTgbotTemplate,
    },
  },
  {
    name: parsedXagentTemplate.name,
    customStepTitle: 'Setup Agent',
    description: parsedXagentTemplate.description,
    image: xagentThumbnail,
    id: 'x-agent',
    initialValues: {
      metadata: extractMetadata(parsedXagentTemplate),
      build: extractResources(parsedXagentTemplate),
    },
    yaml: {
      compose: xagentCompose,
      rofl: parsedXagentTemplate,
    },
  },
  {
    name: parsedHlTemplate.name,
    customStepTitle: 'Setup Agent',
    description: parsedHlTemplate.description,
    image: hlCopyTraderThumbnail,
    id: 'hl-copy-trader',
    initialValues: {
      metadata: extractMetadata(parsedHlTemplate),
      build: { ...extractResources(parsedHlTemplate), duration: 'days' as const, number: 7 },
    },
    yaml: {
      compose: hlCompose,
      rofl: parsedHlTemplate,
    },
  },
]

export const getTemplateById = (id: string | undefined) => {
  return templates.find(template => template.id === id)
}

export const getReadmeByTemplateId = (templateId: string) => {
  switch (templateId) {
    case 'tgbot':
      return tbotDocs
    case 'x-agent':
      return xAgentDocs
    case 'hl-copy-trader':
      return hlCopyTraderDocs
    default:
      return ''
  }
}
