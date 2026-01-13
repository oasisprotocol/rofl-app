import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BuildBadge } from './index'

describe('BuildBadge', () => {
  const originalLocation = window.location

  beforeEach(() => {
    // Restore original location before each test
    vi.stubGlobal('location', { ...originalLocation, hostname: 'localhost' })
  })

  it('should render DEV badge for dev.rofl.app hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'dev.rofl.app' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('DEV')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render STG badge for stg.rofl.app hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'stg.rofl.app' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('STG')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render PR badge for *.rofl-app.pages.dev hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'pr-123.rofl-app.pages.dev' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('pr-123')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render custom branch badge for branch.rofl-app.pages.dev hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'feature-new-ui.rofl-app.pages.dev' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('feature-new-ui')).toBeInTheDocument()
  })

  it('should render PR number badge for numeric PR hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: '456.rofl-app.pages.dev' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('456')).toBeInTheDocument()
  })

  it('should render null for production hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'rofl.app' })
    const { container } = render(<BuildBadge />)

    expect(container.firstChild).toBeNull()
  })

  it('should render null for localhost', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'localhost' })
    const { container } = render(<BuildBadge />)

    expect(container.firstChild).toBeNull()
  })

  it('should render null for 127.0.0.1', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: '127.0.0.1' })
    const { container } = render(<BuildBadge />)

    expect(container.firstChild).toBeNull()
  })

  it('should render null for unknown hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'unknown.example.com' })
    const { container } = render(<BuildBadge />)

    expect(container.firstChild).toBeNull()
  })

  it('should render null for empty hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: '' })
    const { container } = render(<BuildBadge />)

    expect(container.firstChild).toBeNull()
  })

  it('should apply correct CSS classes', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'dev.rofl.app' })
    const { container } = render(<BuildBadge />)

    const badge = container.querySelector('div')
    expect(badge).toHaveClass('h-[14px]')
    expect(badge).toHaveClass('py-2')
    expect(badge).toHaveClass('px-1.5')
    expect(badge).toHaveClass('bg-warning')
    expect(badge).toHaveClass('rounded-full')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('justify-center')
    expect(badge).toHaveClass('items-center')
  })

  it('should render text with correct styling', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'stg.rofl.app' })
    const { container } = render(<BuildBadge />)

    const text = container.querySelector('.text-white')
    expect(text).toHaveClass('text-[10px]')
    expect(text).toHaveClass('font-semibold')
    expect(text).toHaveClass('uppercase')
  })

  it('should uppercase the label', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'dev.rofl.app' })
    render(<BuildBadge />)

    const badge = screen.getByText('DEV')
    expect(badge.textContent).toBe('DEV')
  })

  it('should handle complex subdomain names', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'my-feature-branch.rofl-app.pages.dev' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('my-feature-branch')).toBeInTheDocument()
  })

  it('should handle subdomain with numbers and hyphens', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'pr-123-fix-bug.rofl-app.pages.dev' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('pr-123-fix-bug')).toBeInTheDocument()
  })

  it('should handle very long subdomain names', () => {
    const longSubdomain = 'a'.repeat(100)
    vi.stubGlobal('location', { ...originalLocation, hostname: `${longSubdomain}.rofl-app.pages.dev` })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText(longSubdomain)).toBeInTheDocument()
  })

  it('should handle subdomain with underscores', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'feature_my_branch.rofl-app.pages.dev' })
    const { container } = render(<BuildBadge />)

    expect(screen.getByText('feature_my_branch')).toBeInTheDocument()
  })

  it('should handle IP address as hostname', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: '192.168.1.1' })
    const { container } = render(<BuildBadge />)

    expect(container.firstChild).toBeNull()
  })

  it('should render DEV badge consistently across multiple renders', () => {
    vi.stubGlobal('location', { ...originalLocation, hostname: 'dev.rofl.app' })

    const { container: container1 } = render(<BuildBadge />)
    const { container: container2 } = render(<BuildBadge />)

    expect(container1.innerHTML).toBe(container2.innerHTML)
  })

  it('should render all badge types correctly', () => {
    // Test DEV
    vi.stubGlobal('location', { ...originalLocation, hostname: 'dev.rofl.app' })
    const { container: devContainer, unmount: unmountDev } = render(<BuildBadge />)
    expect(screen.getByText('DEV')).toBeInTheDocument()
    unmountDev()

    // Test STG
    vi.stubGlobal('location', { ...originalLocation, hostname: 'stg.rofl.app' })
    const { container: stgContainer, unmount: unmountStg } = render(<BuildBadge />)
    expect(screen.getByText('STG')).toBeInTheDocument()
    unmountStg()

    // Test PR
    vi.stubGlobal('location', { ...originalLocation, hostname: 'pr-456.rofl-app.pages.dev' })
    const { container: prContainer } = render(<BuildBadge />)
    expect(screen.getByText('pr-456')).toBeInTheDocument()
  })
})
