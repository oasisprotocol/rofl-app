import { sepolia } from 'viem/chains'

export const ROFL_8004_DOCKER_IMAGE =
  'ghcr.io/oasisprotocol/rofl-8004:latest@sha256:671633f634402e147f90115d1c139ba4d955842276eadf95e29a9034d14a7d49'
export const ROFL_8004_SERVICE_NAME = 'rofl-8004'
export const ROFL_8004_VOLUME_NAME = 'rofl-8004-volume'
export const ROFL_8004_SERVICE_ENV_PREFIX = 'ERC8004'

export const ROFL_8004_METADATA_KEY = 'net.oasis.app.erc8004_agent_id' // "{chainId}:{agentId}"

export const ROFL_8004_SUPPORTED_CHAINS = {
  [sepolia.id.toString()]: {
    chain: sepolia,
    rpcUrl: sepolia.rpcUrls.default.http,
    identityContract: '0x8004a6090cd10a7288092483047b097295fb8847',
    validatorAddress: '0x7cd2eccd146b6626c8a500ab5644b1a506115e6f',
  },
}

export const ERC_8004_ETHEREUM_EIP_URL = 'https://eips.ethereum.org/EIPS/eip-8004'
export const get8004ScanUrl = (chainName: string, agentId: string) =>
  `https://www.8004scan.io/${chainName}/agent/${agentId}`
