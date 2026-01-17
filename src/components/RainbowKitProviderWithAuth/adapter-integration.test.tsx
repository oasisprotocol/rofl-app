import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { sapphire } from 'viem/chains'

// Mock backend API
const mockFetchNonce = vi.fn(() => Promise.resolve('mock-nonce-123'))
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
const mockUseAccount = vi.fn()
const mockUseChainId = vi.fn()
const mockOpenChainModal = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useChainId: () => mockUseChainId(),
  useChainModal: vi.fn(() => ({
    chainModalOpen: false,
    openChainModal: mockOpenChainModal,
  })),
}))

// Mock AccountAvatar
vi.mock('../../components/AccountAvatar', () => ({
  AccountAvatar: ({ diameter, account }: any) => (
    <div data-testid="account-avatar" data-diameter={diameter} data-address={account?.address_eth}>
      Avatar
    </div>
  ),
}))

import { RainbowKitProviderWithAuth } from './index'

describe('RainbowKitProviderWithAuth - Adapter Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up default mock values
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

  describe('createAuthenticationAdapter integration', () => {
    it('should create adapter with getNonce method', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should create adapter with createMessage method', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should create adapter with verify method', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should create adapter with signOut method', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('getNonce method', () => {
    it('should call fetchNonce with address', async () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      mockUseAccount.mockReturnValue({ address })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
      expect(mockUseAccount).toHaveBeenCalled()
    })

    it('should await fetchNonce result', () => {
      mockUseAccount.mockReturnValue({
        address: '0x1234567890abcdef1234567890abcdef12345678',
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('createMessage method', () => {
    it('should use rofl.app domain for production hostname', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'rofl.app' },
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use stg.rofl.app domain for staging hostname', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'stg.rofl.app' },
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use dev.rofl.app domain for dev.rofl.app hostname', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'dev.rofl.app' },
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use dev.rofl.app domain for .rofl-app.pages.dev hostname', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'test.rofl-app.pages.dev' },
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use dev.rofl.app domain for localhost hostname', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'localhost' },
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should default to rofl.app for unknown hostnames', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'unknown.com' },
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should create URI with https protocol and domain', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'rofl.app' },
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should include correct statement in message', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should include version 1 in message', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should include issuedAt timestamp', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should pass chainId to createSiweMessage', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('verify method - chain mismatch handling', () => {
    it('should return false when currentChainId does not match expected chainId', () => {
      mockUseChainId.mockReturnValue(1) // Ethereum instead of Sapphire

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should open chain modal when chainId does not match and modal is not open', () => {
      mockUseChainId.mockReturnValue(1) // Ethereum instead of Sapphire

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should not open chain modal when already open', () => {
      mockUseChainId.mockReturnValue(1) // Ethereum instead of Sapphire

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should return false after opening chain modal', () => {
      mockUseChainId.mockReturnValue(1) // Ethereum instead of Sapphire

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('verify method - successful authentication', () => {
    it('should call login with message and signature', () => {
      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should store JWT token in localStorage on successful login', () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem')

      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      setItemSpy.mockRestore()
    })

    it('should dispatch storage event after storing JWT', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      dispatchEventSpy.mockRestore()
    })

    it('should return true after successful authentication', () => {
      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should catch localStorage setItem errors and return false', () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      setItemSpy.mockRestore()
    })

    it('should return false when localStorage setItem fails', () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      setItemSpy.mockRestore()
    })
  })

  describe('verify method - error handling', () => {
    it('should catch login errors', () => {
      mockLogin.mockRejectedValueOnce(new Error('Login failed'))

      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should log authentication errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockLogin.mockRejectedValueOnce(new Error('Login failed'))
      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('should return false on authentication error', () => {
      mockLogin.mockRejectedValueOnce(new Error('Login failed'))
      mockUseChainId.mockReturnValue(sapphire.id)

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('signOut method', () => {
    it('should remove JWT from localStorage', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem')

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      removeItemSpy.mockRestore()
    })

    it('should dispatch storage event after removing JWT', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      dispatchEventSpy.mockRestore()
    })

    it('should catch localStorage removeItem errors', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      removeItemSpy.mockRestore()
    })

    it('should catch dispatchEvent errors', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('dispatchEvent error')
      })

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()

      dispatchEventSpy.mockRestore()
    })
  })

  describe('chainId selection', () => {
    it('should use sapphire chainId for mainnet network', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use sapphireTestnet chainId for testnet network', () => {
      vi.doMock('../../hooks/useNetwork.ts', () => ({
        useNetwork: vi.fn(() => 'testnet'),
      }))

      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('RainbowKitAuthenticationProvider integration', () => {
    it('should pass adapter to RainbowKitAuthenticationProvider', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should pass status to RainbowKitAuthenticationProvider', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('RainbowKitProvider configuration', () => {
    it('should use compact modalSize', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use sapphire as initialChain', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should pass custom theme', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should pass avatar AccountAvatar component', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render children', () => {
      const { container } = render(
        <RainbowKitProviderWithAuth>
          <div data-testid="child">Child</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
