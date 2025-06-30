import { useState, useCallback, type ReactNode } from 'react'
import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { useGetNonce, useLogin } from '../../backend/api'
import { RoflAppBackendAuthContext } from './Context'
import { createSiweMessage } from 'viem/siwe'
import { useInterval } from './useInterval'

const { PROD } = import.meta.env

export function RoflAppBackendAuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const chainId = useChainId()

  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { refetch: refetchNonce } = useGetNonce(isConnected ? address : undefined)
  const { mutateAsync: loginMutationAsync } = useLogin()

  const getSiweMessage = useCallback((address: `0x${string}`, nonce: string, chainId: number): string => {
    const domain = PROD ? window.location.hostname : 'dev.rofl.app'
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

    setIsLoading(true)
    setError(null)

    try {
      const { data: freshNonce } = await refetchNonce()
      if (!freshNonce) {
        throw new Error('Failed to fetch nonce')
      }

      const message = getSiweMessage(address, freshNonce, chainId || 1)
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
  }, [address, isConnected, refetchNonce, getSiweMessage, chainId, signMessageAsync, loginMutationAsync])

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
