import { useState, useCallback, type ReactNode } from 'react'
import { useAccount, useChainId, useSignMessage } from 'wagmi'
import { useGetNonce, useLogin } from '../../backend/api'
import { RoflAppBackendAuthContext } from './Context'
import { createSiweMessage } from 'viem/siwe'
import { useInterval } from './useInterval'
import { useNetwork } from '../../hooks/useNetwork.ts'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { useChainModal } from '@rainbow-me/rainbowkit'

export function RoflAppBackendAuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const currentChainId = useChainId()
  const chainId = useNetwork('mainnet') === 'mainnet' ? sapphire.id : sapphireTestnet.id
  const { chainModalOpen, openChainModal } = useChainModal()

  const [token, _setToken] = useState<string | null>(
    // TODO: possibly already expired or from another account. Currently detected by useInterval within a few seconds.
    window.localStorage.getItem('jwt'),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { refetch: refetchNonce } = useGetNonce(isConnected ? address : undefined)
  const { mutateAsync: loginMutationAsync } = useLogin()

  const setToken = (token: string | null) => {
    _setToken(token)
    try {
      if (token) window.localStorage.setItem('jwt', token)
      else window.localStorage.removeItem('jwt')
    } catch {
      // Ignore failures like Safari incognito
    }
  }

  const getSiweMessage = useCallback((address: `0x${string}`, nonce: string, chainId: number): string => {
    const hostname = window.location.hostname
    let domain: string

    if (hostname === 'rofl.app') {
      domain = 'rofl.app'
    } else if (
      hostname === 'dev.rofl.app' ||
      hostname.endsWith('.rofl-app.pages.dev') ||
      hostname === 'localhost'
    ) {
      domain = 'dev.rofl.app'
    } else {
      domain = 'rofl.app'
    }

    const uri = `https://${domain}`
    const statement = 'Sign in to ROFL App Backend'

    return createSiweMessage({
      address,
      domain,
      statement: statement,
      uri,
      version: '1',
      chainId,
      issuedAt: new Date(),
      nonce,
    })
  }, [])

  const login = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (currentChainId !== chainId) {
      if (!chainModalOpen) {
        openChainModal?.()
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: freshNonce } = await refetchNonce()
      if (!freshNonce) {
        throw new Error('Failed to fetch nonce')
      }

      const message = getSiweMessage(address, freshNonce, chainId)
      const signature = await signMessageAsync({ message })

      const jwtToken = await loginMutationAsync({
        message,
        signature,
      })

      setToken(jwtToken)

      return jwtToken
    } catch (err) {
      console.log('Login failed:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [
    address,
    isConnected,
    currentChainId,
    chainId,
    chainModalOpen,
    openChainModal,
    refetchNonce,
    getSiweMessage,
    signMessageAsync,
    loginMutationAsync,
  ])

  const logout = useCallback(() => {
    setToken(null)
    setError(null)
    console.log('SIWE Authentication logged out')
  }, [])

  useInterval(() => {
    if (token && address && isJWTExpired(token, address)) {
      logout() // Clear token if account switches or token expires
    }
  }, 10_000) // Should be less than buffer in isJWTExpired

  const isAuthenticated = !!token

  const value = {
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
    token,
  }

  return <RoflAppBackendAuthContext.Provider value={value}>{children}</RoflAppBackendAuthContext.Provider>
}

function isJWTExpired(jwtString: string, address: string) {
  const jwt = JSON.parse(atob(jwtString.split('.')[1]))
  if (jwt.address !== address) return true

  // Based on https://github.com/DD-DeCaF/caffeine-vue/blob/da133e7c8ac5e31e4b94d2f70ddad4d26c9cbc46/src/store/modules/session.ts#L133-L144
  // Buffer is the time before *actual* expiry when the token
  // will be considered expired, to account for clock skew and
  // service-to-service requests delays.
  const buffer = 60_000
  return new Date(jwt.exp * 1000 - buffer) <= new Date()
}
