import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNetwork } from './useNetwork'
import { useAccount } from 'wagmi'
import { sapphire, sapphireTestnet, sepolia } from 'viem/chains'
import { AppError, AppErrors } from '../components/ErrorBoundary/errors'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockUseAccount = vi.mocked(useAccount)

describe('useNetwork Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementation and set default
    mockUseAccount.mockReset()
    mockUseAccount.mockReturnValue({
      isConnected: false,
      chainId: undefined,
      address: undefined,
      connector: undefined,
    })
  })

  describe('when connected to Sapphire mainnet', () => {
    it('should return mainnet', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sapphire.id, // 23294
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork())

      expect(result.current).toBe('mainnet')
    })

    it('should return mainnet even with fallback provided', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sapphire.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('mainnet')
    })
  })

  describe('when connected to Sapphire testnet', () => {
    it('should return testnet', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sapphireTestnet.id, // 23295
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork())

      expect(result.current).toBe('testnet')
    })

    it('should return testnet even with fallback provided', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sapphireTestnet.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('mainnet'))

      expect(result.current).toBe('testnet')
    })
  })

  describe('when not connected', () => {
    it('should return fallback when provided', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('mainnet'))

      expect(result.current).toBe('mainnet')
    })

    it('should return testnet fallback when provided', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('testnet')
    })

    it('should throw WalletNotConnected error when no fallback', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })

      expect(() => renderHook(() => useNetwork())).toThrow(AppError)
      expect(() => renderHook(() => useNetwork())).toThrow(AppErrors.WalletNotConnected)
    })

    it('should throw error with correct message', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })

      try {
        renderHook(() => useNetwork())
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        expect((error as AppError).type).toBe(AppErrors.WalletNotConnected)
      }
    })
  })

  describe('when connected to paymaster-enabled chains', () => {
    it('should return fallback when connected to sepolia without previous value', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sepolia.id, // 11155111
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('mainnet'))

      expect(result.current).toBe('mainnet')
    })

    it('should return fallback when connected to sepolia with testnet fallback', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sepolia.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('testnet')
    })

    it('should throw UnsupportedChain when connected to sepolia without fallback', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sepolia.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      expect(() => renderHook(() => useNetwork())).toThrow(AppError)
      expect(() => renderHook(() => useNetwork())).toThrow(AppErrors.UnsupportedChain)
    })
  })

  describe('when connected to unsupported chains', () => {
    it('should return fallback when provided', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 1, // Ethereum mainnet
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('mainnet'))

      expect(result.current).toBe('mainnet')
    })

    it('should throw UnsupportedChain error when no fallback', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 1, // Ethereum mainnet
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      expect(() => renderHook(() => useNetwork())).toThrow(AppError)
      expect(() => renderHook(() => useNetwork())).toThrow(AppErrors.UnsupportedChain)
    })

    it('should throw error with correct type for unsupported chain', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 1337, // Custom unsupported chain
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      try {
        renderHook(() => useNetwork())
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        expect((error as AppError).type).toBe(AppErrors.UnsupportedChain)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle undefined chainId when connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: undefined,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('testnet')
    })

    it('should handle zero chainId', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 0,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('mainnet'))

      expect(result.current).toBe('mainnet')
    })

    it('should handle negative chainId', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: -1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('testnet')
    })
  })

  describe('ref behavior across hook calls', () => {
    it('should maintain previous value when switching from sapphire to paymaster chain', () => {
      // First render with sapphire
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sapphire.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result, rerender } = renderHook(() => useNetwork('mainnet'))

      expect(result.current).toBe('mainnet')

      // Switch to sepolia (paymaster-enabled chain)
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sepolia.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      act(() => {
        rerender()
      })

      // Should return the previous value (mainnet) when on paymaster chain
      expect(result.current).toBe('mainnet')
    })

    it('should update previous value when switching from testnet to paymaster chain', () => {
      // First render with sapphire testnet
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sapphireTestnet.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result, rerender } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('testnet')

      // Switch to sepolia (paymaster-enabled chain)
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sepolia.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      act(() => {
        rerender()
      })

      // Should return the previous value (testnet) when on paymaster chain
      expect(result.current).toBe('testnet')
    })
  })

  describe('fallback precedence', () => {
    it('should prioritize known chain over fallback', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: sapphire.id,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('mainnet')
    })

    it('should use fallback for unknown chains', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 999999,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('testnet')
    })

    it('should use fallback when not connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })

      const { result } = renderHook(() => useNetwork('testnet'))

      expect(result.current).toBe('testnet')
    })
  })
})
