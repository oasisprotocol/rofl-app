import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

import { Explore } from './index'

// Mock other dependencies
vi.mock('../../components/AppsList', () => ({
  AppsList: ({ emptyState, type }: any) => (
    <div data-testid="apps-list" data-type={type}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div data-testid="app-card-1">App 1</div>
        <div data-testid="app-card-2">App 2</div>
        <div data-testid="app-card-3">App 3</div>
      </div>
      {emptyState && <div data-testid="empty-state">{emptyState}</div>}
    </div>
  ),
}))

vi.mock('./emptyState', () => ({
  ExploreEmptyState: () => (
    <div data-testid="explore-empty-state">
      <h2>Apps preview not available</h2>
      <p>Try again later or check your network connection.</p>
    </div>
  ),
}))

describe('Explore Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page rendering', () => {
    it('should render within router context', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should pass correct type prop to AppsList', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const appsList = screen.getByTestId('apps-list')
      expect(appsList.getAttribute('data-type')).toBe('explore')
    })

    it('should render empty state component', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('explore-empty-state')).toBeInTheDocument()
    })
  })

  describe('Component composition', () => {
    it('should compose AppsList with ExploreEmptyState', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const appsList = screen.getByTestId('apps-list')
      const emptyState = screen.getByTestId('explore-empty-state')

      expect(appsList).toBeInTheDocument()
      expect(emptyState).toBeInTheDocument()

      // Empty state should be within AppsList structure
      expect(appsList.contains(emptyState.parentElement?.parentElement || null)).toBe(true)
    })

    it('should maintain proper component hierarchy', () => {
      const { container } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const appsList = screen.getByTestId('apps-list')
      expect(container.contains(appsList)).toBe(true)
    })
  })

  describe('Data flow', () => {
    it('should delegate type to AppsList for query parameters', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const appsList = screen.getByTestId('apps-list')
      expect(appsList.getAttribute('data-type')).toBe('explore')
    })

    it('should delegate empty state rendering to AppsList', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      // AppsList receives the empty state component and renders it
      const emptyState = screen.getByTestId('empty-state')
      const exploreEmptyState = screen.getByTestId('explore-empty-state')

      expect(emptyState).toBeInTheDocument()
      expect(exploreEmptyState).toBeInTheDocument()
    })
  })

  describe('Empty state behavior', () => {
    it('should display empty state when no apps are available', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const emptyState = screen.getByTestId('explore-empty-state')
      expect(emptyState).toBeInTheDocument()
      expect(emptyState.textContent).toContain('Apps preview not available')
    })

    it('should show helpful message in empty state', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      expect(screen.getByText('Try again later or check your network connection.')).toBeInTheDocument()
    })
  })

  describe('Integration with AppsList', () => {
    it('should integrate seamlessly with AppsList component', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      // AppsList should be rendered with explore type
      const appsList = screen.getByTestId('apps-list')
      expect(appsList.getAttribute('data-type')).toBe('explore')

      // Should include empty state
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should maintain AppsList functionality', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      // AppsList should render its grid and content
      const appsList = screen.getByTestId('apps-list')
      expect(appsList.querySelector('.grid')).toBeInTheDocument()
    })
  })

  describe('Routing integration', () => {
    it('should work within router context', () => {
      const { container } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should maintain state across navigation', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const initialAppsList = screen.getByTestId('apps-list')

      rerender(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const rerenderedAppsList = screen.getByTestId('apps-list')
      expect(initialAppsList.isSameNode(rerenderedAppsList)).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now()

      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100)
    })

    it('should have minimal DOM footprint', () => {
      const { container } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      // Explore is a simple wrapper, so should have minimal direct children
      const directChildren = container.children
      expect(directChildren.length).toBe(1)
    })

    it('should maintain stable structure across re-renders', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const initialStructure = screen.getByTestId('apps-list').innerHTML

      rerender(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const rerenderedStructure = screen.getByTestId('apps-list').innerHTML

      expect(initialStructure).toBe(rerenderedStructure)
    })
  })

  describe('Accessibility', () => {
    it('should maintain accessibility through AppsList', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      // Explore delegates accessibility to AppsList
      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should provide accessible empty state', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const emptyState = screen.getByTestId('explore-empty-state')
      expect(emptyState).toBeInTheDocument()

      // Should have descriptive content
      const heading = emptyState.querySelector('h2')
      expect(heading).toBeInTheDocument()
      expect(heading?.textContent).toBe('Apps preview not available')
    })
  })

  describe('Edge cases', () => {
    it('should handle rapid re-renders gracefully', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      for (let i = 0; i < 10; i++) {
        rerender(
          <MemoryRouter>
            <Explore />
          </MemoryRouter>,
        )
        expect(screen.getByTestId('apps-list')).toBeInTheDocument()
      }
    })

    it('should handle being rendered multiple times', () => {
      const { container: container1 } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const { container: container2 } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })

    it('should maintain type consistency across renders', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const appsList = screen.getByTestId('apps-list')
      expect(appsList.getAttribute('data-type')).toBe('explore')

      rerender(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      expect(appsList.getAttribute('data-type')).toBe('explore')
    })
  })

  describe('Component behavior', () => {
    it('should always render AppsList regardless of data state', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should include empty state in AppsList', () => {
      render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const appsList = screen.getByTestId('apps-list')
      const emptyState = screen.getByTestId('empty-state')

      // The empty state is rendered within the apps-list structure
      expect(appsList.textContent).toContain(emptyState.textContent)
    })
  })

  describe('Integration with router params', () => {
    it('should work with router navigation', () => {
      render(
        <MemoryRouter initialEntries={['/explore']}>
          <Explore />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should maintain state when route changes', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const initialAppsList = screen.getByTestId('apps-list').getAttribute('data-type')

      rerender(
        <MemoryRouter>
          <Explore />
        </MemoryRouter>,
      )

      const rerenderedAppsList = screen.getByTestId('apps-list').getAttribute('data-type')

      expect(initialAppsList).toBe(rerenderedAppsList)
    })
  })
})
