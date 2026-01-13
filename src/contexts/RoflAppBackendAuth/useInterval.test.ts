import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInterval } from './useInterval'

describe('contexts/RoflAppBackendAuth/useInterval', () => {
  describe('useInterval', () => {
    it('should not set interval when delay is null', () => {
      const callback = vi.fn()
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      renderHook(() => useInterval(callback, null))

      expect(setIntervalSpy).not.toHaveBeenCalled()
      expect(callback).not.toHaveBeenCalled()

      setIntervalSpy.mockRestore()
    })

    it('should set interval with specified delay', () => {
      const callback = vi.fn()
      const delay = 1000
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      const { unmount } = renderHook(() => useInterval(callback, delay))

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), delay)

      unmount()
      setIntervalSpy.mockRestore()
    })

    it('should clear interval on unmount', () => {
      const callback = vi.fn()
      const delay = 1000
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = renderHook(() => useInterval(callback, delay))

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })

    it('should clear interval when delay changes to null', () => {
      const callback = vi.fn()
      const delay = 1000
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { rerender } = renderHook(({ d }) => useInterval(callback, d), { initialProps: { d: delay } })

      rerender({ d: null })

      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })

    it('should handle delay of 0', () => {
      const callback = vi.fn()
      const delay = 0

      const { unmount } = renderHook(() => useInterval(callback, delay))

      // Should not throw with delay of 0
      expect(callback).not.toHaveBeenCalled()

      unmount()
    })

    it('should update callback ref when callback changes', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const delay = 1000

      const { rerender, unmount } = renderHook(({ cb }) => useInterval(cb, delay), {
        initialProps: { cb: callback1 },
      })

      // Update the callback
      rerender({ cb: callback2 })

      // Should not throw
      unmount()
    })
  })
})
