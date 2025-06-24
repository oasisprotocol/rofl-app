import type { Pagination } from './pagination'

export interface GasLimitConfig {
  swap: number
  transfer: number
}

export interface GasLimit {
  trustless: GasLimitConfig
  mintBurn: GasLimitConfig
  circle: GasLimitConfig
}

export interface GasToken {
  symbol: string
  address: string
}

export interface Chain {
  _id: string
  chainId: string
  __v: number
  createdAt: string
  gasLimit: GasLimit
  isLive: boolean
  name: string
  type: string
  updatedAt: string
  isIntentApiSupported: boolean
  isEnabledForMainnet: boolean
  gasToken: GasToken | null
  isRefuelEnabled: boolean
  isQREnabled: boolean
}

export type ChainsResponse = Pagination<Chain>
