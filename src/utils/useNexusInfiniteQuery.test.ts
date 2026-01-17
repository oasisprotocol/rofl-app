import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import {
  createTestQueryClient,
  _createQueryClientWrapper,
  cleanupReactQuery,
} from '../test/test-utils-react-query'

// Use the globally mocked axios - don't mock nexus/api since we want the real code
const _mockedAxios = {
  get: (global as any).__mockAxiosGet as ReturnType<typeof vi.fn>,
  post: (global as any).__mockAxiosPost as ReturnType<typeof vi.fn>,
  put: (global as any).__mockAxiosPut as ReturnType<typeof vi.fn>,
  delete: (global as any).__mockAxiosDelete as ReturnType<typeof vi.fn>,
  patch: (global as any).__mockAxiosPatch as ReturnType<typeof vi.fn>,
}

describe('useNexusInfiniteQuery', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await cleanupReactQuery(queryClient)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should be defined as a function', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    expect(typeof useNexusInfiniteQuery).toBe('function')
  })

  it('should throw error when no param specifies limit', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn()

    expect(() => {
      renderHook(
        () =>
          useNexusInfiniteQuery({
            queryKeyPrefix: 'test',
            queryFn: mockQueryFn,
            resultsField: 'items',
            params: [{ foo: 'bar' }],
          }),
        { wrapper },
      )
    }).toThrow('Expected some param to specify page "limit"')
  })

  it('should throw error when offset is specified in params', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn()

    expect(() => {
      renderHook(
        () =>
          useNexusInfiniteQuery({
            queryKeyPrefix: 'test',
            queryFn: mockQueryFn,
            resultsField: 'items',
            params: [{ limit: 10, offset: 5 }],
          }),
        { wrapper },
      )
    }).toThrow('Unexpected param "offset" - it will be added automatically')
  })

  it('should call queryFn with offset added to the param with limit', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [{ id: 1 }, { id: 2 }],
        total_count: 10,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 2, filter: 'active' }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(mockQueryFn).toHaveBeenCalledWith({ limit: 2, offset: 0, filter: 'active' })
  })

  it('should handle multiple params and add offset to the correct one', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [{ id: 1 }],
        total_count: 5,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: ['network-id', { limit: 1, filter: 'test' }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(mockQueryFn).toHaveBeenCalledWith('network-id', { limit: 1, offset: 0, filter: 'test' })
  })

  it('should support pagination with getNextPageParam', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [{ id: 1 }, { id: 2 }],
        total_count: 6,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 2 }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    // Initial page should have 2 items
    expect(result.current.data?.pages).toHaveLength(1)
    expect(result.current.data?.pages[0].data.items).toHaveLength(2)

    // Should have next page since total_count (6) > items length (2)
    expect(result.current.hasNextPage).toBe(true)

    // Query function should be called with offset 0
    expect(mockQueryFn).toHaveBeenCalledWith({ limit: 2, offset: 0 })
  })

  it('should stop pagination when all items are fetched', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        total_count: 3,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 3 }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    // Should not have next page since all items are fetched
    expect(result.current.hasNextPage).toBe(false)
  })

  it('should respect enabled parameter', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [{ id: 1 }],
        total_count: 1,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 1 }],
          enabled: false,
        }),
      { wrapper },
    )

    // Query should not fetch when disabled
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(mockQueryFn).not.toHaveBeenCalled()
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('should use correct queryKey with params', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [{ id: 1 }],
        total_count: 1,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'my-query',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 10, filter: 'active' }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    // Query should have succeeded with the correct parameters
    expect(mockQueryFn).toHaveBeenCalledWith({ limit: 10, offset: 0, filter: 'active' })
  })

  it('should handle empty results correctly', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [],
        total_count: 0,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 10 }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(result.current.data?.pages[0].data.items).toHaveLength(0)
    expect(result.current.hasNextPage).toBe(false)
  })

  it('should calculate totalFetched correctly across pages', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        total_count: 10,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 4 }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    // Should have 4 items on the first page
    const totalFetched = result.current.data?.pages.reduce((sum, page) => sum + page.data.items.length, 0)
    expect(totalFetched).toBe(4)

    // Should still have next page since total_count is 10
    expect(result.current.hasNextPage).toBe(true)
  })

  it('should handle different resultsField names', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockResolvedValue({
      data: {
        transactions: [{ id: 1 }, { id: 2 }],
        total_count: 5,
      },
    })

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'transactions',
          params: [{ limit: 2 }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(result.current.data?.pages[0].data.transactions).toHaveLength(2)
  })

  it('should handle query errors gracefully', async () => {
    const { useNexusInfiniteQuery } = await import('./useNexusInfiniteQuery')
    const mockQueryFn = vi.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(
      () =>
        useNexusInfiniteQuery({
          queryKeyPrefix: 'test',
          queryFn: mockQueryFn,
          resultsField: 'items',
          params: [{ limit: 10 }],
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })

    expect(result.current.error).toBeTruthy()
    expect(mockQueryFn).toHaveBeenCalledTimes(1)
  })
})
