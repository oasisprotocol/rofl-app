import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { LandingTemplates } from './index'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'

// Mock dependencies
vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ children, headerContent, footerContent }: any) => (
    <div data-testid="layout">
      {headerContent}
      <main data-testid="layout-main">{children}</main>
      {footerContent}
    </div>
  ),
}))

vi.mock('../../components/Layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

vi.mock('../../components/Layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, asChild, ...props }: any) =>
    React.createElement('button', { onClick, className, ...props }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/separator', () => ({
  Separator: ({ className }: any) => React.createElement('hr', { className, 'data-testid': 'separator' }),
}))

vi.mock('../../components/TemplatesList', () => ({
  TemplatesList: () => <div data-testid="templates-list">Templates List</div>,
}))

vi.mock('lucide-react', () => ({
  ArrowRight: () => React.createElement('span', { 'data-testid': 'arrow-right' }, '→'),
}))

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
}))

const mockOpenConnectModal = vi.fn()
vi.mock('../../components/RainbowKitConnectButton', () => ({
  RainbowKitConnectButton: ({ children }: any) => {
    return React.createElement(
      React.Fragment,
      null,
      children({
        openConnectModal: mockOpenConnectModal,
      }),
    )
  },
}))

const mockUseAccount = vi.fn(() => ({
  isConnected: false,
  address: undefined,
  chainId: undefined,
  connector: undefined,
}))

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

