import { useState, useCallback, type ReactNode } from 'react'
import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { useGetNonce, useLogin } from '../../backend/api'
import { RoflAppBackendAuthContext } from './Context'
import { createSiweMessage } from 'viem/siwe'

export function RoflAppBackendAuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const chainId = useChainId()

  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { refetch: refetchNonce } = useGetNonce(isConnected ? address : undefined)
  const loginMutation = useLogin()

  const getSiweMessage = useCallback((address: `0x${string}`, nonce: string, chainId: number): string => {
    const roflAppBackendUrl = new URL(import.meta.env.VITE_ROFL_APP_BACKEND)
    const domain = roflAppBackendUrl.hostname
    const uri = roflAppBackendUrl.origin
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

      const jwtToken = await loginMutation.mutateAsync({
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
  }, [address, isConnected, refetchNonce, getSiweMessage, chainId, signMessageAsync, loginMutation])

  const logout = useCallback(() => {
    setToken(null)
    setError(null)
    console.log('SIWE Authentication logged out')
  }, [])

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
