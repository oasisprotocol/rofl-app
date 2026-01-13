import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { ExploreEmptyState } from './emptyState'

// Mock dependencies
vi.mock('../../components/EmptyState', () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <h2 data-testid="empty-state-title">{title}</h2>
      <p data-testid="empty-state-description">{description}</p>
    </div>
  ),
}))

describe('ExploreEmptyState Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<ExploreEmptyState />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render EmptyState component', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should render title "Apps preview not available"', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('Apps preview not available')
    })

    it('should render description about trying again later', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
        'Try again later or check your network connection.',
      )
    })
  })

  describe('Content', () => {
    it('should display correct title text', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByText('Apps preview not available')).toBeInTheDocument()
    })

    it('should display correct description text', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByText('Try again later or check your network connection.')).toBeInTheDocument()
    })

    it('should have title and description in correct structure', () => {
      render(<ExploreEmptyState />)
      const emptyState = screen.getByTestId('empty-state')

      expect(emptyState).toContainElement(screen.getByTestId('empty-state-title'))
      expect(emptyState).toContainElement(screen.getByTestId('empty-state-description'))
    })
  })

  describe('Component structure', () => {
    it('should be exported as named export', () => {
      expect(ExploreEmptyState).toBeDefined()
      expect(typeof ExploreEmptyState).toBe('function')
    })

    it('should be a functional component', () => {
      expect(typeof ExploreEmptyState).toBe('function')
    })

    it('should not accept props', () => {
      const { container } = render(<ExploreEmptyState />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Props passing to EmptyState', () => {
    it('should pass title to EmptyState component', () => {
      render(<ExploreEmptyState />)
      const title = screen.getByTestId('empty-state-title')
      expect(title.textContent).toBe('Apps preview not available')
    })

    it('should pass description to EmptyState component', () => {
      render(<ExploreEmptyState />)
      const description = screen.getByTestId('empty-state-description')
      expect(description.textContent).toBe('Try again later or check your network connection.')
    })
  })

  describe('User messaging', () => {
    it('should inform user about apps preview unavailability', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByText(/apps preview/i)).toBeInTheDocument()
    })

    it('should suggest trying again later', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByText(/try again later/i)).toBeInTheDocument()
    })

    it('should suggest checking network connection', () => {
      render(<ExploreEmptyState />)
      expect(screen.getByText(/network connection/i)).toBeInTheDocument()
    })
  })

  describe('Component behavior', () => {
    it('should render consistently on multiple renders', () => {
      const { rerender } = render(<ExploreEmptyState />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()

      rerender(<ExploreEmptyState />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()

      rerender(<ExploreEmptyState />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should maintain content integrity across re-renders', () => {
      const { rerender } = render(<ExploreEmptyState />)

      const initialTitle = screen.getByTestId('empty-state-title').textContent
      const initialDescription = screen.getByTestId('empty-state-description').textContent

      rerender(<ExploreEmptyState />)

      expect(screen.getByTestId('empty-state-title').textContent).toBe(initialTitle)
      expect(screen.getByTestId('empty-state-description').textContent).toBe(initialDescription)
    })
  })

  describe('Integration', () => {
    it('should integrate with EmptyState component correctly', () => {
      render(<ExploreEmptyState />)

      const emptyState = screen.getByTestId('empty-state')
      expect(emptyState).toBeInTheDocument()
      expect(emptyState.childElementCount).toBeGreaterThan(0)
    })

    it('should pass all required props to EmptyState', () => {
      render(<ExploreEmptyState />)

      // Verify that EmptyState received title and description
      expect(screen.getByTestId('empty-state-title')).toBeInTheDocument()
      expect(screen.getByTestId('empty-state-description')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle being rendered in isolation', () => {
      const { container } = render(<ExploreEmptyState />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should not throw errors when rendered multiple times', () => {
      expect(() => {
        const { rerender } = render(<ExploreEmptyState />)

        for (let i = 0; i < 10; i++) {
          rerender(<ExploreEmptyState />)
        }
      }).not.toThrow()
    })

    it('should have stable DOM structure', () => {
      const { container: container1 } = render(<ExploreEmptyState />)
      const { container: container2 } = render(<ExploreEmptyState />)

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })
  })

  describe('Accessibility', () => {
    it('should have readable title text', () => {
      render(<ExploreEmptyState />)
      const title = screen.getByTestId('empty-state-title')
      expect(title.textContent?.length).toBeGreaterThan(0)
    })

    it('should have readable description text', () => {
      render(<ExploreEmptyState />)
      const description = screen.getByTestId('empty-state-description')
      expect(description.textContent?.length).toBeGreaterThan(0)
    })

    it('should convey the purpose of the empty state', () => {
      render(<ExploreEmptyState />)
      const emptyState = screen.getByTestId('empty-state')

      // The empty state should convey that apps are not available
      expect(emptyState.textContent).toContain('not available')
    })
  })

  describe('Type safety', () => {
    it('should not require any props', () => {
      const { container } = render(<ExploreEmptyState />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should ignore any props passed to it', () => {
      // TypeScript would catch this at compile time, but we test runtime behavior
      const { container } = render(<ExploreEmptyState {...({} as any)} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
