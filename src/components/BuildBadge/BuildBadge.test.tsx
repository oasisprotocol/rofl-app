import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BuildBadge } from './index'

describe('BuildBadge', () => {
  const originalLocation = window.location

  beforeEach(() => {
    // Mock window.location
    vi.stubGlobal('location', {
      hostname: '',
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  it('returns null for production hostname', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'rofl.app' },
      writable: true,
    })

    const { container } = render(<BuildBadge />)
    expect(container.firstChild).toBeNull()
  })

  it('renders DEV badge for dev.rofl.app', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'dev.rofl.app' },
      writable: true,
    })

    render(<BuildBadge />)

    expect(screen.getByText('DEV')).toBeInTheDocument()
  })

  it('renders STG badge for stg.rofl.app', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'stg.rofl.app' },
      writable: true,
    })

    render(<BuildBadge />)

    expect(screen.getByText('STG')).toBeInTheDocument()
  })

  it('renders custom badge for rofl-app.pages.dev subdomains', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'feature-branch.rofl-app.pages.dev' },
      writable: true,
    })

    render(<BuildBadge />)

    expect(screen.getByText('feature-branch')).toBeInTheDocument()
  })

  it('renders badge with correct styling', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'dev.rofl.app' },
      writable: true,
    })

    const { container } = render(<BuildBadge />)

    const badge = container.firstChild as HTMLElement
    expect(badge).toHaveClass('bg-warning', 'rounded-full', 'inline-flex')
  })

  it('badge text is uppercase', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'dev.rofl.app' },
      writable: true,
    })

    const { container } = render(<BuildBadge />)

    const text = container.querySelector('div.text-white')
    expect(text).toHaveClass('uppercase')
  })

  it('handles complex subdomain names', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'my-feature-branch-123.rofl-app.pages.dev' },
      writable: true,
    })

    render(<BuildBadge />)

    expect(screen.getByText('my-feature-branch-123')).toBeInTheDocument()
  })

  it('returns null for localhost', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
    })

    const { container } = render(<BuildBadge />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null for IP addresses', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: '192.168.1.1' },
      writable: true,
    })

    const { container } = render(<BuildBadge />)
    expect(container.firstChild).toBeNull()
  })
})
