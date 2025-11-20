import { sepolia } from 'viem/chains'
import { createPublicClient, http } from 'viem'

export const ROFL_8004_SERVICE_NAME = 'rofl-8004'
export const ROFL_8004_SERVICE_ENV_PREFIX = 'ERC_8004'
export const ROFL_8004_SERVICE_RPC_URL_BASE = 'https://sepolia.infura.io/v3/'

export const ROFL_8004_CHAIN = sepolia
export const ROFL_8004_PUBLIC_CLIENT = createPublicClient({
  chain: ROFL_8004_CHAIN,
  transport: http(),
})
export const ROFL_8004_AGENT_IDENTITY_CONTRACT = '0x8004a6090cd10a7288092483047b097295fb8847'
export const ROFL_8004_METADATA_KEY = 'net.oasis.app.erc8004_agent_id' // "{chainId}:{agentId}"
