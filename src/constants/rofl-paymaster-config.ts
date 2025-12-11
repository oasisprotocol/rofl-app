import { sapphire, sapphireTestnet, base } from 'viem/chains'
import { Address } from 'viem'

export const ROFL_PAYMASTER_ENABLED_CHAINS = [base]
export const ROFL_PAYMASTER_ENABLED_CHAINS_IDS = ROFL_PAYMASTER_ENABLED_CHAINS.map(chain =>
  chain.id.toString(),
)
export const ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS = '0xNATIVE'
export const ROFL_PAYMASTER_EXPECTED_TIME = 30 // 30 seconds
export const ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT = 500_000n
export const ROFL_PAYMASTER_DESTINATION_CHAIN = sapphire
export const ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN = sapphire.nativeCurrency

type RoflPaymasterTokenConfig = {
  [chainId: string]: {
    paymasterContractAddress: Address
    TOKENS: {
      contractAddress: Address
      symbol: string
      decimals: number
      name: string
    }[]
  }
}

export const ROFL_PAYMASTER_TOKEN_CONFIG: RoflPaymasterTokenConfig = {
  [base.id]: {
    paymasterContractAddress: '0x7D3B4dd07bd523E519e0A91afD8e3B325586fb5b',
    TOKENS: [
      {
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        symbol: 'USDC',
        decimals: 6,
        name: 'USDC',
      },
    ],
  },
}

export const ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG = {
  [sapphire.id]: '0x6997953a4458F019506370110e84eefF52d375ad' as Address,
  [sapphireTestnet.id]: '0xa26733606bf8e0bD8d77Bddb707F05d7708EfBf7' as Address,
}
