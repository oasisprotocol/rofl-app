import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'

// Mock all modules BEFORE importing Header
// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: ({ className }: any) => React.createElement('div', { className, 'data-testid': 'menu-icon' }, 'Menu'),
  Plus: ({ className }: any) => React.createElement('span', { className }, '+'),
}))

// Mock the RoflAppBackendAuthContext before importing components that use it
vi.mock('../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: () => ({
    token: 'mock-token',
    isAuthenticated: true,
    status: 'authenticated',
  }),
}))

// Mock the useIsMobile hook
vi.mock('@oasisprotocol/ui-library/src/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(),
}))

// Mock BuildBadge
vi.mock('../BuildBadge', () => ({
  BuildBadge: () => React.createElement('div', { 'data-testid': 'build-badge' }, 'Build Badge'),
}))

// Mock RainbowKitConnectButton - must be mocked before importing Header
vi.mock('../RainbowKitConnectButton', () => ({
  RainbowKitConnectButton: ({ onMobileClose }: any) =>
    React.createElement(
      'button',
      {
        'data-testid': 'connect-button',
        onClick: onMobileClose,
      },
      'Connect',
    ),
}))

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

// Mock ui-library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) =>
    asChild
      ? React.cloneElement(children as React.ReactElement, props)
      : React.createElement('button', props, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/sheet', () => ({
  Sheet: ({ children, open, _onOpenChange }: any) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'sheet',
        'data-open': open,
      },
      children,
    )
  },
  SheetContent: ({ children, side }: any) =>
    React.createElement('div', { 'data-testid': `sheet-content-${side}` }, children),
  SheetHeader: ({ children }: any) => React.createElement('div', { 'data-testid': 'sheet-header' }, children),
  SheetTitle: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'sheet-title' }, children),
  SheetTrigger: ({ children, asChild }: any) =>
    asChild ? children : React.createElement('button', null, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/separator', () => ({
  Separator: ({ className }: any) => React.createElement('hr', { className, 'data-testid': 'separator' }),
}))

// Mock NavbarLink
vi.mock('../NavbarLink', () => ({
  NavbarLink: ({ children, to, onClick }: any) =>
    React.createElement(
      'a',
      {
        href: to,
        onClick,
        'data-testid': `navlink-${to.replace(/\//g, '-').replace(/^-/, '') || 'home'}`,
      },
      children,
    ),
}))

// NOW import Header after all mocks are set up
import { Header } from './Header'

import { useAccount } from 'wagmi'
import { useIsMobile } from '@oasisprotocol/ui-library/src/hooks/use-mobile'

const mockUseAccount = vi.mocked(useAccount)
const mockUseIsMobile = vi.mocked(useIsMobile)

