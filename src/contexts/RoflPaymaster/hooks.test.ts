import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRoflPaymasterContext } from './hooks'
import { RoflPaymasterContextProvider } from './Provider'
import * as React from 'react'
import { RoflAppPaymasterProvider } from '../contexts/RoflPaymaster/Provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('contexts/RoflPaymaster/hooks', () => {
  describe('useRoflPaymasterContext', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useRoflPaymasterContext())
      }).toThrow('[useRoflPaymasterContext] Component not wrapped within a Provider')

      consoleError.mockRestore()
    })

    it('should return context when used within provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(RoflPaymasterContextProvider, { children })

      const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

      expect(result.current).toBeDefined()
      expect(typeof result.current).toBe('object')
    })

    it('should return the same context on multiple calls', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(RoflPaymasterContextProvider, { children })

      const { result } = renderHook(() => useRoflPaymasterContext(), { wrapper })

      const context1 = result.current
      const context2 = result.current

      expect(context1).toBe(context2)
    })
  })
})
