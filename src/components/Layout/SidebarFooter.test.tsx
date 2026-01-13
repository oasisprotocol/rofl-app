import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'

// Mock the useSidebar hook
vi.mock('@oasisprotocol/ui-library/src/components/ui/sidebar', () => ({
  useSidebar: vi.fn(() => ({ state: 'expanded' })),
  SidebarMenuButton: ({ children, asChild, ...props }: any) => {
    if (asChild) {
      return React.Children.only(children)
    }
    return React.createElement('button', props, children)
  },
}))

// Mock ui-library button component
vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, className, _asChild, ...props }: any) =>
    React.createElement('button', { className, ...props }, children),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MessageSquare: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'message-square-icon' }),
  HelpCircle: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'help-circle-icon' }),
}))

// Import SidebarFooterContent after mocks are set up
import { SidebarFooterContent } from './SidebarFooter'
import { useSidebar } from '@oasisprotocol/ui-library/src/components/ui/sidebar'

const mockedUseSidebar = vi.mocked(useSidebar)

describe('SidebarFooterContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Expanded state', () => {
    beforeEach(() => {
      mockedUseSidebar.mockReturnValue({ state: 'expanded' })
    })

    it('should render feedback section with beta message', () => {
      render(<SidebarFooterContent />)

      expect(screen.getByText('Running in Beta')).toBeInTheDocument()
      expect(screen.getByText('Provide feedback here')).toBeInTheDocument()
    })

    it('should render support section', () => {
      render(<SidebarFooterContent />)

      expect(screen.getByText('Need Support?')).toBeInTheDocument()
      expect(screen.getByText('Speak to our devs')).toBeInTheDocument()
    })

    it('should render feedback link with correct href', () => {
      render(<SidebarFooterContent />)

      const feedbackLink = screen.getByText('Provide feedback here').closest('a')
      expect(feedbackLink).toHaveAttribute('href', 'https://forms.gle/yewQDdMzNg81wKtw9')
      expect(feedbackLink).toHaveAttribute('target', '_blank')
      expect(feedbackLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render support link with correct href', () => {
      render(<SidebarFooterContent />)

      const supportLink = screen.getByText('Speak to our devs').closest('a')
      expect(supportLink).toHaveAttribute('href', 'https://oasis.io/discord')
      expect(supportLink).toHaveAttribute('target', '_blank')
      expect(supportLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should use useSidebar hook', () => {
      render(<SidebarFooterContent />)

      expect(mockedUseSidebar).toHaveBeenCalled()
    })
  })

  describe('Collapsed state', () => {
    beforeEach(() => {
      mockedUseSidebar.mockReturnValue({ state: 'collapsed' })
    })

    it('should render icon-only buttons when collapsed', () => {
      render(<SidebarFooterContent />)

      // Should have icons but not text
      expect(screen.queryByText('Running in Beta')).not.toBeInTheDocument()
      expect(screen.queryByText('Need Support?')).not.toBeInTheDocument()
      expect(screen.getByTestId('message-square-icon')).toBeInTheDocument()
      expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument()
    })

    it('should render feedback button with icon', () => {
      render(<SidebarFooterContent />)

      const feedbackLink = screen.getByTestId('message-square-icon').closest('a')
      expect(feedbackLink).toHaveAttribute('href', 'https://forms.gle/yewQDdMzNg81wKtw9')
      expect(feedbackLink).toHaveAttribute('title', 'Provide feedback')
    })

    it('should render support button with icon', () => {
      render(<SidebarFooterContent />)

      const supportLink = screen.getByTestId('help-circle-icon').closest('a')
      expect(supportLink).toHaveAttribute('href', 'https://oasis.io/discord')
      expect(supportLink).toHaveAttribute('title', 'Get support')
    })
  })

  describe('Component structure', () => {
    it('should be defined', () => {
      expect(SidebarFooterContent).toBeDefined()
    })

    it('should be a function component', () => {
      expect(typeof SidebarFooterContent).toBe('function')
    })

    it('should have correct component name', () => {
      expect(SidebarFooterContent.name).toBe('SidebarFooterContent')
    })
  })
})
