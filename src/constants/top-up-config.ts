import { sapphire, mainnet, bsc, tron, base, arbitrum, avalanche, polygon } from 'viem/chains'

export const ENABLED_CHAINS = [sapphire, mainnet, bsc, tron, base, arbitrum, avalanche, polygon]
export const ENABLED_CHAINS_IDS = ENABLED_CHAINS.map(chain => chain.id.toString())
export const DESTINATION_CHAIN_ID = sapphire.id.toString()
export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const ROUTER_PATHFINDER_API_URL = 'https://api-beta.pathfinder.routerprotocol.com/api/v2'
export const ROUTER_SWAP_API_URL = 'https://api.nitroswap.routernitro.com'
export const FAUCET_URL = 'https://faucet.testnet.oasis.io/'

/**
 * BLACKLIST_TOKENS represents a list of token pairs that are blacklisted.
 * Each entry in the list is an array where the first element is a chain identifier
 * and the second element is the corresponding blacklisted token's address.
 */
export const BLACKLIST_TOKENS: [string, string][] = [['1', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']]
