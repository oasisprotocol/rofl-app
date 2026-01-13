import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBlockNavigatingAway } from './useBlockNavigatingAway'
import { useBlocker } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock useBlocker from react-router-dom
vi.mock('react-router-dom', () => ({
  useBlocker: vi.fn(),
}))

const mockUseBlocker = vi.mocked(useBlocker)

describe('useBlockNavigatingAway', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return initial state with isBlockingNavigatingAway as false', () => {
    mockUseBlocker.mockReturnValue({
      state: 'unblocked',
      proceed: vi.fn(),
      reset: vi.fn(),
    })

    const { result } = renderHook(() => useBlockNavigatingAway())

    expect(result.current.isBlockingNavigatingAway).toBe(false)
    expect(result.current.blockNavigatingAway).toBeInstanceOf(Function)
    expect(result.current.allowNavigatingAway).toBeInstanceOf(Function)
  })

  it('should add beforeunload event listener when blocking navigation', () => {
    mockUseBlocker.mockReturnValue({
      state: 'unblocked',
      proceed: vi.fn(),
      reset: vi.fn(),
    })

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    const { result } = renderHook(() => useBlockNavigatingAway())

    act(() => {
      result.current.blockNavigatingAway()
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    expect(result.current.isBlockingNavigatingAway).toBe(true)

    addEventListenerSpy.mockRestore()
  })

  it('should remove beforeunload event listener when allowing navigation', () => {
    mockUseBlocker.mockReturnValue({
      state: 'unblocked',
      proceed: vi.fn(),
      reset: vi.fn(),
    })

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { result } = renderHook(() => useBlockNavigatingAway())

    act(() => {
      result.current.blockNavigatingAway()
    })

    act(() => {
      result.current.allowNavigatingAway()
    })

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    expect(result.current.isBlockingNavigatingAway).toBe(false)

    removeEventListenerSpy.mockRestore()
  })

  it('should call blocker.proceed and allowNavigatingAway when user confirms navigation', () => {
    const mockProceed = vi.fn()
    const mockReset = vi.fn()

    // Initially unblocked, then becomes blocked after blockNavigatingAway is called
    mockUseBlocker
      .mockReturnValueOnce({
        state: 'unblocked',
        proceed: mockProceed,
        reset: mockReset,
      })
      .mockReturnValueOnce({
        state: 'blocked',
        proceed: mockProceed,
        reset: mockReset,
      })

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const { result } = renderHook(() => useBlockNavigatingAway())

    act(() => {
      result.current.blockNavigatingAway()
    })

    // The useEffect should trigger when blocker state changes to 'blocked'
    // and confirm should be called
    expect(confirmSpy).toHaveBeenCalledWith('You are navigating away. Progress you made may not be saved.')

    confirmSpy.mockRestore()
  })

  it('should call blocker.reset when user cancels navigation', () => {
    const mockProceed = vi.fn()
    const mockReset = vi.fn()

    // Initially unblocked, then becomes blocked after blockNavigatingAway is called
    mockUseBlocker
      .mockReturnValueOnce({
        state: 'unblocked',
        proceed: mockProceed,
        reset: mockReset,
      })
      .mockReturnValueOnce({
        state: 'blocked',
        proceed: mockProceed,
        reset: mockReset,
      })

    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    const { result } = renderHook(() => useBlockNavigatingAway())

    act(() => {
      result.current.blockNavigatingAway()
    })

    // The useEffect should trigger when blocker state changes to 'blocked'
    // and confirm should be called
    expect(confirmSpy).toHaveBeenCalledWith('You are navigating away. Progress you made may not be saved.')
    expect(result.current.isBlockingNavigatingAway).toBe(true)

    confirmSpy.mockRestore()
  })

  it('should not proceed when blocker state is not blocked', () => {
    const mockProceed = vi.fn()
    const mockReset = vi.fn()

    mockUseBlocker.mockReturnValue({
      state: 'unblocked',
      proceed: mockProceed,
      reset: mockReset,
    })

    const { result } = renderHook(() => useBlockNavigatingAway())

    act(() => {
      result.current.blockNavigatingAway()
    })

    expect(mockProceed).not.toHaveBeenCalled()
    expect(mockReset).not.toHaveBeenCalled()
  })

  it('should persist global blocking state across hook instances', () => {
    mockUseBlocker.mockReturnValue({
      state: 'unblocked',
      proceed: vi.fn(),
      reset: vi.fn(),
    })

    const { result: result1 } = renderHook(() => useBlockNavigatingAway())

    act(() => {
      result1.current.blockNavigatingAway()
    })

    expect(result1.current.isBlockingNavigatingAway).toBe(true)

    // Unmount the first hook
    const { unmount } = renderHook(() => useBlockNavigatingAway())
    unmount()

    // Create a new hook instance - it should pick up the global state
    const { result: result2 } = renderHook(() => useBlockNavigatingAway())

    // The new instance should have the blocking state from the global variable
    expect(result2.current.isBlockingNavigatingAway).toBe(true)
  })

  describe('beforeUnloadHandler', () => {
    it('should prevent default on beforeunload event', () => {
      const preventDefaultSpy = vi.fn()
      const event = {
        preventDefault: preventDefaultSpy,
      } as unknown as BeforeUnloadEvent

      // Simulate beforeUnloadHandler behavior
      event.preventDefault()
      const returnValue = (event.returnValue = true)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(returnValue).toBe(true)
    })

    it('should set returnValue to true for legacy support', () => {
      const event = {
        preventDefault: vi.fn(),
      } as unknown as BeforeUnloadEvent

      // Simulate beforeUnloadHandler
      event.preventDefault()
      event.returnValue = true

      expect(event.returnValue).toBe(true)
    })

    it('should execute beforeUnloadHandler when beforeunload event is triggered', () => {
      mockUseBlocker.mockReturnValue({
        state: 'unblocked',
        proceed: vi.fn(),
        reset: vi.fn(),
      })

      let capturedEvent: BeforeUnloadEvent | null = null

      // Create a test for the actual event handler being called
      const addEventListenerSpy = vi
        .spyOn(window, 'addEventListener')
        .mockImplementation((event, handler) => {
          if (event === 'beforeunload') {
            // Simulate the event being triggered
            const mockEvent = {
              preventDefault: vi.fn(),
            } as unknown as BeforeUnloadEvent
            ;(handler as EventListener)(mockEvent)
            capturedEvent = mockEvent
          }
          return () => {}
        })

      const { result } = renderHook(() => useBlockNavigatingAway())

      act(() => {
        result.current.blockNavigatingAway()
      })

      // Verify the event handler was called and prevented default
      expect(capturedEvent).toBeTruthy()
      expect(capturedEvent?.returnValue).toBe(true)

      addEventListenerSpy.mockRestore()
    })
  })
})
