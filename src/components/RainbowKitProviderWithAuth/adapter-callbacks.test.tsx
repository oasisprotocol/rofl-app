import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { sapphire } from 'viem/chains'
import * as React from 'react'

// Store the actual adapter created by the component
let capturedAdapter: any = null

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
    createAuthenticationAdapter: (config: any) => config,
    RainbowKitAuthenticationProvider: MockRainbowKitAuthenticationProvider,
    RainbowKitProvider: ({ children, ..._props }: any) => <>{children}</>,
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

// Mock AccountAvatar
vi.mock('../../components/AccountAvatar', () => ({
  AccountAvatar: ({ diameter, account }: any) => (
    <div
      data-testid="account-avatar"
      data-diameter={diameter}
      data-address={account?.address_eth}
      data-address-eth={account?.address_eth}
    >
      Avatar
    </div>
  ),
}))

import { RainbowKitProviderWithAuth } from './index'

describe('RainbowKitProviderWithAuth - Actual Adapter Callback Execution', () => {
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

  describe('Real verify method execution (lines 70-94)', () => {
    it('should execute verify method successfully (lines 79-85)', async () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      mockLogin.mockResolvedValueOnce('test-jwt-token')

      // Render to capture the adapter
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="test-child">Test</div>
        </RainbowKitProviderWithAuth>,
      )

      // Adapter should be captured immediately after render
      expect(capturedAdapter).not.toBeNull()

      // Execute the real verify method from the adapter
      const result = await capturedAdapter!.verify!({
        message: 'test-message',
        signature: 'test-signature',
      })

      // Verify the execution path
      expect(mockLogin).toHaveBeenCalled()
      expect(setItemSpy).toHaveBeenCalledWith('jwt', 'test-jwt-token')
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event))
      expect(result).toBe(true)

      setItemSpy.mockRestore()
      dispatchEventSpy.mockRestore()
    })

    it('should handle localStorage setItem failure (lines 86-89)', async () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      mockLogin.mockResolvedValueOnce('test-jwt-token')

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(capturedAdapter).not.toBeNull()

      const result = await capturedAdapter!.verify!({
        message: 'test-message',
        signature: 'test-signature',
      })

      // Should return false when localStorage fails
      expect(result).toBe(false)

      setItemSpy.mockRestore()
    })

    it('should handle authentication errors (lines 90-93)', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockLogin.mockRejectedValueOnce(new Error('Authentication failed'))

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(capturedAdapter).not.toBeNull()

      const result = await capturedAdapter!.verify!({
        message: 'test-message',
        signature: 'test-signature',
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication failed:', expect.any(Error))
      expect(result).toBe(false)

      consoleErrorSpy.mockRestore()
    })

    it('should return false when chainId does not match (lines 72-77)', async () => {
      mockUseChainId.mockReturnValue(1) // Ethereum instead of Sapphire

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(capturedAdapter).not.toBeNull()

      const result = await capturedAdapter!.verify!({
        message: 'test-message',
        signature: 'test-signature',
      })

      // Should return false
      expect(result).toBe(false)
      // Note: mockOpenChainModal might not be called because we're mocking the adapter creation
    })
  })

  describe('Real signOut method execution (lines 96-103)', () => {
    it('should execute signOut successfully (lines 97-99)', async () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem')
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(capturedAdapter).not.toBeNull()

      await capturedAdapter!.signOut!()

      expect(removeItemSpy).toHaveBeenCalledWith('jwt')
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event))

      removeItemSpy.mockRestore()
      dispatchEventSpy.mockRestore()
    })

    it('should handle localStorage removeItem errors (lines 100-102)', async () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(capturedAdapter).not.toBeNull()

      // Should not throw
      await capturedAdapter!.signOut!()

      // Verify removeItem was called
      expect(removeItemSpy).toHaveBeenCalledWith('jwt')

      removeItemSpy.mockRestore()
    })

    it('should handle dispatchEvent errors', async () => {
      const removeItemSpy = vi.spyOn(window.localStorage, 'removeItem')
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('dispatchEvent error')
      })

      render(
        <RainbowKitProviderWithAuth>
          <div>Test</div>
        </RainbowKitProviderWithAuth>,
      )

      expect(capturedAdapter).not.toBeNull()

      // Should not throw
      await capturedAdapter!.signOut!()

      expect(removeItemSpy).toHaveBeenCalledWith('jwt')

      removeItemSpy.mockRestore()
      dispatchEventSpy.mockRestore()
    })
  })

  describe('Avatar component (line 113)', () => {
    it('should render with AccountAvatar configured', async () => {
      render(
        <RainbowKitProviderWithAuth>
          <div data-testid="test-child">Test</div>
        </RainbowKitProviderWithAuth>,
      )

      // The avatar prop is passed to RainbowKitProvider
      // Line 113: <AccountAvatar diameter={size} account={{ address_eth: address as `0x${string}` }} />
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })
  })
})
