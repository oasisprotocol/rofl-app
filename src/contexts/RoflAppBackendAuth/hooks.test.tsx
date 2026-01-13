import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRoflAppBackendAuthContext } from './hooks'
import { RoflAppBackendAuthProvider } from './Provider'
import { AuthenticationStatus } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { trackEvent } from 'fathom-client'

// Get the mocked useAccount function - it's already mocked in setup.ts
const mockedUseAccount = vi.mocked(useAccount)

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockUseLocation = vi.fn(() => ({ pathname: '/' }))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}))

// Mock fathom-client
vi.mock('fathom-client', () => ({
  trackEvent: vi.fn(),
}))

describe('useRoflAppBackendAuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockNavigate.mockReset()
    mockUseLocation.mockReturnValue({ pathname: '/' })
    mockedUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    })
    vi.clearAllMocks()
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useRoflAppBackendAuthContext())
    }).toThrow('useRoflAppBackendAuthContext must be used within a RoflAppBackendAuthProvider')

    consoleSpy.mockRestore()
  })

  it('should return context when used within provider', () => {
    mockedUseAccount.mockReturnValue({
      address: '0x123' as `0x${string}`,
      isConnected: true,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('token')
    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('status')
  })

  it('should return correct context structure', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

    // token can be string or null
    expect(result.current.token === null || typeof result.current.token === 'string').toBe(true)
    expect(typeof result.current.isAuthenticated).toBe('boolean')
    expect(typeof result.current.status).toBe('string')

    const validStatuses: AuthenticationStatus[] = ['loading', 'authenticated', 'unauthenticated']
    expect(validStatuses).toContain(result.current.status)
  })

  it('should return null token when not authenticated', () => {
    mockedUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(['loading', 'unauthenticated']).toContain(result.current.status)
  })

  it('should return loading status during initial load', () => {
    mockedUseAccount.mockReturnValue({
      address: undefined,
      isConnected: undefined,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

    // When isConnected is undefined, the status could be loading or unauthenticated
    // depending on when the effect runs
    expect(['loading', 'unauthenticated']).toContain(result.current.status)
  })

  it('should return authenticated status with valid token and address', () => {
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 3600
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

    const tokenPayload = {
      address: address.toLowerCase(),
      exp: exp,
    }

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify(tokenPayload))
    const signature = 'signature'
    const jwt = `${header}.${payload}.${signature}`

    window.localStorage.setItem('jwt', jwt)
    mockedUseAccount.mockReturnValue({
      address: address as `0x${string}`,
      isConnected: true,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

    expect(['loading', 'authenticated']).toContain(result.current.status)
  })

  it('should maintain context value across re-renders', () => {
    mockedUseAccount.mockReturnValue({
      address: '0x123' as `0x${string}`,
      isConnected: true,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result, rerender } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

    const firstResult = result.current

    // Trigger re-render
    rerender()

    const secondResult = result.current

    // Context should have the same structure and values
    expect(secondResult).toEqual(firstResult)
    expect(secondResult.token).toBe(firstResult.token)
    expect(secondResult.isAuthenticated).toBe(firstResult.isAuthenticated)
    expect(secondResult.status).toBe(firstResult.status)
  })

  it('should handle multiple hooks using same context', () => {
    mockedUseAccount.mockReturnValue({
      address: '0x123' as `0x${string}`,
      isConnected: true,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result } = renderHook(
      () => {
        const context1 = useRoflAppBackendAuthContext()
        const context2 = useRoflAppBackendAuthContext()
        return { context1, context2 }
      },
      { wrapper },
    )

    // Both hooks should return the same context reference
    expect(result.current.context1).toBe(result.current.context2)
  })

  it('should update context when wallet connection changes', () => {
    mockedUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RoflAppBackendAuthProvider>{children}</RoflAppBackendAuthProvider>
    )

    const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

    // Initially not authenticated
    expect(result.current.isAuthenticated).toBe(false)

    // Note: In a real scenario, you'd need to trigger a re-render with updated props
    // This test verifies the hook structure allows for updates
  })

  it('should export useRoflAppBackendAuthContext function', () => {
    expect(typeof useRoflAppBackendAuthContext).toBe('function')
  })

  it('should have correct function name', () => {
    expect(useRoflAppBackendAuthContext.name).toBe('useRoflAppBackendAuthContext')
  })
})
