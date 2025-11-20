import {
  ROFL_8004_CHAIN,
  ROFL_8004_METADATA_KEY,
  ROFL_8004_SERVICE_RPC_URL_BASE,
} from '../constants/rofl-8004.ts'
import { RoflInstance } from '../nexus/generated/api.ts'

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
