import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { sapphire, sapphireTestnet } from 'viem/chains'
import * as React from 'react'

// Store the actual adapter created by the component
let capturedAdapter: any = null

// Mock wagmi config BEFORE importing RainbowKitProviderWithAuth
vi.mock('../../constants/wagmi-config.ts', () => ({
  wagmiConfig: {},
}))

vi.mock('@rainbow-me/rainbowkit', () => {
  const MockRainbowKitAuthenticationProvider = ({
    adapter,
    children,
  }: {
    adapter: any
    children: React.ReactNode
  }) => {
    capturedAdapter = adapter
    return <>{children}</>
  }

  return {
    getDefaultConfig: vi.fn(() => ({})),
    createAuthenticationAdapter: (config: any) => config,
    RainbowKitAuthenticationProvider: MockRainbowKitAuthenticationProvider,
    RainbowKitProvider: ({ children, ...props }: any) => <>{children}</>,
    darkTheme: () => ({}),
    useChainModal: () => ({
      chainModalOpen: false,
      openChainModal: vi.fn(),
    }),
  }
})

// Mock createSiweMessage to return a proper SIWE message object
vi.mock('viem/siwe', () => ({
  createSiweMessage: (params: any) => ({
    ...params,
    issuedAt: params.issuedAt || new Date(),
  }),
}))

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
const mockUseAccount = vi.fn()
const mockUseChainId = vi.fn()
const mockOpenChainModal = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useChainId: () => mockUseChainId(),
  useChainModal: () => ({
    chainModalOpen: false,
    openChainModal: mockOpenChainModal,
  }),
}))

// Mock AccountAvatar - render actual component for line 113
vi.mock('../../components/AccountAvatar', () => ({
  AccountAvatar: ({ diameter, account }: any) => (
    <div
      data-testid="account-avatar"
      data-diameter={diameter}
      data-address={account?.address_eth}
      data-address-eth={account?.address_eth}
    >
      Avatar: {account?.address_eth}
    </div>
  ),
}))

import { RainbowKitProviderWithAuth } from './index'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a query client for tests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('RainbowKitProviderWithAuth - Remaining Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedAdapter = null

    // Reset mocks
    mockUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    })
    mockUseChainId.mockReturnValue(sapphire.id)

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

  describe('getNonce method (lines 33-35)', () => {
    it('should call fetchNonce with address', async () => {
      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      // Execute getNonce method (line 34)
      const nonce = await capturedAdapter!.getNonce!()

      // Verify fetchNonce was called
      expect(mockFetchNonce).toHaveBeenCalled()
      expect(nonce).toBe('mock-nonce-123')
    })
  })

  describe('createMessage method - all domains (lines 38-68)', () => {
    it('should create message for rofl.app domain (lines 41-42)', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'rofl.app',
        },
      })

      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      // Execute createMessage method
      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify domain is 'rofl.app' (line 42)
      expect(message).toHaveProperty('domain', 'rofl.app')
    })

    it('should create message for stg.rofl.app domain (lines 43-44)', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'stg.rofl.app',
        },
      })

      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify domain is 'stg.rofl.app' (line 44)
      expect(message).toHaveProperty('domain', 'stg.rofl.app')
    })

    it('should create message for dev.rofl.app domain (line 46)', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'dev.rofl.app',
        },
      })

      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify domain is 'dev.rofl.app' (line 50)
      expect(message).toHaveProperty('domain', 'dev.rofl.app')
    })

    it('should create message for .rofl-app.pages.dev domain (line 47)', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'test.rofl-app.pages.dev',
        },
      })

      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify domain is 'dev.rofl.app' (line 50)
      expect(message).toHaveProperty('domain', 'dev.rofl.app')
    })

    it('should create message for localhost domain (line 48)', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'localhost',
        },
      })

      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify domain is 'dev.rofl.app' (line 50)
      expect(message).toHaveProperty('domain', 'dev.rofl.app')
    })

    it('should create message for unknown domain with default (line 52)', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'unknown.com',
        },
      })

      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify domain defaults to 'rofl.app' (line 52)
      expect(message).toHaveProperty('domain', 'rofl.app')
    })

    it('should create message with correct URI (line 55)', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'rofl.app',
        },
      })

      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify URI (line 55)
      expect(message).toHaveProperty('uri', 'https://rofl.app')
    })

    it('should create message with correct statement (line 56)', async () => {
      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const message = capturedAdapter!.createMessage!({
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: sapphire.id,
      })

      // Verify statement (line 56)
      expect(message).toHaveProperty('statement', 'Sign in to ROFL App Backend')
    })

    it('should create message with all required fields (lines 58-67)', async () => {
      render(
        <Wrapper>
          <RainbowKitProviderWithAuth>
            <div>Test</div>
          </RainbowKitProviderWithAuth>
        </Wrapper>,
      )

      expect(capturedAdapter).not.toBeNull()

      const params = {
        nonce: 'test-nonce',
        address: '0x1234567890abcdef1234567890abcdef12345678' as const,
        chainId: sapphire.id,
      }

      const message = capturedAdapter!.createMessage!(params)

      // Verify all fields from lines 58-67
      expect(message).toHaveProperty('address', params.address)
      expect(message).toHaveProperty('domain')
      expect(message).toHaveProperty('statement', 'Sign in to ROFL App Backend')
      expect(message).toHaveProperty('uri')
      expect(message).toHaveProperty('version', '1')
      expect(message).toHaveProperty('chainId', params.chainId)
      expect(message).toHaveProperty('nonce', params.nonce)
      expect(message).toHaveProperty('issuedAt')
      expect(message.issuedAt).toBeInstanceOf(Date)
    })
  })
})
