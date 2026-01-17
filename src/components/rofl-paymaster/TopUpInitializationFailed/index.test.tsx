import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopUpInitializationFailed } from './index'

// Mock the ROSE_APP_URL constant
vi.mock('../../../../constants/global', () => ({
  ROSE_APP_URL: 'https://rose.oasis.io/',
}))

describe('TopUpInitializationFailed', () => {
  it('renders the component', () => {
    render(<TopUpInitializationFailed />)

    expect(screen.getByText('Top-up Not Available')).toBeInTheDocument()
  })

  it('renders warning icon', () => {
    render(<TopUpInitializationFailed />)

    const alertIcon = document.querySelector('svg')
    expect(alertIcon).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<TopUpInitializationFailed />)

    expect(screen.getByText(/The wallet top-up functionality is currently not available/)).toBeInTheDocument()
    expect(screen.getByText(/You can still use the ROSE App/)).toBeInTheDocument()
  })

  it('renders link to ROSE App', () => {
    render(<TopUpInitializationFailed />)

    const link = screen.getByRole('link', { name: /Open ROSE App/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://rose.oasis.io/')
  })

  it('opens ROSE App link in new tab with security attributes', () => {
    render(<TopUpInitializationFailed />)

    const link = screen.getByRole('link', { name: /Open ROSE App/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders ExternalLink icon inside the button', () => {
    render(<TopUpInitializationFailed />)

    const link = screen.getByRole('link', { name: /Open ROSE App/i })
    const svgIcons = link.querySelectorAll('svg')
    expect(svgIcons.length).toBeGreaterThan(0)
  })

  it('has correct styling classes', () => {
    const { container } = render(<TopUpInitializationFailed />)

    const card = container.querySelector('.border-destructive\\/50')
    expect(card).toBeInTheDocument()

    const bgDestructive = container.querySelector('.bg-destructive\\/5')
    expect(bgDestructive).toBeInTheDocument()
  })

  it('renders card with correct width', () => {
    const { container } = render(<TopUpInitializationFailed />)

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('w-[400px]')
  })
})
