import { sepolia } from 'viem/chains'

export const ROFL_8004_DOCKER_IMAGE =
  'ghcr.io/oasisprotocol/rofl-8004:latest@sha256:3b4348cb5fe192c28398be93955abc025e3d9977d1f80121ef1068458d6d1f77'
export const ROFL_8004_SERVICE_NAME = 'rofl-8004'
export const ROFL_8004_SERVICE_ENV_PREFIX = 'ERC8004'

export const ROFL_8004_METADATA_KEY = 'net.oasis.app.erc8004_agent_id' // "{chainId}:{agentId}"

export const ROFL_8004_SUPPORTED_CHAINS = {
  [sepolia.id.toString()]: {
    chain: sepolia,
    rpcUrl: sepolia.rpcUrls.default.http,
    identityContract: '0x8004a6090cd10a7288092483047b097295fb8847',
  },
}
