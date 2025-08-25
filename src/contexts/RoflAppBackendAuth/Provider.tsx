import { useState, useEffect, type ReactNode, useRef } from 'react'
import { useAccount } from 'wagmi'
import { RoflAppBackendAuthContext } from './Context'
import { useInterval } from './useInterval'
import { trackEvent } from 'fathom-client'
import { AuthenticationStatus } from '@rainbow-me/rainbowkit'
import { useLocation, useNavigate } from 'react-router-dom'

export function RoflAppBackendAuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState<string | null>(window.localStorage.getItem('jwt'))
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isTokenExpired, setIsTokenExpired] = useState(false)

  // Filter out token expirations
  const hasWalletConnected = useRef(false)

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(window.localStorage.getItem('jwt'))
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    if (!!token && !hasWalletConnected.current) {
      trackEvent('Wallet connected')
      hasWalletConnected.current = true
    }
  }, [token])

  useEffect(() => {
    if (isInitialLoad && isConnected !== undefined && token !== undefined) {
      setIsInitialLoad(false)
    }
  }, [isInitialLoad, isConnected, token])

  useInterval(() => {
    const currentToken = window.localStorage.getItem('jwt')
    if (currentToken && address) {
      const expired = isJWTExpired(currentToken, address)
      setIsTokenExpired(expired)

      if (expired) {
        console.debug('Token expired, requiring re-authentication')
      } else if (currentToken !== token) {
        setToken(currentToken)
        setIsTokenExpired(false)
      }
    } else if (currentToken !== token) {
      setToken(currentToken)
      setIsTokenExpired(false)
    }
  }, 10_000) // Should be less than buffer in isJWTExpired

  const isAuthenticated = !!token && !!address && !isTokenExpired && isConnected

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/') {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, isAuthenticated, location.pathname])

  // Authentication status for RainbowKit
  const getAuthenticationStatus = (): AuthenticationStatus => {
    if (isInitialLoad) {
      return 'loading'
    }

    if (!isConnected || !address) {
      return 'unauthenticated'
    }

    if (!!token && !isTokenExpired) {
      return 'authenticated'
    }

    return 'unauthenticated'
  }

  const status = getAuthenticationStatus()

  // TODO: Mark for removal (debug)
  useEffect(() => {
    console.debug('Auth state:', {
      isAuthenticated,
      isConnected,
      hasToken: !!token,
      address,
      status,
      isTokenExpired,
    })
  }, [isAuthenticated, isConnected, token, address, status, isTokenExpired])

  const value = {
    token,
    isAuthenticated,
    status,
  }

  return <RoflAppBackendAuthContext.Provider value={value}>{children}</RoflAppBackendAuthContext.Provider>
}

function isJWTExpired(jwtString: string, address: string) {
  try {
    const jwt = JSON.parse(atob(jwtString.split('.')[1]))

    if (jwt.address?.toLowerCase() !== address.toLowerCase()) {
      console.debug('JWT address mismatch', { jwtAddress: jwt.address, currentAddress: address })
      return true
    }

    // Based on https://github.com/DD-DeCaF/caffeine-vue/blob/da133e7c8ac5e31e4b94d2f70ddad4d26c9cbc46/src/store/modules/session.ts#L133-L144
    // Buffer is the time before *actual* expiry when the token
    // will be considered expired, to account for clock skew and
    // service-to-service requests delays.
    const buffer = 60_000
    return new Date(jwt.exp * 1000 - buffer) <= new Date()
  } catch {
    return true
  }
}
