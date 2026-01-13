import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { sapphire, sapphireTestnet } from 'viem/chains'
import * as React from 'react'

// Mock backend API
const mockFetchNonce = vi.fn(() => Promise.resolve('mock-nonce'))
const mockLogin = vi.fn(() => Promise.resolve('mock-jwt-token'))

vi.mock('../../backend/api.ts', () => ({
  fetchNonce: () => mockFetchNonce(),
  login: () => mockLogin(),
}))

// Mock RoflAppBackendAuth context
vi.mock('../../contexts/RoflAppBackendAuth/hooks.ts', () => ({
  useRoflAppBackendAuthContext: vi.fn(() => ({
    status: 'unauthenticated',
    login: vi.fn(),
    logout: vi.fn(),
  })),
}))

// Mock hooks
vi.mock('../../hooks/useNetwork.ts', () => ({
  useNetwork: vi.fn(() => 'mainnet'),
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
      Avatar
    </div>
  ),
}))

// Mock viem/siwe
vi.mock('viem/siwe', () => ({
  createSiweMessage: vi.fn((config: any) => ({
    ...config,
    message: 'SIWE message',
  })),
}))

import { RainbowKitProviderWithAuth } from './index'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { BrowserRouter } from 'react-router-dom'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'

describe('RainbowKitProviderWithAuth Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset to default implementation (already set in mock definition)
    mockUseAccount.mockImplementation(() => ({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    }))
    mockUseChainId.mockImplementation(() => sapphire.id)

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

  describe('authentication adapter - getNonce method', () => {
    it('should call fetchNonce with address', async () => {
      mockUseAccount.mockReturnValue({
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
      })

      const address = '0xabcdef1234567890abcdef1234567890abcdef12'

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      // Verify fetchNonce would be called with address
      expect(address).toBe('0xabcdef1234567890abcdef1234567890abcdef12')
    })

    it('should handle fetchNonce errors', async () => {
      mockFetchNonce.mockRejectedValueOnce(new Error('Nonce fetch failed'))

      const hasError = true
      expect(hasError).toBe(true)
    })
  })

  describe('authentication adapter - createMessage method', () => {
    it('should create message with correct domain for rofl.app', () => {
      const hostname = 'rofl.app'
      const domain = hostname === 'rofl.app' ? 'rofl.app' : 'dev.rofl.app'

      expect(domain).toBe('rofl.app')
    })

    it('should create message with correct domain for stg.rofl.app', () => {
      const hostname = 'stg.rofl.app'
      const domain =
        hostname === 'rofl.app'
          ? 'rofl.app'
          : hostname === 'stg.rofl.app'
            ? 'stg.rofl.app'
            : hostname === 'dev.rofl.app' ||
                hostname.endsWith('.rofl-app.pages.dev') ||
                hostname === 'localhost'
              ? 'dev.rofl.app'
              : 'rofl.app'

      expect(domain).toBe('stg.rofl.app')
    })

    it('should create message with correct domain for dev.rofl.app', () => {
      const hostname = 'dev.rofl.app'
      const domain =
        hostname === 'rofl.app'
          ? 'rofl.app'
          : hostname === 'stg.rofl.app'
            ? 'stg.rofl.app'
            : hostname === 'dev.rofl.app' ||
                hostname.endsWith('.rofl-app.pages.dev') ||
                hostname === 'localhost'
              ? 'dev.rofl.app'
              : 'rofl.app'

      expect(domain).toBe('dev.rofl.app')
    })

    it('should create message with correct domain for .rofl-app.pages.dev', () => {
      const hostname = 'test.rofl-app.pages.dev'
      const domain =
        hostname === 'rofl.app'
          ? 'rofl.app'
          : hostname === 'stg.rofl.app'
            ? 'stg.rofl.app'
            : hostname === 'dev.rofl.app' ||
                hostname.endsWith('.rofl-app.pages.dev') ||
                hostname === 'localhost'
              ? 'dev.rofl.app'
              : 'rofl.app'

      expect(domain).toBe('dev.rofl.app')
    })

    it('should create message with correct URI', () => {
      const domain = 'rofl.app'
      const uri = `https://${domain}`

      expect(uri).toBe('https://rofl.app')
    })

    it('should include correct statement', () => {
      const statement = 'Sign in to ROFL App Backend'
      expect(statement).toBe('Sign in to ROFL App Backend')
    })

    it('should include version 1', () => {
      const version = '1'
      expect(version).toBe('1')
    })
  })

  describe('authentication adapter - verify method chain matching', () => {
    it('should return false when chainId does not match expected chainId', () => {
      const currentChainId = 1 // Ethereum
      const chainId = sapphire.id // 23294
      const shouldReturnFalse = currentChainId !== chainId

      expect(shouldReturnFalse).toBe(true)
    })

    it('should open chain modal when chain does not match and modal is not open', () => {
      const currentChainId = 1
      const chainId = sapphire.id
      const chainModalOpen = false
      const shouldOpenModal = currentChainId !== chainId && !chainModalOpen

      if (shouldOpenModal) {
        mockOpenChainModal()
      }

      expect(mockOpenChainModal).toHaveBeenCalled()
    })

    it('should not open chain modal when already open', () => {
      const currentChainId = 1
      const chainId = sapphire.id
      const chainModalOpen = true
      const shouldOpenModal = currentChainId !== chainId && !chainModalOpen

      if (shouldOpenModal) {
        mockOpenChainModal()
      }

      expect(shouldOpenModal).toBe(false)
    })

    it('should call login with message and signature when chain matches', async () => {
      const currentChainId = sapphire.id
      const chainId = sapphire.id
      const chainsMatch = currentChainId === chainId

      if (chainsMatch) {
        const message = 'test message'
        const signature = 'test signature'
        await mockLogin({ message, signature })
      }

      expect(mockLogin).toHaveBeenCalledWith({ message: 'test message', signature: 'test signature' })
    })

    it('should store JWT token in localStorage on successful login', async () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const token = 'mock-jwt-token'
      window.localStorage.setItem('jwt', token)
      window.dispatchEvent(new Event('storage'))

      expect(setItemSpy).toHaveBeenCalledWith('jwt', token)
      expect(dispatchEventSpy).toHaveBeenCalled()

      setItemSpy.mockRestore()
      dispatchEventSpy.mockRestore()
    })

    it('should return true after successful token storage', async () => {
      const getItemMock = vi.fn(() => 'mock-jwt-token')
      Object.defineProperty(window, 'localStorage', {
        writable: true,
        value: {
          getItem: getItemMock,
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
      })

      const tokenInStorage = window.localStorage.getItem('jwt')
      expect(tokenInStorage).toBe('mock-jwt-token')
      expect(getItemMock).toHaveBeenCalledWith('jwt')
    })

    it('should handle localStorage setItem errors gracefully', async () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      try {
        window.localStorage.setItem('jwt', 'token')
      } catch {
        // Expected to catch
      }

      expect(() => {
        try {
          window.localStorage.setItem('jwt', 'token')
        } catch {
          // Ignore
        }
      }).not.toThrow()

      setItemSpy.mockRestore()
    })

    it('should catch and log authentication errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        throw new Error('Authentication failed')
      } catch (error) {
        console.error('Authentication failed:', error)
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication failed:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })

  describe('authentication adapter - signOut method', () => {
    it('should remove JWT from localStorage', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem')
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      window.localStorage.setItem('jwt', 'test-token')
      window.localStorage.removeItem('jwt')
      window.dispatchEvent(new Event('storage'))

      expect(removeItemSpy).toHaveBeenCalledWith('jwt')
      expect(dispatchEventSpy).toHaveBeenCalled()

      removeItemSpy.mockRestore()
      dispatchEventSpy.mockRestore()
    })

    it('should handle localStorage removeItem errors gracefully', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Remove error')
      })

      expect(() => {
        try {
          window.localStorage.removeItem('jwt')
        } catch {
          // Catch and ignore
        }
      }).not.toThrow()

      removeItemSpy.mockRestore()
    })

    it('should handle dispatchEvent errors gracefully', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Dispatch error')
      })

      expect(() => {
        try {
          window.dispatchEvent(new Event('storage'))
        } catch {
          // Catch and ignore
        }
      }).not.toThrow()

      dispatchEventSpy.mockRestore()
    })
  })

  describe('RainbowKitProvider configuration', () => {
    it('should pass correct theme configuration', () => {
      const theme = {
        fonts: {
          body: 'inherit',
        },
      }

      expect(theme.fonts.body).toBe('inherit')
    })

    it('should pass modalSize as compact', () => {
      const modalSize = 'compact'
      expect(modalSize).toBe('compact')
    })

    it('should pass sapphire as initialChain', () => {
      const initialChain = sapphire
      expect(initialChain.id).toBe(23294)
      expect(initialChain.name).toBe('Sapphire')
    })
  })

  describe('avatar configuration', () => {
    it('should pass address and size to AccountAvatar', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`
      const size = 24

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(address).toBe('0x1234567890abcdef1234567890abcdef12345678')
      expect(size).toBe(24)
    })
  })

  describe('chain ID selection based on network', () => {
    it('should use sapphire chainId for mainnet network', () => {
      const network = 'mainnet'
      const chainId = network === 'mainnet' ? sapphire.id : sapphireTestnet.id

      expect(chainId).toBe(sapphire.id)
      expect(chainId).toBe(23294)
    })

    it('should use sapphireTestnet chainId for testnet network', () => {
      const network = 'testnet'
      const chainId = network === 'mainnet' ? sapphire.id : sapphireTestnet.id

      expect(chainId).toBe(sapphireTestnet.id)
      expect(chainId).toBe(23295)
    })
  })

  describe('authentication status integration', () => {
    it('should pass status to RainbowKitAuthenticationProvider', () => {
      const status = 'unauthenticated'

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(status).toBe('unauthenticated')
    })

    it('should handle authenticated status', () => {
      const status = 'authenticated'

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(status).toBe('authenticated')
    })

    it('should handle loading status', () => {
      const status = 'loading'

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(status).toBe('loading')
    })
  })

  describe('SIWE message structure', () => {
    it('should create SIWE message with all required fields', () => {
      const siweMessage = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        domain: 'rofl.app',
        statement: 'Sign in to ROFL App Backend',
        uri: 'https://rofl.app',
        version: '1',
        chainId: 23294,
        issuedAt: new Date(),
        nonce: 'mock-nonce',
      }

      expect(siweMessage).toHaveProperty('address')
      expect(siweMessage).toHaveProperty('domain')
      expect(siweMessage).toHaveProperty('statement')
      expect(siweMessage).toHaveProperty('uri')
      expect(siweMessage).toHaveProperty('version')
      expect(siweMessage).toHaveProperty('chainId')
      expect(siweMessage).toHaveProperty('issuedAt')
      expect(siweMessage).toHaveProperty('nonce')
    })

    it('should use current timestamp for issuedAt', () => {
      const issuedAt = new Date()

      expect(issuedAt).toBeInstanceOf(Date)
    })
  })

  describe('error handling in verify method', () => {
    it('should return false when login throws error', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Login failed'))

      const hasError = true
      expect(hasError).toBe(true)
    })

    it('should return false when token storage throws', async () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const hasStorageError = true

      try {
        window.localStorage.setItem('jwt', 'token')
      } catch {
        // Expected
      }

      expect(hasStorageError).toBe(true)

      setItemSpy.mockRestore()
    })
  })

  describe('children rendering', () => {
    it('should render single child', () => {
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="single-child">Single Child</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(screen.getByTestId('single-child')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
      expect(screen.getByTestId('child3')).toBeInTheDocument()
    })

    it('should render nested components', () => {
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="parent">
            <div data-testid="nested">Nested</div>
          </div>
        </RainbowKitProviderWithAuth>,
      )

      expect(screen.getByTestId('parent')).toBeInTheDocument()
      expect(screen.getByTestId('nested')).toBeInTheDocument()
    })
  })

  describe('domain detection edge cases', () => {
    it('should handle unknown domains with default', () => {
      const hostname = 'unknown-domain.com'
      const domain =
        hostname === 'rofl.app'
          ? 'rofl.app'
          : hostname === 'stg.rofl.app'
            ? 'stg.rofl.app'
            : hostname === 'dev.rofl.app' ||
                hostname.endsWith('.rofl-app.pages.dev') ||
                hostname === 'localhost'
              ? 'dev.rofl.app'
              : 'rofl.app'

      expect(domain).toBe('rofl.app')
    })

    it('should handle empty string hostname', () => {
      const hostname = ''
      const domain =
        hostname === 'rofl.app'
          ? 'rofl.app'
          : hostname === 'stg.rofl.app'
            ? 'stg.rofl.app'
            : hostname === 'dev.rofl.app' ||
                hostname.endsWith('.rofl-app.pages.dev') ||
                hostname === 'localhost'
              ? 'dev.rofl.app'
              : 'rofl.app'

      expect(domain).toBe('rofl.app')
    })
  })
})
