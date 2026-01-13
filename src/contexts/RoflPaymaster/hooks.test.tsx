import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRoflPaymasterContext } from './hooks'
import { RoflPaymasterContextProvider } from './Provider'
import { RoflAppPaymasterProvider } from '../contexts/RoflPaymaster/Provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the contract functions at the top level
vi.mock('../../contracts/crossChainPaymaster', () => ({
  calculateRoseAmount: vi.fn().mockResolvedValue(BigInt(100)),
  isPaymentProcessed: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../contracts/paymasterVault', () => ({
  deposit: vi.fn().mockResolvedValue({ paymentId: 'test-payment-id' }),
}))

describe('useRoflPaymasterContext', () => {
  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useRoflPaymasterContext())
    }).toThrow('[useRoflPaymasterContext] Component not wrapped within a Provider')

    consoleSpy.mockRestore()
  })

  it('should return context when used within provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('state')
    expect(result.current).toHaveProperty('getQuote')
    expect(result.current).toHaveProperty('createDeposit')
    expect(result.current).toHaveProperty('pollPayment')
  })

  it('should return correct context structure', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    expect(result.current.state).toBeDefined()
    expect(typeof result.current.getQuote).toBe('function')
    expect(typeof result.current.createDeposit).toBe('function')
    expect(typeof result.current.pollPayment).toBe('function')
  })

  it('should return state with null token initially', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    expect(result.current.state.token).toBeNull()
  })

  it('should have all required context properties', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    // Check that all expected properties exist
    expect(Object.keys(result.current)).toEqual(['state', 'getQuote', 'createDeposit', 'pollPayment'])
  })

  it('should maintain context value across re-renders', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result, rerender } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    const firstResult = result.current

    // Trigger re-render
    rerender()

    const secondResult = result.current

    // Context should remain consistent across re-renders
    expect(typeof secondResult.getQuote).toBe('function')
    expect(typeof secondResult.createDeposit).toBe('function')
    expect(typeof secondResult.pollPayment).toBe('function')
    expect(secondResult.state.token).toBe(firstResult.state.token)
  })

  it('should handle multiple hooks using same context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(
      () => {
        const context1 = useRoflPaymasterContext()
        const context2 = useRoflPaymasterContext()
        return { context1, context2 }
      },
      { wrapper },
    )

    // Both hooks should return the same context reference
    expect(result.current.context1).toBe(result.current.context2)
  })

  it('should provide getQuote function that is a function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    expect(typeof result.current.getQuote).toBe('function')
  })

  it('should provide createDeposit function that is a function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    expect(typeof result.current.createDeposit).toBe('function')
  })

  it('should provide pollPayment function that is a function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    expect(typeof result.current.pollPayment).toBe('function')
  })

  it('should have state object with token property', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflPaymasterContextProvider>{children}</RoflPaymasterContextProvider>
    )

    const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

    expect(result.current.state).toHaveProperty('token')
  })

  it('should export useRoflPaymasterContext function', () => {
    expect(typeof useRoflPaymasterContext).toBe('function')
  })

  it('should have correct function name', () => {
    expect(useRoflPaymasterContext.name).toBe('useRoflPaymasterContext')
  })
})
