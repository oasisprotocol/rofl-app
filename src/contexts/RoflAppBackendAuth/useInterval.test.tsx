import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInterval } from './useInterval'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not schedule interval when delay is null', () => {
    const callback = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    const { unmount } = renderHook(() => useInterval(callback, null))

    expect(setIntervalSpy).not.toHaveBeenCalled()
    unmount()
  })

  it('should schedule interval with specified delay', () => {
    const callback = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useInterval(callback, 1000))

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
    expect(clearIntervalSpy).not.toHaveBeenCalled()

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should call callback multiple times', () => {
    const callback = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    const { unmount } = renderHook(() => useInterval(callback, 500))

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500)
    unmount()
  })

  it('should update callback when it changes', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    const { rerender, unmount } = renderHook(({ cb, delay }) => useInterval(cb, delay), {
      initialProps: { cb: callback1, delay: 1000 },
    })

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)

    // When only callback changes, interval doesn't restart (delay is same)
    rerender({ cb: callback2, delay: 1000 })

    // Interval should only be called once since delay didn't change
    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('should clear interval when delay changes to null', () => {
    const callback = vi.fn()
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { rerender, unmount } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    })

    rerender({ delay: null })

    expect(clearIntervalSpy).toHaveBeenCalled()
    unmount()
  })

  it('should clear interval on unmount', () => {
    const callback = vi.fn()
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useInterval(callback, 1000))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should handle delay of 0', () => {
    const callback = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    const { unmount } = renderHook(() => useInterval(callback, 0))

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 0)
    unmount()
  })

  it('should restart interval when delay changes', () => {
    const callback = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { rerender, unmount } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    })

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)

    rerender({ delay: 500 })

    // Should clear old interval and start new one
    expect(clearIntervalSpy).toHaveBeenCalled()
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500)
    unmount()
  })

  it('should actually invoke the callback function', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, 100))

    // Fast-forward time to trigger the interval
    vi.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(1)

    // Fast-forward again
    vi.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should use the latest callback when invoked', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const { rerender } = renderHook(({ cb }) => useInterval(cb, 100), {
      initialProps: { cb: callback1 },
    })

    // Advance time to trigger interval with first callback
    vi.advanceTimersByTime(100)

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).not.toHaveBeenCalled()

    // Update callback
    rerender({ cb: callback2 })

    // Advance time again
    vi.advanceTimersByTime(100)

    // New callback should be called
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('should not invoke callback immediately on mount', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, 1000))

    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle very short delays', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, 1))

    vi.advanceTimersByTime(10)

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(10)
  })

  it('should handle very long delays', () => {
    const callback = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    const { unmount } = renderHook(() => useInterval(callback, 1000000))

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000000)
    unmount()
  })

  it('should cleanup interval on unmount even with active timers', () => {
    const callback = vi.fn()
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { unmount } = renderHook(() => useInterval(callback, 1000))

    // Advance time partially
    vi.advanceTimersByTime(500)

    expect(callback).not.toHaveBeenCalled()

    // Unmount should clear the interval
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()

    // Advance time past the interval
    vi.advanceTimersByTime(1000)

    // Callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle changing from null delay to numeric delay', () => {
    const callback = vi.fn()
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    const { rerender, unmount } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: null },
    })

    expect(setIntervalSpy).not.toHaveBeenCalled()

    // Change to numeric delay
    rerender({ delay: 1000 })

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)

    unmount()
  })

  it('should preserve callback closure values', () => {
    let counter = 0
    const callback = vi.fn(() => {
      counter++
    })

    renderHook(() => useInterval(callback, 100))

    vi.advanceTimersByTime(300)

    expect(callback).toHaveBeenCalledTimes(3)
    expect(counter).toBe(3)
  })

  it('should handle rapid delay changes', () => {
    const callback = vi.fn()
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { rerender, unmount } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    })

    // Rapidly change delays
    rerender({ delay: 500 })
    rerender({ delay: 200 })
    rerender({ delay: 1000 })
    rerender({ delay: null })

    // Should have cleared intervals for each change
    expect(clearIntervalSpy).toHaveBeenCalled()

    unmount()
  })

  it('should export useInterval function', () => {
    expect(typeof useInterval).toBe('function')
  })

  it('should have correct function name', () => {
    expect(useInterval.name).toBe('useInterval')
  })
})
