import {
  ROFL_8004_CHAIN,
  ROFL_8004_METADATA_KEY,
  ROFL_8004_SERVICE_ENV_PREFIX,
  ROFL_8004_SERVICE_NAME,
  ROFL_8004_SERVICE_RPC_URL_BASE,
} from '../constants/rofl-8004.ts'
import { RoflInstance } from '../nexus/generated/api.ts'
import { AppData, ERC8004FormData } from '../pages/CreateApp/types.ts'
import * as yaml from 'yaml'
import { parse } from 'yaml'

export const stripROFL8004RpcPrefix = (url: string | undefined): string => {
  if (!url) return ''
  return url.startsWith(ROFL_8004_SERVICE_RPC_URL_BASE)
    ? url.slice(ROFL_8004_SERVICE_RPC_URL_BASE.length)
    : url
}
export const addROFL8004RpcPrefix = (apiToken: string): string => {
  if (!apiToken) return ''
  return `${ROFL_8004_SERVICE_RPC_URL_BASE}${apiToken}`
}

export const fromMetadataToAgentId = (metadata: RoflInstance['metadata']) => {
  const agentId = metadata?.[ROFL_8004_METADATA_KEY] as string
  const splitAgentId = agentId?.split(':')
  const chainId = Number(splitAgentId[0])

  if (chainId !== ROFL_8004_CHAIN.id)
    throw new Error(`Invalid chainId: ${chainId}. Expected: ${ROFL_8004_CHAIN.id}`)

  return BigInt(splitAgentId[1])
}

export const tokenURIToLink = (tokenURI: string) => tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')

export const hasRofl8004ServiceSecrets = (appData: AppData) => {
  return Object.keys(appData.inputs?.secrets ?? {}).some(key =>
    key.toUpperCase().startsWith(ROFL_8004_SERVICE_ENV_PREFIX),
  )
}

export const addRofl8004ServiceToCompose = (composeYaml: string, appData: AppData): string => {
  const compose = parse(composeYaml)

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
        // TODO: Fails, as docker will default to empty string, and not None(Python)
        // Pre-existing agent ID, if it is already registered.
        // AGENT_ID: `\${${ROFL_8004_SERVICE_ENV_PREFIX}_AGENT_ID-}`,
        // Additional TEE-derived public keys to be stored inside ROFL Metadata
        // PUBLIC_KEY_IDS: `\${${ROFL_8004_SERVICE_ENV_PREFIX}_PUBLIC_KEY_IDS-}`,
        // Validator address on ERC-8004 chain.
        // VALIDATOR_ADDRESS: `\${${ROFL_8004_SERVICE_ENV_PREFIX}_VALIDATOR_ADDRESS-}`,
      } as Record<string, string>,
    )

  compose.services[ROFL_8004_SERVICE_NAME] = {
    image:
      'ghcr.io/oasisprotocol/rofl-8004:latest@sha256:f57373103814a0ca4c0a03608284451221b026e695b0b8ce9ca3d4153819a349',
    platform: 'linux/amd64',
    environment,
    volumes: ['/run/rofl-appd.sock:/run/rofl-appd.sock'],
  }

  return yaml.stringify(compose)
}
