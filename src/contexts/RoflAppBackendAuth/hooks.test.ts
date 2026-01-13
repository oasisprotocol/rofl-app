import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRoflAppBackendAuthContext } from './hooks'
import { RoflAppBackendAuthProvider } from './Provider'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'

describe('contexts/RoflAppBackendAuth/hooks', () => {
  describe('useRoflAppBackendAuthContext', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useRoflAppBackendAuthContext())
      }).toThrow('useRoflAppBackendAuthContext must be used within a RoflAppBackendAuthProvider')

      consoleError.mockRestore()
    })

    it('should return context when used within provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          BrowserRouter,
          null,
          React.createElement(RoflAppBackendAuthProvider, null, children),
        )

      const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

      expect(result.current).toBeDefined()
    })

    it('should return context with expected properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          BrowserRouter,
          null,
          React.createElement(RoflAppBackendAuthProvider, null, children),
        )

      const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

      // Check that context has expected properties
      expect(result.current).toHaveProperty('token')
      expect(result.current).toHaveProperty('isAuthenticated')
      expect(result.current).toHaveProperty('status')
    })

    it('should return the same context on multiple calls', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          BrowserRouter,
          null,
          React.createElement(RoflAppBackendAuthProvider, null, children),
        )

      const { result } = renderHook(() => useRoflAppBackendAuthContext(), { wrapper })

      const context1 = result.current
      const context2 = result.current

      expect(context1).toBe(context2)
    })
  })
})
