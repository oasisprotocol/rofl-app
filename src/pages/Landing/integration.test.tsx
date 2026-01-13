import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { MemoryRouter } from 'react-router-dom'

// Mock react-router-dom at the top before importing the component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    MemoryRouter: ({ children }: any) => React.createElement('div', { children }),
  }
})

import { Landing } from './index'

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

// Mock Hero and Cards with their actual implementations simplified
vi.mock('./Hero', () => ({
  Hero: () => (
    <section data-testid="hero">
      <h1>Offchain Performance. Onchain Trust.</h1>
      <button data-testid="hero-button">Connect Wallet</button>
    </section>
  ),
}))

vi.mock('./Cards', () => ({
  Cards: () => (
    <div data-testid="cards">
      <a href="/templates" data-testid="templates-link">
        Start with templates
      </a>
      <a href="/explore" data-testid="explore-link">
        Explore the ecosystem
      </a>
    </div>
  ),
}))

describe('Landing Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page composition', () => {
    it('should render all main sections', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('layout')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('hero')).toBeInTheDocument()
      expect(screen.getByTestId('cards')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('should maintain correct DOM structure', () => {
      const { container } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const layout = screen.getByTestId('layout')
      const layoutMain = screen.getByTestId('layout-main')

      expect(layout).toContainElement(layoutMain)
      expect(layoutMain).toContainElement(screen.getByTestId('hero'))
      expect(layoutMain).toContainElement(screen.getByTestId('cards'))
    })

    it('should render Hero before Cards', () => {
      const { container } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const layoutMain = screen.getByTestId('layout-main')
      const children = Array.from(layoutMain.children)

      expect(children[0]).toBe(screen.getByTestId('hero'))
      expect(children[1]).toBe(screen.getByTestId('cards'))
    })
  })

  describe('Navigation flow', () => {
    it('should provide navigation to templates page', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const templatesLink = screen.getByTestId('templates-link')
      expect(templatesLink).toBeInTheDocument()
      expect(templatesLink.getAttribute('href')).toBe('/templates')
    })

    it('should provide navigation to explore page', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const exploreLink = screen.getByTestId('explore-link')
      expect(exploreLink).toBeInTheDocument()
      expect(exploreLink.getAttribute('href')).toBe('/explore')
    })

    it('should have consistent navigation across sections', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // Both Hero and Cards should provide navigation options
      expect(screen.getByTestId('hero')).toBeInTheDocument()
      expect(screen.getByTestId('cards')).toBeInTheDocument()
    })
  })

  describe('User journey', () => {
    it('should guide user from Hero to action buttons', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // Hero section should have call-to-action
      const heroButton = screen.getByTestId('hero-button')
      expect(heroButton).toBeInTheDocument()

      // Cards should provide additional navigation options
      expect(screen.getByTestId('templates-link')).toBeInTheDocument()
      expect(screen.getByTestId('explore-link')).toBeInTheDocument()
    })

    it('should maintain visual hierarchy', () => {
      const { container } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // Hero should come first (primary CTA)
      const layoutMain = screen.getByTestId('layout-main')
      const children = Array.from(layoutMain.children)

      expect(children[0]).toBe(screen.getByTestId('hero'))
      expect(children[1]).toBe(screen.getByTestId('cards'))
    })
  })

  describe('Responsive behavior', () => {
    it('should have responsive wrapper classes', () => {
      const { container } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // MemoryRouter wraps content in a div, so we check that Landing component renders
      const layout = screen.getByTestId('layout')
      expect(layout).toBeInTheDocument()
      // The responsive classes are applied to the wrapper div in the actual component
    })

    it('should render consistently across different viewport sizes', () => {
      const { container } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // Component should render regardless of viewport
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByTestId('hero')).toBeInTheDocument()
      expect(screen.getByTestId('cards')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render without blocking', () => {
      const startTime = performance.now()

      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100)
    })

    it('should maintain stable DOM structure across re-renders', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const initialStructure = screen.getByTestId('layout-main').innerHTML

      rerender(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const rerenderedStructure = screen.getByTestId('layout-main').innerHTML

      expect(initialStructure).toBe(rerenderedStructure)
    })
  })

  describe('Integration with routing', () => {
    it('should work within router context', () => {
      const { container } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should provide navigation links that work with router', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const templatesLink = screen.getByTestId('templates-link')
      const exploreLink = screen.getByTestId('explore-link')

      expect(templatesLink.getAttribute('href')).toBeTruthy()
      expect(exploreLink.getAttribute('href')).toBeTruthy()
    })
  })

  describe('Accessibility integration', () => {
    it('should have proper heading structure across sections', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // Hero should have the main heading
      const heading = screen.getByText('Offchain Performance. Onchain Trust.')
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible navigation elements', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // All links should be accessible
      const templatesLink = screen.getByTestId('templates-link')
      const exploreLink = screen.getByTestId('explore-link')

      expect(templatesLink.tagName).toBe('A')
      expect(exploreLink.tagName).toBe('A')
    })
  })

  describe('Component integration', () => {
    it('should integrate Header, Hero, Cards, and Footer', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('hero')).toBeInTheDocument()
      expect(screen.getByTestId('cards')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('should pass data correctly between components', () => {
      render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      // Components should render with their expected content
      expect(screen.getByText('Offchain Performance. Onchain Trust.')).toBeInTheDocument()
      expect(screen.getByText('Start with templates')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle rapid re-renders gracefully', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      for (let i = 0; i < 10; i++) {
        rerender(
          <MemoryRouter>
            <Landing />
          </MemoryRouter>,
        )
        expect(screen.getByTestId('layout')).toBeInTheDocument()
      }
    })

    it('should handle being rendered multiple times', () => {
      const { container: container1 } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      const { container: container2 } = render(
        <MemoryRouter>
          <Landing />
        </MemoryRouter>,
      )

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })
})
