import { createContext } from 'react'
import { AuthenticationStatus } from '@rainbow-me/rainbowkit'

export interface RoflAppBackendAuthContextType {
  token: string | null
  isAuthenticated: boolean
  isTokenExpired: boolean
  status: AuthenticationStatus
}

export const RoflAppBackendAuthContext = createContext<RoflAppBackendAuthContextType | undefined>(undefined)
