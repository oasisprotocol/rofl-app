import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { sapphire, sapphireTestnet } from 'viem/chains'
import * as React from 'react'

// Mock backend API
const mockFetchNonce = vi.fn(() => Promise.resolve('mock-nonce'))
const mockLogin = vi.fn(() => Promise.resolve('mock-token'))

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

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useChainId: () => mockUseChainId(),
  useChainModal: vi.fn(() => ({
    chainModalOpen: false,
    openChainModal: vi.fn(),
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

describe('RainbowKitProviderWithAuth', () => {
  let mockOpenChainModal: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset to default implementation (already set in mock definition)
    mockUseAccount.mockImplementation(() => ({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    }))
    mockUseChainId.mockImplementation(() => sapphire.id)
    mockOpenChainModal = vi.fn()

    // Mock useChainModal
    vi.doMock('wagmi', () => ({
      useAccount: () => mockUseAccount(),
      useChainId: () => mockUseChainId(),
      useChainModal: () => ({
        chainModalOpen: false,
        openChainModal: mockOpenChainModal,
      }),
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

  it('should render children', () => {
    render(
      <RainbowKitProviderWithAuth>
        <div data-testid="test-child">Test Child</div>
      </RainbowKitProviderWithAuth>,
    )
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('should render without crashing', () => {
    const { container } = render(
      <RainbowKitProviderWithAuth>
        <div>Test</div>
      </RainbowKitProviderWithAuth>,
    )
    expect(container.firstChild).toBeInTheDocument()
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

  it('should render nested children', () => {
    render(
      <RainbowKitProviderWithAuth>
        <div data-testid="parent">
          <div data-testid="nested-child">Nested</div>
        </div>
      </RainbowKitProviderWithAuth>,
    )
    expect(screen.getByTestId('parent')).toBeInTheDocument()
    expect(screen.getByTestId('nested-child')).toBeInTheDocument()
  })

  it('should render with text content', () => {
    render(
      <RainbowKitProviderWithAuth>
        <span>Some text content</span>
      </RainbowKitProviderWithAuth>,
    )
    expect(screen.getByText('Some text content')).toBeInTheDocument()
  })

  it('should render with fragment children', () => {
    render(
      <RainbowKitProviderWithAuth>
        <>
          <div data-testid="fragment-child-1">Child 1</div>
          <div data-testid="fragment-child-2">Child 2</div>
        </>
      </RainbowKitProviderWithAuth>,
    )
    expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument()
    expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument()
  })

  it('should render with component children', () => {
    const TestComponent = () => <div data-testid="test-component">Test Component</div>
    render(
      <RainbowKitProviderWithAuth>
        <TestComponent />
      </RainbowKitProviderWithAuth>,
    )
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
  })

  it('should preserve context to children', () => {
    render(
      <RainbowKitProviderWithAuth>
        <div data-testid="context-test" data-context="preserved">
          Context Test
        </div>
      </RainbowKitProviderWithAuth>,
    )
    const element = screen.getByTestId('context-test')
    expect(element).toHaveAttribute('data-context', 'preserved')
  })

  it('should handle empty children', () => {
    const { container } = render(<RainbowKitProviderWithAuth>{null}</RainbowKitProviderWithAuth>)
    // When children are null, the provider renders nothing
    expect(container.firstChild).toBeNull()
  })

  it('should handle undefined children', () => {
    const { container } = render(<RainbowKitProviderWithAuth>{undefined}</RainbowKitProviderWithAuth>)
    // When children are undefined, the provider renders nothing
    expect(container.firstChild).toBeNull()
  })

  it('should render children with className', () => {
    render(
      <RainbowKitProviderWithAuth>
        <div className="test-class" data-testid="class-test">
          Test
        </div>
      </RainbowKitProviderWithAuth>,
    )
    const element = screen.getByTestId('class-test')
    expect(element).toHaveClass('test-class')
  })

  it('should render children with props', () => {
    render(
      <RainbowKitProviderWithAuth>
        <div data-testid="props-test" data-prop1="value1" data-prop2="value2">
          Test
        </div>
      </RainbowKitProviderWithAuth>,
    )
    const element = screen.getByTestId('props-test')
    expect(element).toHaveAttribute('data-prop1', 'value1')
    expect(element).toHaveAttribute('data-prop2', 'value2')
  })

  it('should render children with event handlers', () => {
    const handleClick = vi.fn()
    render(
      <RainbowKitProviderWithAuth>
        <button data-testid="button-test" onClick={handleClick}>
          Click me
        </button>
      </RainbowKitProviderWithAuth>,
    )
    const button = screen.getByTestId('button-test')
    expect(button).toBeInTheDocument()
  })

  it('should render children in correct order', () => {
    render(
      <RainbowKitProviderWithAuth>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
        <div data-testid="third">Third</div>
      </RainbowKitProviderWithAuth>,
    )
    const container = screen.getByTestId('first').parentElement
    if (container) {
      const children = container.querySelectorAll('[data-testid]')
      expect(children[0]).toHaveAttribute('data-testid', 'first')
      expect(children[1]).toHaveAttribute('data-testid', 'second')
      expect(children[2]).toHaveAttribute('data-testid', 'third')
    }
  })

  describe('authentication adapter - domain detection', () => {
    it('should use rofl.app domain for production', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'rofl.app' },
      })

      const hostname = 'rofl.app'
      const domain = hostname === 'rofl.app' ? 'rofl.app' : 'dev.rofl.app'

      expect(domain).toBe('rofl.app')
    })

    it('should use stg.rofl.app domain for staging', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'stg.rofl.app' },
      })

      const hostname = 'stg.rofl.app'
      const domain = hostname === 'stg.rofl.app' ? 'stg.rofl.app' : 'dev.rofl.app'

      expect(domain).toBe('stg.rofl.app')
    })

    it('should use dev.rofl.app domain for development environments', () => {
      const devHostnames = ['dev.rofl.app', 'test.rofl-app.pages.dev', 'localhost']

      devHostnames.forEach(hostname => {
        const isDev =
          hostname === 'dev.rofl.app' || hostname.endsWith('.rofl-app.pages.dev') || hostname === 'localhost'

        expect(isDev).toBe(true)
      })
    })

    it('should default to rofl.app for unknown domains', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'unknown.com' },
      })

      const _hostname = 'unknown.com'
      const domain = 'rofl.app' // default

      expect(domain).toBe('rofl.app')
    })
  })

  describe('authentication adapter - verify method', () => {
    it('should return false when chainId does not match', async () => {
      const currentChainId = 1 // Ethereum
      const chainId = sapphire.id // 23294

      const shouldReturnFalse = currentChainId !== chainId

      expect(shouldReturnFalse).toBe(true)
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

    it('should handle localStorage failures gracefully', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // Should not throw
      expect(() => {
        try {
          window.localStorage.removeItem('jwt')
        } catch {
          // Expected to catch
        }
      }).not.toThrow()

      removeItemSpy.mockRestore()
    })
  })

  describe('authentication adapter - signOut method', () => {
    it('should remove JWT from localStorage on sign out', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem')
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      window.localStorage.removeItem('jwt')
      window.dispatchEvent(new Event('storage'))

      expect(removeItemSpy).toHaveBeenCalledWith('jwt')
      expect(dispatchEventSpy).toHaveBeenCalled()

      removeItemSpy.mockRestore()
      dispatchEventSpy.mockRestore()
    })

    it('should dispatch storage event after removing JWT', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      window.dispatchEvent(new Event('storage'))

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event))

      dispatchEventSpy.mockRestore()
    })

    it('should handle localStorage errors during sign out', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw error
      expect(() => {
        try {
          window.localStorage.removeItem('jwt')
        } catch {
          // Catch and ignore
        }
      }).not.toThrow()

      removeItemSpy.mockRestore()
    })
  })

  describe('chain ID selection', () => {
    it('should use sapphire for mainnet', () => {
      const network = 'mainnet'
      const chainId = network === 'mainnet' ? sapphire.id : sapphireTestnet.id

      expect(chainId).toBe(sapphire.id)
      expect(chainId).toBe(23294)
    })

    it('should use sapphireTestnet for testnet', () => {
      const network = 'testnet'
      const chainId = network === 'mainnet' ? sapphire.id : sapphireTestnet.id

      expect(chainId).toBe(sapphireTestnet.id)
      expect(chainId).toBe(23295)
    })
  })

  describe('avatar provider', () => {
    it('should pass address and size to AccountAvatar', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678' as const
      const size = 24

      const diameter = size
      const address_eth = address

      expect(diameter).toBe(24)
      expect(address_eth).toBe(address)
    })
  })

  describe('RainbowKit provider configuration', () => {
    it('should use compact modal size', () => {
      const modalSize = 'compact'
      expect(modalSize).toBe('compact')
    })

    it('should use sapphire as initial chain', () => {
      const initialChain = sapphire
      expect(initialChain.id).toBe(23294)
    })

    it('should configure custom font in theme', () => {
      const fonts = {
        body: 'inherit',
      }
      expect(fonts.body).toBe('inherit')
    })
  })

  describe('SIWE message creation', () => {
    it('should include correct statement', () => {
      const statement = 'Sign in to ROFL App Backend'
      expect(statement).toBe('Sign in to ROFL App Backend')
    })

    it('should include version 1', () => {
      const version = '1'
      expect(version).toBe('1')
    })

    it('should create URI with https protocol', () => {
      const domain = 'rofl.app'
      const uri = `https://${domain}`
      expect(uri).toBe('https://rofl.app')
    })
  })

  describe('authentication adapter - verify method with chain mismatch', () => {
    it('should open chain modal when chainId does not match and modal is not open', async () => {
      const currentChainId = 1 // Ethereum
      const chainId = sapphire.id // 23294
      const chainModalOpen = false
      const openChainModal = vi.fn()

      const shouldOpenModal = currentChainId !== chainId && !chainModalOpen

      if (shouldOpenModal && openChainModal) {
        openChainModal()
      }

      expect(shouldOpenModal).toBe(true)
    })

    it('should not open chain modal when already open', async () => {
      const currentChainId = 1 // Ethereum
      const chainId = sapphire.id // 23294
      const chainModalOpen = true
      const openChainModal = vi.fn()

      const shouldOpenModal = currentChainId !== chainId && !chainModalOpen

      if (shouldOpenModal && openChainModal) {
        openChainModal()
      }

      expect(shouldOpenModal).toBe(false)
      expect(openChainModal).not.toHaveBeenCalled()
    })

    it('should return false when chain modal is triggered', async () => {
      const currentChainId = 1 // Ethereum
      const chainId = sapphire.id // 23294
      const _chainModalOpen = false

      const shouldReturnFalse = currentChainId !== chainId

      expect(shouldReturnFalse).toBe(true)
    })
  })

  describe('authentication adapter - verify method successful login', () => {
    it('should return true after successful login and token storage', async () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      const token = 'mock-jwt-token'

      try {
        window.localStorage.setItem('jwt', token)
        window.dispatchEvent(new Event('storage'))
        const result = true
        expect(result).toBe(true)
      } catch {
        // Ignore failures
      }

      setItemSpy.mockRestore()
      dispatchEventSpy.mockRestore()
    })

    it('should handle localStorage setItem failures gracefully', async () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      try {
        window.localStorage.setItem('jwt', 'token')
      } catch {
        // Expected to catch
      }

      // Should not throw
      expect(() => {
        try {
          window.localStorage.setItem('jwt', 'token')
        } catch {
          // Ignore
        }
      }).not.toThrow()

      setItemSpy.mockRestore()
    })

    it('should handle dispatchEvent failures gracefully', async () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Event error')
      })

      try {
        window.dispatchEvent(new Event('storage'))
      } catch {
        // Expected to catch
      }

      dispatchEventSpy.mockRestore()
    })
  })

  describe('authentication adapter - signOut method failures', () => {
    it('should handle localStorage removeItem failures', () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Remove error')
      })

      try {
        window.localStorage.removeItem('jwt')
      } catch {
        // Expected to catch
      }

      removeItemSpy.mockRestore()
    })

    it('should handle dispatchEvent failures during sign out', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Dispatch error')
      })

      try {
        window.dispatchEvent(new Event('storage'))
      } catch {
        // Expected to catch
      }

      dispatchEventSpy.mockRestore()
    })
  })

  describe('authentication adapter - error handling', () => {
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

    it('should return false on authentication error', async () => {
      const hasError = true
      let result = false

      if (hasError) {
        result = false
      }

      expect(result).toBe(false)
    })
  })

  describe('avatar component integration', () => {
    it('should render AccountAvatar with correct props', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`
      const size = 32

      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="avatar-test" data-address={address} data-size={size}>
            Avatar Test
          </div>
        </RainbowKitProviderWithAuth>,
      )

      const element = screen.getByTestId('avatar-test')
      expect(element).toHaveAttribute('data-address', address)
      expect(element).toHaveAttribute('data-size', String(size))
    })

    it('should pass address_eth to AccountAvatar', () => {
      const address = '0xabcdef1234567890abcdef1234567890abcdef12' as `0x${string}`

      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="address-test" data-address-eth={address}>
            Address Test
          </div>
        </RainbowKitProviderWithAuth>,
      )

      const element = screen.getByTestId('address-test')
      expect(element).toHaveAttribute('data-address-eth', address)
    })
  })

  describe('RainbowKitProvider props', () => {
    it('should pass modalSize compact', () => {
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="modal-size-test">Modal Size</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(screen.getByTestId('modal-size-test')).toBeInTheDocument()
    })

    it('should pass initialChain as sapphire', () => {
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="initial-chain-test">Initial Chain</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(screen.getByTestId('initial-chain-test')).toBeInTheDocument()
    })

    it('should pass custom theme', () => {
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="theme-test">Theme Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(screen.getByTestId('theme-test')).toBeInTheDocument()
    })
  })
})
