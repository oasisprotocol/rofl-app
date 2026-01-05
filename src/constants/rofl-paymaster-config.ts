import { sapphire, base, sapphireTestnet } from 'wagmi/chains'
import { Address } from 'viem'

export const ROFL_PAYMASTER_ENABLED_CHAINS = [base]
export const ROFL_PAYMASTER_ENABLED_CHAINS_IDS = ROFL_PAYMASTER_ENABLED_CHAINS.map(chain =>
  chain.id.toString(),
)
export const ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS = '0xNATIVE'
export const ROFL_PAYMASTER_EXPECTED_TIME = 60 // 60 seconds
export const ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT = 500_000n
export const ROFL_PAYMASTER_DESTINATION_CHAIN = sapphire
export const ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN = sapphire.nativeCurrency

export type RoflPaymasterTokenConfig = {
  contractAddress: Address
  symbol: string
  decimals: number
  name: string
}
export type RoflPaymasterChainConfig = {
  paymasterContractAddress: Address
  TOKENS: RoflPaymasterTokenConfig[]
}

export const ROFL_PAYMASTER_TOKEN_CONFIG: Record<string, RoflPaymasterChainConfig> = {
  [base.id]: {
    paymasterContractAddress: '0x7D3B4dd07bd523E519e0A91afD8e3B325586fb5b',
    TOKENS: [
      {
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        symbol: 'USDC',
        decimals: 6,
        name: 'USDC',
      },
      {
        contractAddress: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether USD',
      },
    ],
  },
}

export const ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG = {
  [sapphire.id]: '0x6997953a4458F019506370110e84eefF52d375ad' as Address,
  [sapphireTestnet.id]: '0xa26733606bf8e0bD8d77Bddb707F05d7708EfBf7' as Address,
}

export const ROFL_PAYMASTER_MIN_USD_VALUE = 1
