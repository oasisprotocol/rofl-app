import type { Pagination } from './pagination'

export interface TokenPrice {
  token: string
  usdPrice: number
}

export interface Token {
  _id: string
  name: string
  symbol: string
  chainId: string
  logoURI: string
  decimals: number
  address: string
  provider: string
  supportedFeatures: string[]
  isNative: boolean
  isWNative: boolean
  isReserve: boolean
  createdAt: string
  updatedAt: string
  price: TokenPrice
}

export type TokenResponse = Pagination<Token>
