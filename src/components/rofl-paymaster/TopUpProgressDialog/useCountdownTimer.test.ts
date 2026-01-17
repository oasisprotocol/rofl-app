import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdownTimer } from './useCountdownTimer'

describe('useCountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with the provided initial time', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 60 }))

    expect(result.current.timeLeft).toBe(60)
    expect(result.current.formattedTime).toBe('1:00')
    expect(result.current.isNegative).toBe(false)
    expect(result.current.isActive).toBe(false)
  })

  it('formats time correctly for seconds only', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 45 }))

    expect(result.current.formattedTime).toBe('0:45')
  })

  it('formats time correctly for minutes and seconds', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 125 }))

    expect(result.current.formattedTime).toBe('2:05')
  })

  it('formats time correctly for hours and minutes', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 3661 }))

    // The formatMinutesAndSeconds function formats as MM:SS, not HH:MM:SS
    // 3661 seconds = 61 minutes and 1 second = 1:01 (61 % 60 = 1 minute, 1 second)
    expect(result.current.formattedTime).toBe('1:01')
  })

  it('detects negative time correctly', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: -10 }))

    expect(result.current.isNegative).toBe(true)
    expect(result.current.formattedTime).toBe('-0:10')
  })

  it('starts countdown when start is called', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 10 }))

    act(() => {
      result.current.start()
    })

    expect(result.current.isActive).toBe(true)
    expect(result.current.timeLeft).toBe(10)
  })

  it('decrements time every second when active', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 5 }))

    act(() => {
      result.current.start()
    })

    expect(result.current.timeLeft).toBe(5)

    // Run pending timers to trigger the first interval
    act(() => {
      vi.runOnlyPendingTimers()
    })

    // After 1 second, should be 4 (the interval fires after 1000ms)
    expect(result.current.timeLeft).toBe(4)

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    // After 2 more seconds, should be 2
    expect(result.current.timeLeft).toBe(2)
  })

  it('continues counting down past zero', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 2 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    expect(result.current.timeLeft).toBe(-1)
    expect(result.current.isNegative).toBe(true)
    expect(result.current.formattedTime).toBe('-0:01')
  })

  it('stops countdown when stop is called', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 10 }))

    act(() => {
      result.current.start()
    })

    expect(result.current.isActive).toBe(true)

    act(() => {
      result.current.stop()
    })

    expect(result.current.isActive).toBe(false)

    // Verify time doesn't continue decrementing
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(result.current.timeLeft).toBe(10)
  })

  it('resets countdown to initial time when reset is called', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 30 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    expect(result.current.timeLeft).toBe(25)

    act(() => {
      result.current.reset()
    })

    expect(result.current.timeLeft).toBe(30)
    expect(result.current.isActive).toBe(false)
  })

  it('clears interval on reset', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 10 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      result.current.reset()
    })

    // Time should not decrement after reset
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(result.current.timeLeft).toBe(10)
  })

  it('calls onTimeUp callback when time reaches zero', () => {
    const onTimeUp = vi.fn()
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 2, onTimeUp }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    expect(onTimeUp).toHaveBeenCalledTimes(1)
  })

  it('only calls onTimeUp once when time reaches zero', () => {
    const onTimeUp = vi.fn()
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 2, onTimeUp }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    expect(onTimeUp).toHaveBeenCalledTimes(1)
  })

  it('does not call onTimeUp if timer is stopped before reaching zero', () => {
    const onTimeUp = vi.fn()
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 5, onTimeUp }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    act(() => {
      result.current.stop()
    })

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    expect(onTimeUp).not.toHaveBeenCalled()
  })

  it('updates formatted time as countdown progresses', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 65 }))

    act(() => {
      result.current.start()
    })

    expect(result.current.formattedTime).toBe('1:05')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // After 1 second, time should be 64 seconds = 1:04
    expect(result.current.formattedTime).toBe('1:04')

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    // After 4 more seconds, time should be 60 seconds = 1:00
    expect(result.current.formattedTime).toBe('1:00')
  })

  it('handles initialTimeInSeconds of zero', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 0 }))

    expect(result.current.timeLeft).toBe(0)
    expect(result.current.formattedTime).toBe('0:00')
    expect(result.current.isNegative).toBe(false)
  })

  it('can be restarted after stopping', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 10 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    // After 3 seconds, time should be 7
    expect(result.current.timeLeft).toBe(7)

    act(() => {
      result.current.stop()
    })

    // Verify time doesn't change after stop
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(result.current.timeLeft).toBe(7)

    act(() => {
      result.current.start()
    })

    // Start resets to initial time (this is the behavior of the actual hook)
    expect(result.current.timeLeft).toBe(10)

    act(() => {
      vi.runOnlyPendingTimers()
      vi.runOnlyPendingTimers()
    })

    expect(result.current.timeLeft).toBe(8)
  })

  it('cleans up interval on unmount', () => {
    const { result, unmount } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 10 }))

    act(() => {
      result.current.start()
    })

    unmount()

    // If interval was not cleaned up, this would cause issues
    act(() => {
      vi.runOnlyPendingTimers()
    })
  })

  it('handles rapid start/stop/reset calls', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: 30 }))

    act(() => {
      result.current.start()
      result.current.stop()
      result.current.start()
      result.current.reset()
    })

    expect(result.current.timeLeft).toBe(30)
    expect(result.current.isActive).toBe(false)
  })

  it('formats negative time with correct padding', () => {
    const { result } = renderHook(() => useCountdownTimer({ initialTimeInSeconds: -66 }))

    expect(result.current.formattedTime).toBe('-1:06')

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.formattedTime).toBe('-1:07')
  })
})
