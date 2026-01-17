/**
 * React Query Test Utilities
 *
 * Provides proper isolation and cleanup for React Query hooks in tests
 * to prevent state pollution between test runs.
 */

import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, RenderHookOptions } from '@testing-library/react'

/**
 * Creates a fresh QueryClient for each test to ensure proper isolation
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  })
}

/**
 * Creates a test wrapper with a fresh QueryClient
 */
export function createQueryClientWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient()

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children)
}

/**
 * Renders a hook with proper React Query isolation
 * This should be used instead of renderHook for any hooks that use React Query
 */
export function renderHookWithQueryClient<T>(hook: () => T, options?: Omit<RenderHookOptions<T>, 'wrapper'>) {
  const queryClient = createTestQueryClient()
  const wrapper = createQueryClientWrapper(queryClient)

  return renderHook(hook, {
    ...options,
    wrapper,
  })
}

/**
 * Cleanup utility to ensure React Query properly clears state between tests
 * Call this in afterEach blocks for tests using React Query hooks
 */
export async function cleanupReactQuery(queryClient: QueryClient) {
  // Cancel all pending queries
  queryClient.cancelQueries()

  // Clear the query cache
  queryClient.clear()

  // Wait for any pending async operations
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Waits for React Query to settle (all queries to finish loading/error)
 */
export async function waitForReactQueryToSettle(queryClient: QueryClient) {
  // Wait for all pending queries to complete
  await new Promise(resolve => setTimeout(resolve, 100))

  // Ensure no mutations are in progress
  const mutations = queryClient.getMutationCache().getAll()
  for (const mutation of mutations) {
    if (mutation.state.status === 'pending') {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

/**
 * Test setup helper - use in beforeEach to ensure clean state
 */
export function setupReactQueryTest() {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
  })

  afterEach(async () => {
    if (queryClient) {
      await cleanupReactQuery(queryClient)
    }
  })

  return { getQueryClient: () => queryClient }
}
