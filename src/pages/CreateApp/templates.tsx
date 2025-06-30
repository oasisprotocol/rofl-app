import { parse } from 'yaml'
import tgbotThumbnail from '../../../templates/tgbot/app.webp'
import tgbotTemplate from '../../../templates/tgbot/rofl-template.yaml?raw'
import xagentThumbnail from '../../../templates/x-agent/app.webp'
import xagentTemplate from '../../../templates/x-agent/rofl.yaml?raw'
import hlCopyTraderThumbnail from '../../../templates/hl-copy-trader/app.webp'
import hlCopyTraderTemplate from '../../../templates/hl-copy-trader/rofl.yaml?raw'
import defaultDeployments from '../../../templates/default-deployments.yaml?raw'
import type { MetadataFormData } from './types'

const parsedDefaultDeployments = parse(defaultDeployments)
const parsedTgbotTemplate = parse(tgbotTemplate)
const { compose: tgbotCompose, ...tgbotRofl } = parsedTgbotTemplate
const parsedXagentTemplate = parse(xagentTemplate)
const { compose: xagentCompose, ...xagentRofl } = parsedXagentTemplate
const parsedHlTemplate = parse(hlCopyTraderTemplate)
const { compose: hlCompose, ...hlRofl } = parsedHlTemplate

type ParsedTemplate = {
  name?: string
  author?: string
  description?: string
  version?: string
  homepage?: string
  license?: string
  [key: string]: unknown
}

const extractMetadata = (parsedTemplate: ParsedTemplate) => ({
  name: parsedTemplate.name || '',
  author: parsedTemplate.author || '',
  description: parsedTemplate.description || '',
  version: parsedTemplate.version || '',
  homepage: parsedTemplate.homepage || '',
  license: parsedTemplate.license || '',
})

export const defaultBuildConfig = {
  provider: '',
  duration: 'hours' as const,
  number: 2,
  resources: '',
}

const createTemplateParser = (roflData: Record<string, unknown>) => {
  return (metadata: Partial<MetadataFormData>, network: 'mainnet' | 'testnet', appId: string) => {
    return {
      ...roflData,
      title: metadata.name,
      description: metadata.description,
      author: metadata.author,
      version: metadata.version,
      homepage: metadata.homepage,
      license: metadata.license,
      deployments: {
        default: {
          ...parsedDefaultDeployments.deployments.default,
          app_id: appId,
          network,
        },
      },
    }
  }
}

export const templates = [
  {
    name: parsedTgbotTemplate.name,
    description: parsedTgbotTemplate.description,
    image: tgbotThumbnail,
    id: 'tgbot',
    initialValues: {
      metadata: extractMetadata(parsedTgbotTemplate),
      build: defaultBuildConfig,
    },
    yaml: {
      compose: tgbotCompose,
      rofl: tgbotRofl,
    },
    templateParser: createTemplateParser(tgbotRofl),
  },
  {
    name: parsedXagentTemplate.name,
    description: parsedXagentTemplate.description,
    image: xagentThumbnail,
    id: 'x-agent',
    initialValues: {
      metadata: extractMetadata(parsedXagentTemplate),
      build: defaultBuildConfig,
    },
    yaml: {
      compose: xagentCompose,
      rofl: xagentRofl,
    },
    templateParser: createTemplateParser(xagentRofl),
  },
  {
    name: parsedHlTemplate.name,
    description: parsedHlTemplate.description,
    image: hlCopyTraderThumbnail,
    id: 'hl-copy-trader',
    initialValues: {
      metadata: extractMetadata(parsedHlTemplate),
      build: defaultBuildConfig,
    },
    yaml: {
      compose: hlCompose,
      rofl: hlRofl,
    },
    templateParser: createTemplateParser(hlRofl),
  },
]

export const getTemplateById = (id: string | undefined) => {
  return templates.find(template => template.id === id)
}
