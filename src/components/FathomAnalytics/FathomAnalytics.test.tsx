import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FathomAnalytics } from './index'

// Mock fathom-client
const mockLoad = vi.fn()
const mockTrackPageview = vi.fn()

vi.mock('fathom-client', () => ({
  load: vi.fn((...args) => mockLoad(...args)),
  trackPageview: vi.fn((...args) => mockTrackPageview(...args)),
}))

describe('FathomAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset hostname before each test
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
    })
  })

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <FathomAnalytics />
      </MemoryRouter>,
    )

    // Component returns null, so we just check it doesn't throw
    expect(true).toBe(true)
  })

  it('returns null on non-production hostname', () => {
    const { container } = render(
      <MemoryRouter>
        <FathomAnalytics />
      </MemoryRouter>,
    )

    expect(container.firstChild).toBeNull()
  })

  it('does not load Fathom on non-production hostname', () => {
    render(
      <MemoryRouter>
        <FathomAnalytics />
      </MemoryRouter>,
    )

    // Since ANALYTICS_ENABLED is computed at module load time and we're on localhost,
    // the load function should not be called
    expect(mockLoad).not.toHaveBeenCalled()
  })

  it('does not track pageview on non-production hostname', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <FathomAnalytics />
      </MemoryRouter>,
    )

    // Since ANALYTICS_ENABLED is computed at module load time and we're on localhost,
    // the trackPageview function should not be called
    expect(mockTrackPageview).not.toHaveBeenCalled()
  })

  it('handles route changes gracefully', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/test1']}>
        <FathomAnalytics />
      </MemoryRouter>,
    )

    // Rerender with different route
    rerender(
      <MemoryRouter initialEntries={['/test2']}>
        <FathomAnalytics />
      </MemoryRouter>,
    )

    // Should not crash
    expect(true).toBe(true)
  })
})
