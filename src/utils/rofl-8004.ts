import {
  ROFL_8004_DOCKER_IMAGE,
  ROFL_8004_METADATA_KEY,
  ROFL_8004_SERVICE_ENV_PREFIX,
  ROFL_8004_SERVICE_NAME,
  ROFL_8004_SUPPORTED_CHAINS,
  ROFL_8004_VOLUME_NAME,
} from '../constants/rofl-8004.ts'
import { RoflInstance } from '../nexus/generated/api.ts'
import { AppData, ERC8004FormData } from '../pages/CreateApp/types.ts'
import * as yaml from 'yaml'
import { parse } from 'yaml'

interface ComposeFile {
  services: Record<string, unknown>
  volumes?: Record<string, unknown | null>
  [key: string]: unknown
}

export const fromMetadataToAgentMetadata = (
  metadata: RoflInstance['metadata'],
): { chainId: number | null; agentId: bigint | null; chainName: string | null } | null => {
  const agentId = metadata?.[ROFL_8004_METADATA_KEY] as string
  const splitAgentId = agentId?.split(':')
  const chainId = Number(splitAgentId[0])

  if (!Object.keys(ROFL_8004_SUPPORTED_CHAINS).includes(chainId.toString())) {
    console.warn(
      `Invalid chainId: ${chainId}. Expected: ${Object.keys(ROFL_8004_SUPPORTED_CHAINS).join(',')}`,
    )
    // Silently fail
    return null
  }

  return {
    chainId,
    chainName: ROFL_8004_SUPPORTED_CHAINS[chainId.toString()].chain.name.toLowerCase(),
    agentId: BigInt(splitAgentId[1]),
  }
}

export const tokenURIToLink = (tokenURI: string) => tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')

export const hasRofl8004ServiceSecrets = (appData: AppData) => {
  return Object.keys(appData.inputs?.secrets ?? {}).some(key =>
    key.toUpperCase().startsWith(ROFL_8004_SERVICE_ENV_PREFIX),
  )
}

export const addRofl8004ServiceToCompose = (composeYaml: string, appData: AppData): string => {
  const compose = parse(composeYaml) as ComposeFile

  const environment = Object.keys(appData.inputs?.secrets ?? {})
    .filter(key => key.toUpperCase().startsWith(ROFL_8004_SERVICE_ENV_PREFIX))
    .reduce(
      (acc, key) => {
        const erc8004Key = key as keyof ERC8004FormData['secrets']

        if (appData.inputs?.secrets?.[erc8004Key]) {
          // Exception: ERC8004_SIGNING_KEY does not need to strip the prefix
          const envKey = ['ERC8004_SIGNING_KEY'].includes(key)
            ? key
            : key.replace(`${ROFL_8004_SERVICE_ENV_PREFIX}_`, '')
          acc[envKey] = `\${${key}}`
        }

        return acc
      },
      {
        // Pre-existing agent ID, if it is already registered.
        AGENT_ID: `\${${ROFL_8004_SERVICE_ENV_PREFIX}_AGENT_ID-}`,
        // Additional TEE-derived public keys to be stored inside ROFL Metadata
        PUBLIC_KEY_IDS: `\${${ROFL_8004_SERVICE_ENV_PREFIX}_PUBLIC_KEY_IDS-}`,
      } as Record<string, string>,
    )

  compose.services[ROFL_8004_SERVICE_NAME] = {
    image: ROFL_8004_DOCKER_IMAGE,
    platform: 'linux/amd64',
    environment,
    volumes: ['/run/rofl-appd.sock:/run/rofl-appd.sock', `${ROFL_8004_VOLUME_NAME}:/root/.rofl-8004`],
  }

  if (!compose.volumes) {
    compose.volumes = {}
  }
  compose.volumes[ROFL_8004_VOLUME_NAME] = null

  return yaml.stringify(compose)
}
