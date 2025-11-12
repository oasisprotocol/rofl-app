import { sapphire, sapphireTestnet, sepolia } from 'viem/chains'
import { Address } from 'viem'

export const ROFL_PAYMASTER_ENABLED_CHAINS = [sepolia]
export const ROFL_PAYMASTER_ENABLED_CHAINS_IDS = ROFL_PAYMASTER_ENABLED_CHAINS.map(chain =>
  chain.id.toString(),
)
export const ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS = '0xNATIVE'
export const ROFL_PAYMASTER_EXPECTED_TIME = 30 // 30 seconds
export const ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT = 500_000n
export const ROFL_PAYMASTER_DESTINATION_CHAIN = sapphireTestnet
export const ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN = sapphireTestnet.nativeCurrency

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
  [sepolia.id]: {
    paymasterContractAddress: '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
    TOKENS: [
      {
        contractAddress: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether USD',
      },
    ],
  },
}

export const ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG = {
  [sapphire.id]: '0x0000000000000000000000000000000000000000' as Address,
  [sapphireTestnet.id]: '0xa26733606bf8e0bD8d77Bddb707F05d7708EfBf7' as Address,
}
