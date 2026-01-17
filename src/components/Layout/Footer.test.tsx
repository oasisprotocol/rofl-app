import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'

// Mock global constants
declare global {
  const APP_VERSION: string
  const BUILD_COMMIT: string
  const BUILD_DATETIME: number
  const GITHUB_REPOSITORY_URL: string
}

// Mock global constants before tests
global.APP_VERSION = '1.2.3'
global.BUILD_COMMIT = 'abcdef1234567890'
global.BUILD_DATETIME = 1704067200000 // 2024-01-01 00:00:00 UTC
global.GITHUB_REPOSITORY_URL = 'https://github.com/oasisprotocol/rofl-app/'

// Mock the useIsMobile hook
const mockUseIsMobile = vi.fn(() => false)
vi.mock('@oasisprotocol/ui-library/src/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

// Mock BuildBadge to return null (not a dev/stg environment)
vi.mock('../BuildBadge', () => ({
  BuildBadge: () => null,
}))

// Import Footer after mocks are set up
import { Footer } from './Footer'

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to desktop by default
    mockUseIsMobile.mockReturnValue(false)
    // Reset global constants
    global.APP_VERSION = '1.2.3'
    global.BUILD_COMMIT = 'abcdef1234567890'
    global.BUILD_DATETIME = 1704067200000 // 2024-01-01 00:00:00 UTC
    global.GITHUB_REPOSITORY_URL = 'https://github.com/oasisprotocol/rofl-app/'
  })

  it('should render the copyright text with full name on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    render(<Footer />)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`Copyright © Oasis Protocol Foundation ${currentYear}`)).toBeInTheDocument()
  })

  it('should render the copyright text with short name on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)
    render(<Footer />)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`Copyright © OPF ${currentYear}`)).toBeInTheDocument()
  })

  it('should render the version link', () => {
    render(<Footer />)

    const versionLink = screen.getByText('1.2.3')
    expect(versionLink).toBeInTheDocument()
    expect(versionLink.tagName).toBe('A')
    expect(versionLink).toHaveAttribute(
      'href',
      'https://github.com/oasisprotocol/rofl-app/releases/tag/v1.2.3',
    )
    expect(versionLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(versionLink).toHaveAttribute('target', '_blank')
  })

  it('should render the commit link on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    render(<Footer />)

    // The commit info is always in DOM, controlled by CSS responsive classes
    expect(screen.getByText('abcdef1')).toBeInTheDocument()

    const commitLink = screen.getByText('abcdef1')
    expect(commitLink.tagName).toBe('A')
    expect(commitLink).toHaveAttribute(
      'href',
      'https://github.com/oasisprotocol/rofl-app/commit/abcdef1234567890',
    )
    expect(commitLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(commitLink).toHaveAttribute('target', '_blank')
  })

  it('should render commit info in DOM even on mobile (hidden via CSS)', () => {
    mockUseIsMobile.mockReturnValue(true)
    render(<Footer />)

    // The element is in DOM but hidden via CSS class "hidden md:inline"
    expect(screen.getByText('abcdef1')).toBeInTheDocument()
  })

  it('should render the build date in DOM (hidden via CSS on mobile)', () => {
    mockUseIsMobile.mockReturnValue(false)
    render(<Footer />)

    // Build info is in DOM, controlled by CSS responsive classes
    expect(screen.getByText(/built on/)).toBeInTheDocument()
  })

  it('should have build date info in DOM even on mobile (hidden via CSS)', () => {
    mockUseIsMobile.mockReturnValue(true)
    render(<Footer />)

    // The element is in DOM but hidden via CSS
    const buildInfo = screen.getByText(/built on/)
    expect(buildInfo).toBeInTheDocument()
    // The parent span should have the "hidden md:inline" class
    expect(buildInfo.closest('span')).toHaveClass('hidden')
  })

  it('should render the privacy policy link', () => {
    render(<Footer />)

    const privacyLink = screen.getByText('Privacy Policy')
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink.tagName).toBe('A')
    expect(privacyLink).toHaveAttribute('href', 'https://oasis.net/privacy-policy')
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(privacyLink).toHaveAttribute('target', '_blank')
  })

  it('should render separator between version info and privacy policy', () => {
    render(<Footer />)

    expect(screen.getByText('|')).toBeInTheDocument()
  })

  it('should have correct footer structure with all elements on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    const { container } = render(<Footer />)

    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('w-full', 'flex', 'items-center', 'justify-between')
  })

  it('should handle different build dates correctly', () => {
    mockUseIsMobile.mockReturnValue(false)

    // Set a specific build timestamp
    const testTimestamp = new Date('2024-06-15T00:00:00Z').getTime()
    global.BUILD_DATETIME = testTimestamp

    render(<Footer />)

    expect(screen.getByText(/built on/)).toBeInTheDocument()
    // Verify the date is formatted (MM/DD/YYYY pattern with slashes)
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/
    const footerText = screen.getByText(datePattern)
    expect(footerText).toBeInTheDocument()
  })

  it('should truncate commit hash to 7 characters', () => {
    mockUseIsMobile.mockReturnValue(false)

    global.BUILD_COMMIT = '1234567890abcdef'

    render(<Footer />)

    expect(screen.getByText('1234567')).toBeInTheDocument()
    expect(screen.queryByText('12345678')).not.toBeInTheDocument()
  })
})
