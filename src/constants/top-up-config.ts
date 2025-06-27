import { sapphire, mainnet, bsc, tron, base, arbitrum, avalanche, polygon } from 'viem/chains'

export const ENABLED_CHAINS = [sapphire, mainnet, bsc, tron, base, arbitrum, avalanche, polygon]
export const ENABLED_CHAINS_IDS = ENABLED_CHAINS.map(chain => chain.id.toString())
export const DESTINATION_CHAIN_ID = sapphire.id.toString()
export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const ROUTER_PATHFINDER_API_URL = 'https://api-beta.pathfinder.routerprotocol.com/api/v2'
export const ROUTER_SWAP_API_URL = 'https://api.nitroswap.routernitro.com'
export const FAUCET_URL = 'https://faucet.testnet.oasis.io/'

/**
 * TOKENS_ALLOW_LIST represents a list of token pairs that are allowed.
 * Each entry in the list is an array where the first element is a chain identifier
 * and the second element is the corresponding token's address.
 */
export const TOKENS_ALLOW_LIST: [string, string][] = [
  ['*', NATIVE_TOKEN_ADDRESS], // Allow all native tokens
  ['137', '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'], // Polygon - USDC
  ['137', '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'], // Polygon - USDT
  ['43114', '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'], // Avax - USDC
  ['43114', '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'], // Avax - USDT
  ['42161', '0xaf88d065e77c8cc2239327c5edb3a432268e5831'], // Arbitrum - USDC
  ['42161', '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'], // Arbitrum - USDT
  ['8453', '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'], // Base - USDC
  ['728126428', '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c'], // Tron - USDT
  ['56', '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'], // BNB - USDC
  ['56', '0x55d398326f99059ff775485246999027b3197955'], // BNB - USDT
  ['1', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'], // ETH - USDC
  ['1', '0xdac17f958d2ee523a2206206994597c13d831ec7'], // ETH - USDT
]
