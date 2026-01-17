import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import * as React from 'react'

// Mock the fathom-client module BEFORE any imports
vi.mock('fathom-client', () => ({
  load: vi.fn(),
  trackPageview: vi.fn(),
}))

// Mock the router BEFORE any imports
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}))

describe('FathomAnalytics - Analytics Enabled (rofl.app)', () => {
  let FathomAnalyticsHandler: any
  let load: any
  let trackPageview: any
  let useLocation: any

  beforeEach(async () => {
    // Reset modules to force reload
    vi.resetModules()

    // Set hostname to rofl.app BEFORE importing the module
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'rofl.app' },
    })

    // Clear mocks
    vi.clearAllMocks()

    // Dynamically import the modules after setting hostname
    const fathomClient = await import('fathom-client')
    load = fathomClient.load
    trackPageview = fathomClient.trackPageview

    const router = await import('react-router-dom')
    useLocation = router.useLocation
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    })

    // Import the component after setting hostname
    const index = await import('./index')
    FathomAnalyticsHandler = index.FathomAnalyticsHandler
  })

  it('should have rofl.app as hostname', () => {
    expect(window.location.hostname).toBe('rofl.app')
  })

  it('should call load when hostname is rofl.app (lines 16-18)', () => {
    render(React.createElement(FathomAnalyticsHandler))

    expect(load).toHaveBeenCalledWith(expect.any(String), { auto: false })
  })

  it('should call trackPageview when hostname is rofl.app (lines 25-28)', () => {
    render(React.createElement(FathomAnalyticsHandler))

    expect(trackPageview).toHaveBeenCalledWith({
      url: '/test',
      referrer: '',
    })
  })

  it('should call load once on mount', () => {
    render(React.createElement(FathomAnalyticsHandler))

    expect(load).toHaveBeenCalledTimes(1)
  })

  it('should call trackPageview with correct parameters', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/dashboard',
      search: '?query=1',
      hash: '',
      state: null,
      key: 'test',
    })

    render(React.createElement(FathomAnalyticsHandler))

    expect(trackPageview).toHaveBeenCalledWith({
      url: '/dashboard',
      referrer: '',
    })
  })

  it('should call trackPageview on location change', () => {
    const { rerender } = render(React.createElement(FathomAnalyticsHandler))

    expect(trackPageview).toHaveBeenCalledTimes(1)

    vi.mocked(useLocation).mockReturnValue({
      pathname: '/new-path',
      search: '',
      hash: '',
      state: null,
      key: 'test2',
    })

    rerender(React.createElement(FathomAnalyticsHandler))

    expect(trackPageview).toHaveBeenCalledTimes(2)
  })

  it('should not call trackPageview when location is null', () => {
    vi.mocked(useLocation).mockReturnValue(null as any)

    render(React.createElement(FathomAnalyticsHandler))

    // Should return early on line 23
    expect(trackPageview).not.toHaveBeenCalled()
  })

  it('should return early when location is falsy', () => {
    vi.mocked(useLocation).mockReturnValue(undefined as any)

    render(React.createElement(FathomAnalyticsHandler))

    // Should return early on line 23
    expect(trackPageview).not.toHaveBeenCalled()
  })
})
