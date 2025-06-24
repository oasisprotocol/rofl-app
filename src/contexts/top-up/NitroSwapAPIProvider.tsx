import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FC, PropsWithChildren } from 'react'
import { NitroSwapAPIContext } from './NitroSwapAPIContext'
import type { NitroSwapAPIProviderContext, NitroSwapAPIProviderState } from './NitroSwapAPIContext'
import { BLACKLIST_TOKENS, ENABLED_CHAINS_IDS, ROUTER_SWAP_API_URL } from '../../constants/top-up-config'
import type { TokenResponse } from '../../types/top-up'

const nitroSwapAPIProviderInitialState: NitroSwapAPIProviderState = {
  BASE_URL: ROUTER_SWAP_API_URL,
  chains: null,
  nativeTokens: null,
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
        data: data.filter(
          token =>
            !BLACKLIST_TOKENS.some(
              ([chainId, address]) =>
                token.chainId === chainId && token.address?.toLowerCase() === address.toLowerCase(),
            ),
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
      }))
    }

    getTokens()
  }, [state.chains, getToken])

  const isLoading = useMemo(() => {
    if (ENABLED_CHAINS_IDS.length !== state.chains?.length) return true
    if (ENABLED_CHAINS_IDS.length !== state.nativeTokens?.length) return true
    return false
  }, [state.chains, state.nativeTokens])

  const providerState: NitroSwapAPIProviderContext = {
    state,
    isLoading,
    getChains,
    getToken,
    getTokens,
  }

  return <NitroSwapAPIContext.Provider value={providerState}>{children}</NitroSwapAPIContext.Provider>
}
