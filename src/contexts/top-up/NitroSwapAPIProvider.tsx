import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FC, PropsWithChildren } from 'react'
import { NitroSwapAPIContext } from './NitroSwapAPIContext'
import type { NitroSwapAPIProviderContext, NitroSwapAPIProviderState } from './NitroSwapAPIContext'
import { TOKENS_ALLOW_LIST, ENABLED_CHAINS_IDS, ROUTER_SWAP_API_URL } from '../../constants/top-up-config'
import type { TokenResponse } from '../../types/top-up'
import { sapphire } from 'viem/chains'

const nitroSwapAPIProviderInitialState: NitroSwapAPIProviderState = {
  BASE_URL: ROUTER_SWAP_API_URL,
  chains: null,
  nativeTokens: null,
  chainsLoaded: false,
  nativeTokensLoaded: false,
}

export const NitroSwapAPIContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<NitroSwapAPIProviderState>({
    ...nitroSwapAPIProviderInitialState,
  })

  const getChains: NitroSwapAPIProviderContext['getChains'] = useCallback(
    async (
      params: {
        page?: number
        limit?: number
        sortKey?: string
        sortOrder?: 'asc' | 'desc'
        isEnabledForMainnet?: boolean
        chainId?: string
      } = {},
    ) => {
      const defaultParams = {
        page: 0,
        limit: 100,
        sortKey: 'createdAt',
        sortOrder: 'asc',
        isEnabledForMainnet: true,
      }

      const searchParams = new URLSearchParams()
      const mergedParams = { ...defaultParams, ...params }

      Object.entries(mergedParams).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })

      const response = await fetch(`${state.BASE_URL}/chain?${searchParams}`)
      return await response.json()
    },
    [state.BASE_URL],
  )

  const getToken: NitroSwapAPIProviderContext['getToken'] = useCallback(
    async (
      params: {
        address?: string
        chainId?: string
        isNative?: boolean
        isReserved?: boolean
        sortKey?: string
        sortOrder?: 'asc' | 'desc'
      } = {},
    ) => {
      const defaultParams = {
        sortKey: 'createdAt',
        sortOrder: 'asc',
      }

      const searchParams = new URLSearchParams()
      const mergedParams = { ...defaultParams, ...params }

      Object.entries(mergedParams).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })

      const response = await fetch(`${state.BASE_URL}/token?${searchParams}`)
      const tokenResponse: TokenResponse = await response.json()
      const { data } = tokenResponse

      return {
        ...tokenResponse,
        data: data.filter(token =>
          TOKENS_ALLOW_LIST.some(([chainId, address]) => {
            if (token.address?.toLowerCase() !== address.toLowerCase()) {
              return false
            }
            if (chainId === '*') return true
            return token.chainId.toString() === chainId
          }),
        ),
      }
    },
    [state.BASE_URL],
  )

  const getTokens = useCallback(
    async (
      params: {
        page?: number
        limit?: number
        sortKey?: string
        sortOrder?: 'asc' | 'desc'
        chainId?: string
      } = {},
    ) => {
      const defaultParams = {
        page: 0,
        limit: 1000,
        sortKey: 'createdAt',
        sortOrder: 'asc',
      }

      const mergedParams = { ...defaultParams, ...params }

      const response = await fetch(`${state.BASE_URL}/token/getPaginatedTokens`, {
        method: 'POST',
        body: JSON.stringify(mergedParams),
      })

      return await response.json()
    },
    [state.BASE_URL],
  )

  useEffect(() => {
    const init = async () => {
      const enabledChainsPromises = ENABLED_CHAINS_IDS.map(async chainId => {
        const { data } = await getChains({ chainId })
        return data.filter(chain => chain.isLive)
      })

      const enabledChains = await Promise.all(enabledChainsPromises)

      setState(prevState => ({
        ...prevState,
        chains: enabledChains.flat(),
        chainsLoaded: true,
      }))
    }

    init()
  }, [getChains])

  useEffect(() => {
    if (!state.chains?.length) {
      return
    }

    const getTokens = async () => {
      // Load native tokens
      const tokensPromises = state.chains!.map(async chain => {
        const { data } = await getToken({
          isNative: true,
          chainId: chain.chainId,
        })
        return data
      })

      const tokens = await Promise.all(tokensPromises)

      setState(prevState => ({
        ...prevState,
        nativeTokens: tokens.flat(),
        nativeTokensLoaded: true,
      }))
    }

    getTokens()
  }, [state.chains, getToken])

  const isLoading = useMemo(() => {
    return !state.chainsLoaded || !state.nativeTokensLoaded
  }, [state.chainsLoaded, state.nativeTokensLoaded])

  const hasInitializationFailed = useMemo(() => {
    if (isLoading) return false

    const hasSapphire = state.chains?.some(chain => chain.chainId === sapphire.id.toString())

    return !hasSapphire
  }, [isLoading, state.chains])

  const providerState: NitroSwapAPIProviderContext = {
    state,
    isLoading,
    hasInitializationFailed,
    getChains,
    getToken,
    getTokens,
  }

  return <NitroSwapAPIContext.Provider value={providerState}>{children}</NitroSwapAPIContext.Provider>
}
