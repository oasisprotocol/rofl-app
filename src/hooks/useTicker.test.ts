import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTicker } from './useTicker'
import { Ticker, networkTicker } from '../constants/ticker'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the useNetwork hook
const mockUseNetwork = vi.fn()
vi.mock('./useNetwork', () => ({
  useNetwork: () => mockUseNetwork(),
}))

describe('useTicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should return ROSE for mainnet', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe('ROSE')
    })

    it('should return TEST for testnet', () => {
      mockUseNetwork.mockReturnValue('testnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe('TEST')
    })

    it('should handle unknown network', () => {
      mockUseNetwork.mockReturnValue('unknown')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })

    it('should be a function', async () => {
      const module = await import('./useTicker')
      expect(typeof module.useTicker).toBe('function')
    })

    it('should export hook', async () => {
      const module = await import('./useTicker')
      expect(module).toBeDefined()
      expect(module.useTicker).toBeDefined()
    })
  })

  describe('ticker values', () => {
    it('should return correct ticker type for mainnet', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe(Ticker.ROSE)
      expect(result.current).toBe('ROSE')
    })

    it('should return correct ticker type for testnet', () => {
      mockUseNetwork.mockReturnValue('testnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe(Ticker.TEST)
      expect(result.current).toBe('TEST')
    })

    it('should match networkTicker mapping for mainnet', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe(networkTicker.mainnet)
    })

    it('should match networkTicker mapping for testnet', () => {
      mockUseNetwork.mockReturnValue('testnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe(networkTicker.testnet)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string network', () => {
      mockUseNetwork.mockReturnValue('')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })

    it('should handle null network value', () => {
      mockUseNetwork.mockReturnValue(null as unknown as 'mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })

    it('should handle undefined network value', () => {
      mockUseNetwork.mockReturnValue(undefined as unknown as 'mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })

    it('should handle numeric network value', () => {
      mockUseNetwork.mockReturnValue(123 as unknown as 'mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })

    it('should handle network with special characters', () => {
      mockUseNetwork.mockReturnValue('main-net-test' as unknown as 'mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })

    it('should handle case-sensitive network values', () => {
      mockUseNetwork.mockReturnValue('MAINNET' as unknown as 'mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })

    it('should handle network with leading/trailing spaces', () => {
      mockUseNetwork.mockReturnValue(' mainnet ' as unknown as 'mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBeUndefined()
    })
  })

  describe('reactivity', () => {
    it('should update ticker when network changes from mainnet to testnet', () => {
      const { result, rerender } = renderHook(() => useTicker())

      // Initial mainnet
      mockUseNetwork.mockReturnValue('mainnet')
      rerender()
      expect(result.current).toBe('ROSE')

      // Switch to testnet
      mockUseNetwork.mockReturnValue('testnet')
      rerender()
      expect(result.current).toBe('TEST')
    })

    it('should update ticker when network changes from testnet to mainnet', () => {
      const { result, rerender } = renderHook(() => useTicker())

      // Initial testnet
      mockUseNetwork.mockReturnValue('testnet')
      rerender()
      expect(result.current).toBe('TEST')

      // Switch to mainnet
      mockUseNetwork.mockReturnValue('mainnet')
      rerender()
      expect(result.current).toBe('ROSE')
    })

    it('should handle transition from valid network to unknown', () => {
      const { result, rerender } = renderHook(() => useTicker())

      // Start with mainnet
      mockUseNetwork.mockReturnValue('mainnet')
      rerender()
      expect(result.current).toBe('ROSE')

      // Switch to unknown
      mockUseNetwork.mockReturnValue('unknown')
      rerender()
      expect(result.current).toBeUndefined()
    })

    it('should handle transition from unknown to valid network', () => {
      const { result, rerender } = renderHook(() => useTicker())

      // Start with unknown
      mockUseNetwork.mockReturnValue('unknown')
      rerender()
      expect(result.current).toBeUndefined()

      // Switch to testnet
      mockUseNetwork.mockReturnValue('testnet')
      rerender()
      expect(result.current).toBe('TEST')
    })

    it('should handle multiple rapid network changes', () => {
      const { result, rerender } = renderHook(() => useTicker())

      // Start with mainnet
      mockUseNetwork.mockReturnValue('mainnet')
      rerender()
      expect(result.current).toBe('ROSE')

      // Switch to testnet
      mockUseNetwork.mockReturnValue('testnet')
      rerender()
      expect(result.current).toBe('TEST')

      // Switch back to mainnet
      mockUseNetwork.mockReturnValue('mainnet')
      rerender()
      expect(result.current).toBe('ROSE')

      // Switch to unknown
      mockUseNetwork.mockReturnValue('unknown-network')
      rerender()
      expect(result.current).toBeUndefined()

      // Back to testnet
      mockUseNetwork.mockReturnValue('testnet')
      rerender()
      expect(result.current).toBe('TEST')
    })
  })

  describe('network hook interaction', () => {
    it('should call useNetwork hook', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      renderHook(() => useTicker())

      expect(mockUseNetwork).toHaveBeenCalled()
    })

    it('should use the network value from useNetwork hook', () => {
      mockUseNetwork.mockReturnValue('testnet')

      const { result } = renderHook(() => useTicker())

      expect(mockUseNetwork).toHaveBeenCalled()
      expect(result.current).toBe('TEST')
    })

    it('should reflect changes in useNetwork return value', () => {
      let currentNetwork: 'mainnet' | 'testnet' = 'mainnet'
      mockUseNetwork.mockImplementation(() => currentNetwork)

      const { result, rerender } = renderHook(() => useTicker())

      expect(result.current).toBe('ROSE')

      act(() => {
        currentNetwork = 'testnet'
        rerender()
      })

      expect(result.current).toBe('TEST')
    })
  })

  describe('consistency', () => {
    it('should consistently return same ticker for same network across multiple renders', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { result, rerender } = renderHook(() => useTicker())

      const firstValue = result.current

      rerender()
      const secondValue = result.current

      rerender()
      const thirdValue = result.current

      expect(firstValue).toBe('ROSE')
      expect(secondValue).toBe('ROSE')
      expect(thirdValue).toBe('ROSE')
      expect(firstValue).toBe(secondValue)
      expect(secondValue).toBe(thirdValue)
    })

    it('should consistently return same ticker for testnet across multiple renders', () => {
      mockUseNetwork.mockReturnValue('testnet')

      const { result, rerender } = renderHook(() => useTicker())

      const firstValue = result.current

      rerender()
      const secondValue = result.current

      rerender()
      const thirdValue = result.current

      expect(firstValue).toBe('TEST')
      expect(secondValue).toBe('TEST')
      expect(thirdValue).toBe('TEST')
      expect(firstValue).toBe(secondValue)
      expect(secondValue).toBe(thirdValue)
    })

    it('should handle consecutive calls with different networks independently', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { result: mainnetResult } = renderHook(() => useTicker())
      expect(mainnetResult.current).toBe('ROSE')

      mockUseNetwork.mockReturnValue('testnet')

      const { result: testnetResult } = renderHook(() => useTicker())
      expect(testnetResult.current).toBe('TEST')
    })
  })

  describe('type safety', () => {
    it('should return ticker type values', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { result } = renderHook(() => useTicker())

      // The result should be one of the valid ticker values
      const validTickers = Object.values(Ticker)
      expect(validTickers).toContain(result.current)
    })

    it('should return TEST which is a valid Ticker', () => {
      mockUseNetwork.mockReturnValue('testnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe(Ticker.TEST)
      expect(Object.values(Ticker)).toContain(result.current)
    })

    it('should return ROSE which is a valid Ticker', () => {
      mockUseNetwork.mockReturnValue('mainnet')

      const { result } = renderHook(() => useTicker())

      expect(result.current).toBe(Ticker.ROSE)
      expect(Object.values(Ticker)).toContain(result.current)
    })
  })
})
