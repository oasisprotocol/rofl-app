import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'

// Get the mocked axios instance from global setup
const mockedAxiosGet = (global as any).__mockAxiosGet as ReturnType<typeof vi.fn>

describe('coin-gecko/api', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    mockedAxiosGet.mockReset()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  const createMockResponse = (data: unknown) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  })

  describe('Module exports', () => {
    it('should have useGetRosePrice hook', async () => {
      const { useGetRosePrice } = await import('./api')
      expect(typeof useGetRosePrice).toBe('function')
    })

    it('should export useGetRosePrice as named export', async () => {
      const apiModule = await import('./api')
      expect('useGetRosePrice' in apiModule).toBe(true)
    })
  })

  describe('Basic price fetching', () => {
    it('should fetch ROSE price successfully', async () => {
      const mockPrice = 0.05
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: mockPrice } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(result.current.data).toBe(mockPrice)
    })

    it('should fetch ROSE price with high value', async () => {
      const mockPrice = 999.99
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: mockPrice } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(result.current.data).toBe(mockPrice)
    })

    it('should fetch ROSE price with very low value', async () => {
      const mockPrice = 0.000001
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: mockPrice } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(result.current.data).toBe(mockPrice)
    })

    it('should handle zero price value', async () => {
      const mockPrice = 0
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: mockPrice } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(result.current.data).toBe(0)
    })

    it('should fetch ROSE price with decimal precision', async () => {
      const mockPrice = 0.047823451
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: mockPrice } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(result.current.data).toBe(mockPrice)
    })
  })

  describe('API parameters', () => {
    it('should call coingecko API with correct params', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'oasis-network',
          vs_currencies: 'usd',
        },
      })
    })
  })

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedAxiosGet.mockRejectedValueOnce(new Error('API Error'))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })

    it('should handle 404 error from API', async () => {
      const error404 = new Error('Not Found')
      ;(error404 as any).response = { status: 404, data: { error: 'Not found' } }
      mockedAxiosGet.mockRejectedValueOnce(error404)

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })
  })

  describe('Malformed response handling', () => {
    it('should handle missing oasis-network key in response', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'other-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })

    it('should handle missing usd key in response', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { eur: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })

    it('should handle null response data', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse(null))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })

    it('should handle undefined response data', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse(undefined))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })

    it('should handle empty object response', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({}))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })

    it('should handle malformed nested structure', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': null }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })
  })

  describe('Hook configuration', () => {
    it('should be enabled by default', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(mockedAxiosGet).toHaveBeenCalled()
    })

    it('should be enabled when enabled option is true', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice({ enabled: true }), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(mockedAxiosGet).toHaveBeenCalled()
    })

    it('should be disabled when enabled option is false', async () => {
      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice({ enabled: false }), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(mockedAxiosGet).not.toHaveBeenCalled()
    })

    it('should have throwOnError disabled', async () => {
      mockedAxiosGet.mockRejectedValueOnce(new Error('API Error'))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isFetched).toBe(true), { timeout: 5000 })
      expect(result.current.status).toBe('error')
    })
  })

  describe('Query behavior', () => {
    it('should use correct query key', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      const cachedData = queryClient.getQueryData(['rosePrice'])
      expect(cachedData).toBe(0.05)
    })

    it('should handle loading state', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBe(0.05)
    })

    it('should handle concurrent calls', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')

      const { result: result1 } = renderHook(() => useGetRosePrice(), { wrapper })
      const { result: result2 } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result1.current.isSuccess).toBe(true), { timeout: 5000 })
      await waitFor(() => expect(result2.current.isSuccess).toBe(true), { timeout: 5000 })

      expect(result1.current.data).toBe(result2.current.data)
    })
  })

  describe('Reactive behavior', () => {
    it('should update when enabled changes from false to true', async () => {
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: 0.05 } }))

      const { useGetRosePrice } = await import('./api')
      const { result, rerender } = renderHook(({ enabled }) => useGetRosePrice({ enabled }), {
        wrapper,
        initialProps: { enabled: false },
      })

      expect(result.current.fetchStatus).toBe('idle')

      rerender({ enabled: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
      expect(result.current.data).toBe(0.05)
    })
  })

  describe('Type safety', () => {
    it('should return number type for successful fetch', async () => {
      const mockPrice = 0.05
      mockedAxiosGet.mockResolvedValueOnce(createMockResponse({ 'oasis-network': { usd: mockPrice } }))

      const { useGetRosePrice } = await import('./api')
      const { result } = renderHook(() => useGetRosePrice(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

      const price: number | undefined = result.current.data
      expect(typeof price).toBe('number')
      expect(price).toBe(0.05)
    })
  })
})
