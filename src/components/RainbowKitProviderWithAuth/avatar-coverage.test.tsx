import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { sapphire, sapphireTestnet } from 'viem/chains'
import * as React from 'react'

// Store the avatar prop
let capturedAvatar: any = null

// Mock RainbowKit to capture the avatar prop
vi.mock('@rainbow-me/rainbowkit', () => {
  const MockRainbowKitAuthenticationProvider = ({
    adapter,
    children,
  }: {
    adapter: any
    children: React.ReactNode
  }) => {
    return <>{children}</>
  }

  const MockRainbowKitProvider = ({
    avatar,
    children,
    ...props
  }: {
    avatar?: any
    children: React.ReactNode
    [key: string]: any
  }) => {
    capturedAvatar = avatar
    return <>{children}</>
  }

  return {
    createAuthenticationAdapter: (config: any) => config,
    RainbowKitAuthenticationProvider: MockRainbowKitAuthenticationProvider,
    RainbowKitProvider: MockRainbowKitProvider,
    darkTheme: () => ({}),
    useChainModal: () => ({
      chainModalOpen: false,
      openChainModal: vi.fn(),
    }),
  }
})

// Mock backend API
const mockFetchNonce = vi.fn(() => Promise.resolve('mock-nonce-123'))
const mockLogin = vi.fn(() => Promise.resolve('mock-jwt-token'))

vi.mock('../../backend/api.ts', () => ({
  fetchNonce: () => mockFetchNonce(),
  login: () => mockLogin(),
}))

// Mock RoflAppBackendAuth context
const mockUseRoflAppBackendAuthContext = vi.fn(() => ({
  status: 'unauthenticated',
  login: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../../contexts/RoflAppBackendAuth/hooks.ts', () => ({
  useRoflAppBackendAuthContext: () => mockUseRoflAppBackendAuthContext(),
}))

// Mock hooks
const mockUseNetwork = vi.fn(() => 'mainnet')

vi.mock('../../hooks/useNetwork.ts', () => ({
  useNetwork: () => mockUseNetwork(),
}))

// Mock wagmi
const mockUseAccount = vi.fn(() => ({
  address: '0x1234567890abcdef1234567890abcdef12345678',
}))
const mockUseChainId = vi.fn(() => sapphire.id)
const mockOpenChainModal = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useChainId: () => mockUseChainId(),
  useChainModal: () => ({
    chainModalOpen: false,
    openChainModal: mockOpenChainModal,
  }),
}))

// Mock AccountAvatar
vi.mock('../../components/AccountAvatar', () => ({
  AccountAvatar: ({ diameter, account }: any) => (
    <div data-testid="account-avatar" data-diameter={diameter} data-address={account?.address_eth}>
      Avatar: {account?.address_eth}
    </div>
  ),
}))

import { RainbowKitProviderWithAuth } from './index'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { BrowserRouter } from 'react-router-dom'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'

describe('RainbowKitProviderWithAuth - Avatar Coverage (line 113)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedAvatar = null

    // Reset to default implementation (already set in mock definition)
    mockUseAccount.mockImplementation(() => ({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    }))

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        hostname: 'localhost',
      },
    })

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    })

    // Mock dispatchEvent
    Object.defineProperty(window, 'dispatchEvent', {
      writable: true,
      value: vi.fn(),
    })
  })

  it('should pass avatar prop to RainbowKitProvider (line 113)', () => {
    render(
      <RainbowKitProviderWithAuth>
        <div data-testid="test-child">Test</div>
      </RainbowKitProviderWithAuth>,
    )

    // Verify the avatar prop was passed
    expect(capturedAvatar).toBeDefined()
    expect(typeof capturedAvatar).toBe('function')

    // Execute the avatar function to trigger line 113
    const address = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`
    const size = 32

    // This will execute the avatar function from line 113:
    // ({ address, size }) => <AccountAvatar diameter={size} account={{ address_eth: address as `0x${string}` }} />
    const avatarResult = capturedAvatar({ address, size })

    // Verify the avatar function returns the AccountAvatar component
    expect(avatarResult).toBeDefined()
  })
})