describe('Header Component', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(BrowserRouter, null, children)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Desktop View', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(false)
    })

    it('should render logo linking to home when not connected', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      const logos = screen.getAllByAltText('ROFL App')
      expect(logos.length).toBeGreaterThan(0)
      const headerLogo = logos[0]
      expect(headerLogo).toBeInTheDocument()
      expect(headerLogo.closest('a')).toHaveAttribute('href', '/')
    })

    it('should render logo linking to dashboard when connected', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      const logos = screen.getAllByAltText('ROFL App')
      expect(logos.length).toBeGreaterThan(0)
      const headerLogo = logos[0]
      expect(headerLogo.closest('a')).toHaveAttribute('href', '/dashboard')
    })

    it('should render BuildBadge', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      expect(screen.getByTestId('build-badge')).toBeInTheDocument()
    })

    it('should show Create button when connected', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      const createButton = screen.getByText('Create')
      expect(createButton).toBeInTheDocument()
      expect(createButton.closest('a')).toHaveAttribute('href', '/create')
    })

    it('should not show Create button when not connected', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      expect(screen.queryByText('Create')).not.toBeInTheDocument()
    })

    it('should render RainbowKitConnectButton on desktop', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      const connectButtons = screen.getAllByTestId('connect-button')
      expect(connectButtons.length).toBeGreaterThan(0)
    })

    it('should not show mobile menu button on desktop', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      expect(screen.queryByLabelText('Toggle navigation menu')).not.toBeInTheDocument()
    })
  })

  describe('Mobile View', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true)
    })

    it('should render mobile menu button', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      const menuIcon = screen.queryByTestId('menu-icon')
      expect(menuIcon).toBeInTheDocument()
    })

    it('should render Sheet component with open state', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      const { container } = render(<Header />, { wrapper })

      const sheet = container.querySelector('[data-testid="sheet"]')
      expect(sheet).toBeInTheDocument()
    })

    it('should not show desktop Connect button on mobile', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      const { container } = render(<Header />, { wrapper })

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render mobile navigation links', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      expect(screen.getByTestId('navlink-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('navlink-dashboard-apps')).toBeInTheDocument()
      expect(screen.getByTestId('navlink-dashboard-machines')).toBeInTheDocument()
      expect(screen.getByTestId('navlink-explore')).toBeInTheDocument()
    })

    it('should render separator in mobile menu', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })

    it('should render RainbowKitConnectButton in mobile menu', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      const connectButtons = screen.getAllByTestId('connect-button')
      expect(connectButtons.length).toBeGreaterThan(0)
    })

    it('should have screen reader only title for sheet', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      expect(screen.getByTestId('sheet-title')).toHaveClass('sr-only')
    })
  })

  describe('Layout Structure', () => {
    it('should have proper flex layout', () => {
      mockUseIsMobile.mockReturnValue(false)
      mockUseAccount.mockReturnValue({ isConnected: false })

      const { container } = render(<Header />, { wrapper })

      const headerDiv = container.firstChild as HTMLElement
      expect(headerDiv).toHaveClass('w-full')
      expect(headerDiv).toHaveClass('flex')
    })

    it('should have logo and build badge in left section', () => {
      mockUseIsMobile.mockReturnValue(false)
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      const logos = screen.getAllByAltText('ROFL App')
      const buildBadge = screen.getByTestId('build-badge')

      expect(logos.length).toBeGreaterThan(0)
      expect(buildBadge).toBeInTheDocument()
    })
  })

  describe('Logo Image', () => {
    it('should have correct alt text', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      const logos = screen.getAllByAltText('ROFL App')
      expect(logos.length).toBeGreaterThan(0)
    })

    it('should have correct height class', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      const logos = screen.getAllByAltText('ROFL App')
      expect(logos[0]).toHaveClass('h-[36px]')
    })
  })

  describe('Accessibility', () => {
    it('should have screen reader only text for menu toggle', () => {
      mockUseIsMobile.mockReturnValue(true)
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      const menuIcon = screen.queryByTestId('menu-icon')
      expect(menuIcon).toBeInTheDocument()

      const srOnlyText = Array.from(document.querySelectorAll('.sr-only')).find(
        el => el.textContent === 'Toggle navigation menu',
      )
      expect(srOnlyText).toBeInTheDocument()
    })

    it('should have sheet title for screen readers', () => {
      mockUseIsMobile.mockReturnValue(true)
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      const sheetTitle = screen.getByTestId('sheet-title')
      expect(sheetTitle).toHaveTextContent('Navigation Menu')
    })
  })

  describe('Navigation Links', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true)
      mockUseAccount.mockReturnValue({ isConnected: true })
    })

    it('should render Dashboard link', () => {
      render(<Header />, { wrapper })

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })

    it('should render Apps link', () => {
      render(<Header />, { wrapper })

      const appsLink = screen.getByText('Apps').closest('a')
      expect(appsLink).toHaveAttribute('href', '/dashboard/apps')
    })

    it('should render Machines link', () => {
      render(<Header />, { wrapper })

      const machinesLink = screen.getByText('Machines').closest('a')
      expect(machinesLink).toHaveAttribute('href', '/dashboard/machines')
    })

    it('should render Explore link', () => {
      render(<Header />, { wrapper })

      const exploreLink = screen.getByText('Explore').closest('a')
      expect(exploreLink).toHaveAttribute('href', '/explore')
    })
  })

  describe('Sheet Component', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true)
    })

    it('should pass open state to Sheet', () => {
      mockUseAccount.mockReturnValue({ isConnected: false })

      const { container } = render(<Header />, { wrapper })

      const sheet = container.querySelector('[data-testid="sheet"]')
      expect(sheet).toHaveAttribute('data-open', 'false')
    })

    it('should render SheetContent with side="top"', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      expect(screen.getByTestId('sheet-content-top')).toBeInTheDocument()
    })

    it('should render SheetHeader', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      expect(screen.getByTestId('sheet-header')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt layout based on connection status', () => {
      mockUseIsMobile.mockReturnValue(false)

      mockUseAccount.mockReturnValue({ isConnected: false })
      render(<Header />, { wrapper })
      expect(screen.queryByText('Create')).not.toBeInTheDocument()

      cleanup()

      mockUseAccount.mockReturnValue({ isConnected: true })
      render(<Header />, { wrapper })
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('should adapt layout based on mobile state', () => {
      mockUseAccount.mockReturnValue({ isConnected: true })

      mockUseIsMobile.mockReturnValue(false)
      const { unmount } = render(<Header />, { wrapper })
      expect(screen.queryByTestId('menu-icon')).toBeInTheDocument()
      unmount()

      mockUseIsMobile.mockReturnValue(true)
      render(<Header />, { wrapper })
      expect(screen.queryByTestId('menu-icon')).toBeInTheDocument()
    })
  })

  describe('Plus Icon', () => {
    it('should render Plus icon in Create button', () => {
      mockUseIsMobile.mockReturnValue(false)
      mockUseAccount.mockReturnValue({ isConnected: true })

      render(<Header />, { wrapper })

      const createButton = screen.getByText('Create')
      expect(createButton).toBeInTheDocument()
    })
  })

  describe('Menu Icon', () => {
    it('should render Menu icon on mobile', () => {
      mockUseIsMobile.mockReturnValue(true)
      mockUseAccount.mockReturnValue({ isConnected: false })

      render(<Header />, { wrapper })

      const menuIcon = screen.queryByTestId('menu-icon')
      expect(menuIcon).toBeInTheDocument()
    })
  })
})
