import { createContext } from 'react'
import type { Chain, ChainsResponse, Token, TokenResponse } from '../../types/top-up'

export interface NitroSwapAPIProviderState {
  BASE_URL: string
  chains: Chain[] | null
  nativeTokens: Token[] | null
  chainsLoaded: boolean
  nativeTokensLoaded: boolean
}

export interface NitroSwapAPIProviderContext {
  state: NitroSwapAPIProviderState
  isLoading: boolean
  hasInitializationFailed: boolean
  getChains: (params?: {
    page?: number
    limit?: number
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
    isEnabledForMainnet?: boolean
    chainId?: string
  }) => Promise<ChainsResponse>
  getToken: (params?: {
    address?: string
    chainId?: string
    isNative?: boolean
    isReserved?: boolean
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
  }) => Promise<TokenResponse>
  getTokens: (params?: {
    page?: number
    limit?: number
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
    chainId?: string
  }) => Promise<TokenResponse>
}

export const NitroSwapAPIContext = createContext<NitroSwapAPIProviderContext>(
  {} as NitroSwapAPIProviderContext,
)