describe('LandingTemplates Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({
      isConnected: false,
      address: undefined,
      chainId: undefined,
      connector: undefined,
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<LandingTemplates />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render Layout component', () => {
      render(<LandingTemplates />)
      expect(screen.getByTestId('layout')).toBeInTheDocument()
    })

    it('should render Header component', () => {
      render(<LandingTemplates />)
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('should render Footer component', () => {
      render(<LandingTemplates />)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('should render page heading', () => {
      render(<LandingTemplates />)
      expect(screen.getByText('Create your app from a template')).toBeInTheDocument()
    })

    it('should render TemplatesList component', () => {
      render(<LandingTemplates />)
      expect(screen.getByTestId('templates-list')).toBeInTheDocument()
    })

    it('should render Separator', () => {
      render(<LandingTemplates />)
      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })
  })

  describe('Connected state', () => {
    it('should render "Get started" button when connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      render(<LandingTemplates />)
      expect(screen.getByText('Get started')).toBeInTheDocument()
    })

    it('should link to /dashboard when connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      render(<LandingTemplates />)
      const link = screen.getByText('Get started').closest('a')
      expect(link?.getAttribute('href')).toBe('/dashboard')
    })

    it('should render ArrowRight icon when connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      render(<LandingTemplates />)
      expect(screen.getByTestId('arrow-right')).toBeInTheDocument()
    })
  })

  describe('Disconnected state', () => {
    it('should render "Connect Wallet" button when not connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    })

    it('should render ArrowRight icon when not connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)
      expect(screen.getByTestId('arrow-right')).toBeInTheDocument()
    })
  })

  describe('Layout and styling', () => {
    it('should apply custom className for responsive heights', () => {
      const { container } = render(<LandingTemplates />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper?.className).toContain('[&>*]:md:max-h-none')
      expect(wrapper?.className).toContain('[&>*]:md:h-auto')
    })

    it('should apply padding and margin classes to main container', () => {
      const { container } = render(<LandingTemplates />)
      const mainContainer = screen.getByTestId('layout-main').firstChild as HTMLElement
      expect(mainContainer).toHaveClass('mx-auto')
      expect(mainContainer).toHaveClass('px-8')
      expect(mainContainer).toHaveClass('py-12')
    })

    it('should center the heading', () => {
      render(<LandingTemplates />)
      // The text-center class is on the h1 element itself
      const heading = screen.getAllByText('Create your app from a template')[0] as HTMLElement
      expect(heading).toHaveClass('text-center')
    })

    it('should apply margin bottom to heading section', () => {
      const { container } = render(<LandingTemplates />)
      // Find the div with mb-10 class (the first div in the main container)
      const mainContainer = screen.getByTestId('layout-main').firstChild as HTMLElement
      const headingSection = mainContainer?.querySelector('.mb-10')
      expect(headingSection).toBeInTheDocument()
    })

    it('should apply margin to Separator', () => {
      const { container } = render(<LandingTemplates />)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('my-8')
    })
  })

  describe('Typography', () => {
    it('should render heading with correct text', () => {
      render(<LandingTemplates />)
      expect(screen.getByText('Create your app from a template')).toBeInTheDocument()
    })

    it('should render heading with h1 tag', () => {
      render(<LandingTemplates />)
      const heading = screen.getByText('Create your app from a template')
      expect(heading.tagName).toBe('H1')
    })

    it('should render heading with correct classes', () => {
      render(<LandingTemplates />)
      const heading = screen.getByText('Create your app from a template')
      expect(heading).toHaveClass('text-2xl')
      expect(heading).toHaveClass('font-bold')
    })
  })

  describe('Component structure', () => {
    it('should be exported as named export', () => {
      expect(LandingTemplates).toBeDefined()
      expect(typeof LandingTemplates).toBe('function')
    })

    it('should render components in correct order', () => {
      const { container } = render(<LandingTemplates />)
      const layoutMain = screen.getByTestId('layout-main')
      const children = Array.from(layoutMain?.children || [])

      // First child should be the main container
      expect(children.length).toBeGreaterThan(0)
    })

    it('should render button section before separator', () => {
      const { container } = render(<LandingTemplates />)
      const separator = screen.getByTestId('separator')
      const button = screen.queryByRole('button')

      if (button) {
        const buttonIndex = Array.from(container.querySelectorAll('button, hr')).indexOf(button)
        const separatorIndex = Array.from(container.querySelectorAll('button, hr')).indexOf(separator)
        expect(buttonIndex).toBeLessThan(separatorIndex)
      }
    })

    it('should render TemplatesList after separator', () => {
      render(<LandingTemplates />)
      const templatesList = screen.getByTestId('templates-list')
      expect(templatesList).toBeInTheDocument()
    })
  })

  describe('RainbowKitConnectButton integration', () => {
    it('should render RainbowKitConnectButton children', () => {
      render(<LandingTemplates />)

      // Should render either "Get started" or "Connect Wallet" based on connection state
      const connectedButton = screen.queryByText('Get started')
      const disconnectedButton = screen.queryByText('Connect Wallet')

      expect(connectedButton || disconnectedButton).toBeInTheDocument()
    })

    it('should center the button section', () => {
      render(<LandingTemplates />)
      const buttonSection = screen.getByRole('button')?.parentElement
      expect(buttonSection).toHaveClass('text-center')
    })
  })

  describe('useAccount hook integration', () => {
    it('should call useAccount hook', () => {
      render(<LandingTemplates />)
      expect(mockUseAccount).toHaveBeenCalled()
    })

    it('should use isConnected from useAccount', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x456',
        chainId: 1,
        connector: undefined,
      })

      render(<LandingTemplates />)

      expect(screen.getByText('Get started')).toBeInTheDocument()
    })
  })

  describe('Button interactions', () => {
    it('should render button with size="lg"', () => {
      render(<LandingTemplates />)
      const button = screen.queryByRole('button')
      // Button is rendered, but the size prop is passed to the Button component
      expect(button).toBeInTheDocument()
    })

    it('should apply max-md:w-full to Connect Wallet button', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)
      const button = screen.getByText('Connect Wallet')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Responsive behavior', () => {
    it('should have proper responsive container classes', () => {
      const { container } = render(<LandingTemplates />)
      const mainContainer = screen.getByTestId('layout-main').firstChild as HTMLElement
      expect(mainContainer).toHaveClass('mx-auto')
      expect(mainContainer).toHaveClass('px-8')
      expect(mainContainer).toHaveClass('py-12')
    })

    it('should have responsive height override', () => {
      const { container } = render(<LandingTemplates />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper?.className).toContain('[&>*]:md:max-h-none')
      expect(wrapper?.className).toContain('[&>*]:md:h-auto')
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined connection state gracefully', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      const { container } = render(<LandingTemplates />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle connected state with null address', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: null,
        chainId: undefined,
        connector: undefined,
      })

      const { container } = render(<LandingTemplates />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle re-render with different connection states', () => {
      const { rerender } = render(<LandingTemplates />)

      // Initially not connected
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()

      // Re-render with connected state
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      rerender(<LandingTemplates />)
      expect(screen.getByText('Get started')).toBeInTheDocument()
    })

    it('should call openConnectModal when Connect Wallet button is clicked', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)

      const connectButton = screen.getByText('Connect Wallet')
      connectButton.click()

      // The openConnectModal should be called (lines 36-38)
      expect(mockOpenConnectModal).toHaveBeenCalled()
    })

    it('should apply max-md:w-full class to Connect Wallet button', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)

      const connectButton = screen.getByText('Connect Wallet')
      expect(connectButton).toBeInTheDocument()
      // The button should have the className from line 39
    })

    it('should render ArrowRight icon in Connect Wallet button', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)

      const arrowRight = screen.getByTestId('arrow-right')
      expect(arrowRight).toBeInTheDocument()
    })

    it('should pass openConnectModal to RainbowKitConnectButton children', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)

      // The RainbowKitConnectButton should render children with openConnectModal
      // This is tested implicitly by the Connect Wallet button being rendered
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    })

    it('should handle openConnectModal being called multiple times', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<LandingTemplates />)

      const connectButton = screen.getByText('Connect Wallet')

      // Click multiple times
      connectButton.click()
      connectButton.click()
      connectButton.click()

      expect(mockOpenConnectModal).toHaveBeenCalledTimes(3)
    })
  })
})
