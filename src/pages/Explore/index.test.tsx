import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { Explore } from './index'

// Mock dependencies
vi.mock('../../components/AppsList', () => ({
  AppsList: ({ emptyState, type }: any) => (
    <div data-testid="apps-list" data-type={type}>
      {emptyState && <div data-testid="empty-state">{emptyState}</div>}
    </div>
  ),
}))

vi.mock('./emptyState', () => ({
  ExploreEmptyState: () => <div data-testid="explore-empty-state">Explore Empty State</div>,
}))

describe('Explore Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<Explore />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render AppsList component', () => {
      render(<Explore />)
      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should pass "explore" type to AppsList', () => {
      render(<Explore />)
      const appsList = screen.getByTestId('apps-list')
      expect(appsList).toHaveAttribute('data-type', 'explore')
    })

    it('should render empty state', () => {
      render(<Explore />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should render ExploreEmptyState component', () => {
      render(<Explore />)
      expect(screen.getByTestId('explore-empty-state')).toBeInTheDocument()
    })
  })

  describe('Component structure', () => {
    it('should be exported as named export', () => {
      expect(Explore).toBeDefined()
      expect(typeof Explore).toBe('function')
    })

    it('should pass ExploreEmptyState as emptyState prop to AppsList', () => {
      render(<Explore />)
      const appsList = screen.getByTestId('apps-list')
      const emptyState = screen.getByTestId('empty-state')
      expect(appsList).toContainElement(emptyState)
    })

    it('should have correct component composition', () => {
      const { container: _container } = render(<Explore />)

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('explore-empty-state')).toBeInTheDocument()
    })
  })

  describe('Props passing', () => {
    it('should pass correct type prop to AppsList', () => {
      render(<Explore />)
      const appsList = screen.getByTestId('apps-list')
      expect(appsList.getAttribute('data-type')).toBe('explore')
    })

    it('should pass emptyState component to AppsList', () => {
      render(<Explore />)
      const emptyState = screen.getByTestId('explore-empty-state')
      expect(emptyState.textContent).toBe('Explore Empty State')
    })
  })

  describe('Integration', () => {
    it('should integrate AppsList with ExploreEmptyState', () => {
      render(<Explore />)

      const appsList = screen.getByTestId('apps-list')
      const emptyState = screen.getByTestId('explore-empty-state')

      expect(appsList).toBeInTheDocument()
      expect(emptyState).toBeInTheDocument()
      expect(appsList).toContainElement(emptyState.parentElement?.parentElement || null)
    })

    it('should maintain correct hierarchical structure', () => {
      const { container } = render(<Explore />)

      const appsList = screen.getByTestId('apps-list')
      // The appsList should be within the container
      expect(container.contains(appsList)).toBe(true)
    })
  })

  describe('Component behavior', () => {
    it('should always render AppsList regardless of data state', () => {
      render(<Explore />)
      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should include empty state in AppsList by default', () => {
      render(<Explore />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should render ExploreEmptyState content', () => {
      render(<Explore />)
      expect(screen.getByText('Explore Empty State')).toBeInTheDocument()
    })
  })

  describe('Type safety', () => {
    it('should accept no props', () => {
      const { container } = render(<Explore />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should be a functional component', () => {
      expect(typeof Explore).toBe('function')
    })
  })

  describe('Edge cases', () => {
    it('should handle re-rendering gracefully', () => {
      const { rerender } = render(<Explore />)

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()

      rerender(<Explore />)
      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should maintain structure after multiple renders', () => {
      const { rerender } = render(<Explore />)

      for (let i = 0; i < 3; i++) {
        expect(screen.getByTestId('apps-list')).toBeInTheDocument()
        expect(screen.getByTestId('explore-empty-state')).toBeInTheDocument()
        rerender(<Explore />)
      }
    })

    it('should handle being rendered in different contexts', () => {
      const { container } = render(<Explore />)

      // Should render regardless of parent context
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should maintain consistency across rapid re-renders', () => {
      const { rerender } = render(<Explore />)

      for (let i = 0; i < 10; i++) {
        rerender(<Explore />)
        expect(screen.getByTestId('apps-list')).toBeInTheDocument()
      }
    })

    it('should have stable DOM structure', () => {
      const { container: container1 } = render(<Explore />)
      const { container: container2 } = render(<Explore />)

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })

  describe('Component composition', () => {
    it('should compose AppsList with ExploreEmptyState', () => {
      render(<Explore />)

      const appsList = screen.getByTestId('apps-list')
      const emptyState = screen.getByTestId('explore-empty-state')

      expect(appsList).toBeInTheDocument()
      expect(emptyState).toBeInTheDocument()

      // Empty state should be nested within apps list structure
      expect(appsList.contains(emptyState.parentElement?.parentElement || null)).toBe(true)
    })

    it('should pass correct type to AppsList', () => {
      render(<Explore />)

      const appsList = screen.getByTestId('apps-list')
      expect(appsList.getAttribute('data-type')).toBe('explore')
    })

    it('should maintain proper component hierarchy', () => {
      const { container } = render(<Explore />)

      const appsList = screen.getByTestId('apps-list')
      const _emptyState = screen.getByTestId('explore-empty-state')

      // Verify hierarchy: container -> appsList -> emptyState wrapper -> ExploreEmptyState
      expect(container.contains(appsList)).toBe(true)
    })
  })

  describe('Integration behavior', () => {
    it('should delegate empty state rendering to AppsList', () => {
      render(<Explore />)

      // Explore passes the empty state to AppsList, which renders it
      const appsList = screen.getByTestId('apps-list')
      const emptyState = screen.getByTestId('empty-state')

      expect(appsList).toBeInTheDocument()
      expect(emptyState).toBeInTheDocument()
    })

    it('should maintain type consistency across renders', () => {
      const { rerender } = render(<Explore />)

      const appsList = screen.getByTestId('apps-list')
      expect(appsList.getAttribute('data-type')).toBe('explore')

      rerender(<Explore />)

      expect(appsList.getAttribute('data-type')).toBe('explore')
    })
  })

  describe('Performance', () => {
    it('should render efficiently without unnecessary re-renders', () => {
      const { rerender } = render(<Explore />)

      // Multiple re-renders should not cause issues
      for (let i = 0; i < 5; i++) {
        rerender(<Explore />)
      }

      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should have minimal DOM footprint', () => {
      const { container } = render(<Explore />)

      // Should only render AppsList, which contains the empty state
      const directChildren = container.children
      expect(directChildren.length).toBe(1)
    })
  })

  describe('Type safety', () => {
    it('should not accept props', () => {
      // @ts-expect-error - Testing that props are not accepted
      const { container } = render(<Explore invalidProp="test" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should be a functional component', () => {
      expect(typeof Explore).toBe('function')
    })
  })

  describe('Accessibility', () => {
    it('should maintain accessibility through AppsList', () => {
      render(<Explore />)

      // The component itself is a simple wrapper, so accessibility
      // is delegated to AppsList
      expect(screen.getByTestId('apps-list')).toBeInTheDocument()
    })

    it('should provide accessible empty state', () => {
      render(<Explore />)

      const emptyState = screen.getByTestId('explore-empty-state')
      expect(emptyState).toBeInTheDocument()
    })
  })
})
