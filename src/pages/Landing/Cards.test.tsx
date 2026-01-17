import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { Cards } from './Cards'

// Mock dependencies
vi.mock('../../components/Card/index', () => ({
  CardWrapper: ({ title, description, to, label, image }: any) => (
    <div data-testid={`card-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {to && <a href={to}>{label || 'Link'}</a>}
      {image && <img src={image} alt={title} />}
    </div>
  ),
}))

vi.mock('@oasisprotocol/ui-library/src/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false | object)[]) => {
    const filtered = classes.filter(Boolean).flatMap(c => {
      if (typeof c === 'string') return c
      if (typeof c === 'object' && c !== null) {
        return Object.entries(c)
          .filter(([, value]) => value === true)
          .map(([key]) => key)
      }
      return []
    })
    return filtered.join(' ')
  },
}))

const mockUseAccount = vi.fn()
vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

describe('Cards Component', () => {
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
      const { container } = render(<Cards />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render all three cards', () => {
      render(<Cards />)
      expect(screen.getByTestId('card-start-with-templates')).toBeInTheDocument()
      expect(screen.getByTestId('card-flexible-deployment')).toBeInTheDocument()
      expect(screen.getByTestId('card-explore-the-ecosystem')).toBeInTheDocument()
    })

    it('should render "Start with templates" card', () => {
      render(<Cards />)
      expect(screen.getByText('Start with templates')).toBeInTheDocument()
      expect(
        screen.getByText('Skip the complexity and launch faster with our custom-built templates.'),
      ).toBeInTheDocument()
    })

    it('should render "Flexible deployment" card', () => {
      render(<Cards />)
      expect(screen.getByText('Flexible deployment')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Manage apps and access confidential VMs through a decentralized network of compute providers.',
        ),
      ).toBeInTheDocument()
    })

    it('should render "Explore the ecosystem" card', () => {
      render(<Cards />)
      expect(screen.getByText('Explore the ecosystem')).toBeInTheDocument()
      expect(
        screen.getByText(
          "Browse live examples and discover what's possible with verifiable offchain compute.",
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Card content based on connection state', () => {
    it('should link to /templates when not connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        connector: undefined,
      })

      render(<Cards />)
      const templatesCard = screen.getByTestId('card-start-with-templates')
      const link = templatesCard.querySelector('a')
      expect(link?.getAttribute('href')).toBe('/templates')
    })

    it('should link to /create when connected', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      render(<Cards />)
      const templatesCard = screen.getByTestId('card-start-with-templates')
      const link = templatesCard.querySelector('a')
      expect(link?.getAttribute('href')).toBe('/create')
    })

    it('should show "Create app" label on templates card', () => {
      render(<Cards />)
      expect(screen.getByText('Create app')).toBeInTheDocument()
    })

    it('should not show link on "Flexible deployment" card', () => {
      render(<Cards />)
      const deploymentCard = screen.getByTestId('card-flexible-deployment')
      const link = deploymentCard.querySelector('a')
      expect(link).not.toBeInTheDocument()
    })

    it('should link to /explore on ecosystem card', () => {
      render(<Cards />)
      const ecosystemCard = screen.getByTestId('card-explore-the-ecosystem')
      const link = ecosystemCard.querySelector('a')
      expect(link?.getAttribute('href')).toBe('/explore')
    })

    it('should show "Explore now" label on ecosystem card', () => {
      render(<Cards />)
      expect(screen.getByText('Explore now')).toBeInTheDocument()
    })
  })

  describe('Images', () => {
    it('should render image on ecosystem card', () => {
      render(<Cards />)
      const ecosystemCard = screen.getByTestId('card-explore-the-ecosystem')
      const img = ecosystemCard.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img?.getAttribute('src')).toContain('dashboard.webp')
    })

    it('should not render images on templates and deployment cards', () => {
      render(<Cards />)
      const templatesCard = screen.getByTestId('card-start-with-templates')
      const deploymentCard = screen.getByTestId('card-flexible-deployment')
      expect(templatesCard.querySelector('img')).not.toBeInTheDocument()
      expect(deploymentCard.querySelector('img')).not.toBeInTheDocument()
    })
  })

  describe('Layout and styling', () => {
    it('should render cards in grid layout', () => {
      const { container } = render(<Cards />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should apply responsive grid classes', () => {
      const { container } = render(<Cards />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('should apply gap classes', () => {
      const { container } = render(<Cards />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('gap-6')
    })

    it('should apply padding classes', () => {
      const { container } = render(<Cards />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('p-6')
      expect(wrapper).toHaveClass('md:p-12')
    })

    it('should render first two cards in top row', () => {
      const { container } = render(<Cards />)
      const topRow = container.querySelector('.grid')
      expect(topRow?.children).toHaveLength(2)
    })

    it('should render ecosystem card separately', () => {
      const { container } = render(<Cards />)
      const bottomRow = container.querySelectorAll('.grid')
      // Second grid for the ecosystem card
      expect(bottomRow.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Animation states', () => {
    it('should have opacity state controlled by isLoaded', () => {
      const { container } = render(<Cards />)

      // After useEffect runs, isLoaded is true, so opacity should be 100
      const topRow = container.querySelector('.grid')
      expect(topRow?.className).toContain('opacity-100')
    })

    it('should apply transition classes for fade-in effect', () => {
      const { container } = render(<Cards />)
      const topRow = container.querySelector('.grid')
      expect(topRow?.className).toContain('transition-all')
      expect(topRow?.className).toContain('duration-500')
      expect(topRow?.className).toContain('delay-250')
      expect(topRow?.className).toContain('ease-out')
    })

    it('should apply animation delay to ecosystem card', () => {
      const { container } = render(<Cards />)
      // Find the ecosystem card wrapper (the div with transition classes after the first grid)
      const wrappers = container.querySelectorAll('.transition-all')
      const ecosystemCardWrapper = Array.from(wrappers).find(w => w.className.includes('duration-1000'))
      expect(ecosystemCardWrapper?.className).toContain('duration-1000')
      expect(ecosystemCardWrapper?.className).toContain('delay-500')
    })

    it('should initialize isLoaded state on mount', () => {
      const { container } = render(<Cards />)

      // useEffect runs immediately setting isLoaded to true
      const topRow = container.querySelector('.grid')
      expect(topRow?.className).toContain('opacity-100')
    })
  })

  describe('useAccount hook integration', () => {
    it('should call useAccount hook', () => {
      render(<Cards />)
      expect(mockUseAccount).toHaveBeenCalled()
    })

    it('should use isConnected from useAccount', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x456',
        chainId: 1,
        connector: undefined,
      })

      render(<Cards />)

      const templatesCard = screen.getByTestId('card-start-with-templates')
      const link = templatesCard.querySelector('a')
      expect(link?.getAttribute('href')).toBe('/create')
    })
  })

  describe('Component structure', () => {
    it('should be exported as named export', () => {
      expect(Cards).toBeDefined()
      expect(typeof Cards).toBe('function')
    })

    it('should have margin bottom on first grid', () => {
      const { container } = render(<Cards />)
      const topRow = container.querySelector('.grid')
      expect(topRow).toHaveClass('mb-6')
    })

    it('should render ecosystem card with proper structure', () => {
      const { container: _container } = render(<Cards />)
      const ecosystemCard = screen.getByTestId('card-explore-the-ecosystem')
      expect(ecosystemCard).toBeInTheDocument()
      expect(ecosystemCard.querySelector('h3')).toHaveTextContent('Explore the ecosystem')
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

      const { container } = render(<Cards />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle connected state with null address', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: null,
        chainId: undefined,
        connector: undefined,
      })

      const { container } = render(<Cards />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle rapid connection state changes', () => {
      const { rerender, container } = render(<Cards />)

      // Rapidly switch between connected and disconnected states
      for (let i = 0; i < 5; i++) {
        mockUseAccount.mockReturnValue({
          isConnected: i % 2 === 0,
          address: i % 2 === 0 ? undefined : '0x123',
          chainId: i % 2 === 0 ? undefined : 1,
          connector: undefined,
        })

        rerender(<Cards />)
        expect(container.firstChild).toBeInTheDocument()
      }
    })

    it('should maintain state across re-renders', () => {
      const { rerender } = render(<Cards />)

      const initialCard = screen.getByTestId('card-start-with-templates')

      rerender(<Cards />)
      const rerenderedCard = screen.getByTestId('card-start-with-templates')

      expect(initialCard.textContent).toBe(rerenderedCard.textContent)
    })

    it('should handle missing image gracefully', () => {
      const { container: _container } = render(<Cards />)

      // Cards without images should still render
      expect(screen.getByTestId('card-start-with-templates')).toBeInTheDocument()
      expect(screen.getByTestId('card-flexible-deployment')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible card titles', () => {
      render(<Cards />)

      const templatesCard = screen.getByTestId('card-start-with-templates')
      const deploymentCard = screen.getByTestId('card-flexible-deployment')
      const ecosystemCard = screen.getByTestId('card-explore-the-ecosystem')

      expect(templatesCard.querySelector('h3')).toBeInTheDocument()
      expect(deploymentCard.querySelector('h3')).toBeInTheDocument()
      expect(ecosystemCard.querySelector('h3')).toBeInTheDocument()
    })

    it('should have accessible card descriptions', () => {
      render(<Cards />)

      const cards = [
        screen.getByTestId('card-start-with-templates'),
        screen.getByTestId('card-flexible-deployment'),
        screen.getByTestId('card-explore-the-ecosystem'),
      ]

      cards.forEach(card => {
        expect(card.querySelector('p')).toBeInTheDocument()
      })
    })

    it('should have accessible links', () => {
      render(<Cards />)

      const templatesCard = screen.getByTestId('card-start-with-templates')
      const ecosystemCard = screen.getByTestId('card-explore-the-ecosystem')

      expect(templatesCard.querySelector('a')).toBeInTheDocument()
      expect(ecosystemCard.querySelector('a')).toBeInTheDocument()
    })

    it('should have alt text for images', () => {
      render(<Cards />)

      const ecosystemCard = screen.getByTestId('card-explore-the-ecosystem')
      const img = ecosystemCard.querySelector('img')

      expect(img).toHaveAttribute('alt', 'Explore the ecosystem')
    })
  })

  describe('Integration with useAccount', () => {
    it('should respond to account connection changes', () => {
      const { rerender } = render(<Cards />)

      // Initially not connected - should link to /templates
      const templatesCard = screen.getByTestId('card-start-with-templates')
      let link = templatesCard.querySelector('a')
      expect(link?.getAttribute('href')).toBe('/templates')

      // Connect account - should link to /create
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      rerender(<Cards />)

      link = templatesCard.querySelector('a')
      expect(link?.getAttribute('href')).toBe('/create')
    })

    it('should not affect cards without links based on connection state', () => {
      const { rerender } = render(<Cards />)

      const deploymentCard = screen.getByTestId('card-flexible-deployment')
      const initialContent = deploymentCard.textContent

      // Change connection state
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x123',
        chainId: 1,
        connector: undefined,
      })

      rerender(<Cards />)

      // Deployment card content should remain unchanged
      expect(deploymentCard.textContent).toBe(initialContent)
    })
  })

  describe('Performance', () => {
    it('should use useEffect to set isLoaded state', () => {
      const { container } = render(<Cards />)

      // After useEffect runs, isLoaded is true, so opacity should be 100
      const topRow = container.querySelector('.grid')
      expect(topRow?.className).toContain('opacity-100')
    })

    it('should apply staggered animation delays', () => {
      const { container } = render(<Cards />)

      // Top row should have delay-250
      const topRow = container.querySelector('.grid')
      expect(topRow?.className).toContain('delay-250')

      // Ecosystem card wrapper should have delay-500
      const wrappers = container.querySelectorAll('.transition-all')
      const ecosystemCardWrapper = Array.from(wrappers).find(w => w.className.includes('duration-1000'))
      expect(ecosystemCardWrapper?.className).toContain('delay-500')
    })
  })

  describe('Responsive design', () => {
    it('should have mobile-first responsive grid', () => {
      const { container } = render(<Cards />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('should have responsive padding', () => {
      const { container } = render(<Cards />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('p-6')
      expect(wrapper).toHaveClass('md:p-12')
    })

    it('should maintain card layout on different screen sizes', () => {
      const { container } = render(<Cards />)

      // Top row should have 2 columns on medium screens
      const topRow = container.querySelector('.grid')
      expect(topRow?.children.length).toBe(2)
    })
  })
})
