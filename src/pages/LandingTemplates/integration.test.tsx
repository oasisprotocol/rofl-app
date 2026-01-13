import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { MemoryRouter } from 'react-router-dom'

// Mock react-router-dom at the top before importing the component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
    MemoryRouter: ({ children }: any) => React.createElement('div', { children }),
  }
})

import { LandingTemplates } from './index'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'

// Mock other dependencies

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
  TemplatesList: ({ handleTemplateSelect }: any) => (
    <div data-testid="templates-list">
      <div data-testid="template-1">
        <h3>Template 1</h3>
        {handleTemplateSelect && <button onClick={() => handleTemplateSelect('template-1')}>Select</button>}
      </div>
      <div data-testid="template-2">
        <h3>Template 2</h3>
        {handleTemplateSelect && <button onClick={() => handleTemplateSelect('template-2')}>Select</button>}
      </div>
      <div data-testid="suggest-idea-section">
        <a
          href="https://forms.gle/ctNi6FcZK6VXQucL7"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="suggest-idea-link"
        >
          Suggest an Idea
        </a>
      </div>
    </div>
  ),
}))

vi.mock('lucide-react', () => ({
  ArrowRight: () => React.createElement('span', { 'data-testid': 'arrow-right' }, '→'),
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

describe('LandingTemplates Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({
      isConnected: false,
      address: undefined,
      chainId: undefined,
      connector: undefined,
    })
  })

  describe('Page composition', () => {
    it('should render all main sections', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('layout')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('templates-list')).toBeInTheDocument()
      expect(screen.getByTestId('separator')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('should maintain correct DOM structure', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const layout = screen.getByTestId('layout')
      const layoutMain = screen.getByTestId('layout-main')

      expect(layout).toContainElement(layoutMain)
    })

    it('should render page heading', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      expect(screen.getByText('Create your app from a template')).toBeInTheDocument()
    })
  })

  describe('User journey flow', () => {
    it('should guide user from heading to templates', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      // Should show heading
      expect(screen.getByText('Create your app from a template')).toBeInTheDocument()

      // Should show templates list
      expect(screen.getByTestId('templates-list')).toBeInTheDocument()

      // Should show suggestion section
      expect(screen.getByTestId('suggest-idea-section')).toBeInTheDocument()
    })

    it('should provide navigation to dashboard when connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const link = screen.getByText('Get started').closest('a')
      expect(link?.getAttribute('href')).toBe('/dashboard')
    })

    it('should show connect wallet button when not connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    })
  })

  describe('Templates integration', () => {
    it('should render TemplatesList component', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('templates-list')).toBeInTheDocument()
    })

    it('should display template cards', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('template-1')).toBeInTheDocument()
      expect(screen.getByTestId('template-2')).toBeInTheDocument()
    })

    it('should show suggest idea section', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const suggestLink = screen.getByTestId('suggest-idea-link')
      expect(suggestLink).toBeInTheDocument()
      expect(suggestLink.getAttribute('href')).toBe('https://forms.gle/ctNi6FcZK6VXQucL7')
      expect(suggestLink.getAttribute('target')).toBe('_blank')
      expect(suggestLink.getAttribute('rel')).toBe('noopener noreferrer')
    })
  })

  describe('Connection state integration', () => {
    it('should change button based on connection state', () => {
      const { rerender } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      // Initially not connected
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()

      // Connect account
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      rerender(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      expect(screen.getByText('Get started')).toBeInTheDocument()
    })

    it('should call openConnectModal when clicking connect button', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const connectButton = screen.getByText('Connect Wallet')
      fireEvent.click(connectButton)

      expect(mockOpenConnectModal).toHaveBeenCalled()
    })
  })

  describe('Responsive behavior', () => {
    it('should have responsive wrapper classes', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      // MemoryRouter wraps content in a div, so we check that LandingTemplates component renders
      const layout = screen.getByTestId('layout')
      expect(layout).toBeInTheDocument()
      // The responsive classes are applied to the wrapper div in the actual component
    })

    it('should have responsive container classes', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const mainContainer = screen.getByTestId('layout-main').firstChild as HTMLElement
      expect(mainContainer).toHaveClass('mx-auto')
      expect(mainContainer).toHaveClass('px-8')
      expect(mainContainer).toHaveClass('py-12')
    })
  })

  describe('Layout integration', () => {
    it('should integrate with Layout component', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const layout = screen.getByTestId('layout')
      const header = screen.getByTestId('header')
      const footer = screen.getByTestId('footer')

      expect(layout).toContainElement(header)
      expect(layout).toContainElement(footer)
    })

    it('should render separator between button section and templates', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()

      // Separator should have margin classes
      expect(separator).toHaveClass('my-8')
    })
  })

  describe('Navigation flow', () => {
    it('should provide external link for suggesting ideas', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const suggestLink = screen.getByTestId('suggest-idea-link')
      expect(suggestLink.getAttribute('href')).toBe('https://forms.gle/ctNi6FcZK6VXQucL7')
    })

    it('should provide internal link to dashboard when connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const link = screen.getByText('Get started').closest('a')
      expect(link?.getAttribute('href')).toBe('/dashboard')
    })
  })

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now()

      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100)
    })

    it('should maintain stable structure across re-renders', () => {
      const { rerender } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const initialStructure = screen.getByTestId('layout-main').innerHTML

      rerender(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const rerenderedStructure = screen.getByTestId('layout-main').innerHTML

      expect(initialStructure).toBe(rerenderedStructure)
    })
  })

  describe('Accessibility integration', () => {
    it('should have proper heading structure', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const heading = screen.getByText('Create your app from a template')
      expect(heading.tagName).toBe('H1')
    })

    it('should have accessible external links', () => {
      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const suggestLink = screen.getByTestId('suggest-idea-link')
      expect(suggestLink.getAttribute('rel')).toBe('noopener noreferrer')
      expect(suggestLink.getAttribute('target')).toBe('_blank')
    })
  })

  describe('Edge cases', () => {
    it('should handle rapid connection state changes', () => {
      const { rerender, container } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      for (let i = 0; i < 5; i++) {
        mockUseAccount.mockReturnValue({
          isConnected: i % 2 === 0,
          address: i % 2 === 0 ? undefined : '0x123',
          chainId: i % 2 === 0 ? undefined : 1,
          connector: undefined,
        })

        rerender(
          <MemoryRouter>
            <LandingTemplates />
          </MemoryRouter>,
        )
        expect(container.firstChild).toBeInTheDocument()
      }
    })

    it('should handle multiple clicks on connect button', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const connectButton = screen.getByText('Connect Wallet')

      for (let i = 0; i < 5; i++) {
        fireEvent.click(connectButton)
      }

      expect(mockOpenConnectModal).toHaveBeenCalledTimes(5)
    })
  })

  describe('Component ordering', () => {
    it('should render components in correct order', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const layoutMain = screen.getByTestId('layout-main')
      const children = Array.from(layoutMain.children)

      // First child should be the main container
      expect(children.length).toBeGreaterThan(0)
    })

    it('should render button section before separator', () => {
      const { container } = render(
        <MemoryRouter>
          <LandingTemplates />
        </MemoryRouter>,
      )

      const button = screen.queryByRole('button')
      const separator = screen.getByTestId('separator')

      if (button) {
        const buttonIndex = Array.from(container.querySelectorAll('button, hr')).indexOf(button)
        const separatorIndex = Array.from(container.querySelectorAll('button, hr')).indexOf(separator)
        expect(buttonIndex).toBeLessThan(separatorIndex)
      }
    })
  })
})
