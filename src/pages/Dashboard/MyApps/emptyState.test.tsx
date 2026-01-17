import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyAppsEmptyState } from './emptyState'
import { MemoryRouter } from 'react-router-dom'

const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>

describe('MyAppsEmptyState Component', () => {
  describe('rendering', () => {
    it('should render title', () => {
      render(<MyAppsEmptyState />, { wrapper })

      expect(screen.getByText('Create your first app')).toBeInTheDocument()
    })

    it('should render description', () => {
      render(<MyAppsEmptyState />, { wrapper })

      expect(
        screen.getByText('Use one of our templates to create your first application running in Oasis ROFL.'),
      ).toBeInTheDocument()
    })

    it('should render Create button', () => {
      render(<MyAppsEmptyState />, { wrapper })

      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('should render Plus icon', () => {
      const { container } = render(<MyAppsEmptyState />, { wrapper })

      const icon = container.querySelector('.h-4.w-4')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should have link to create page', () => {
      render(<MyAppsEmptyState />, { wrapper })

      const link = screen.getByText('Create').closest('a')
      expect(link).toHaveAttribute('href', '/create')
    })

    it('should navigate when clicking Create button', () => {
      render(<MyAppsEmptyState />, { wrapper })

      const link = screen.getByRole('link', { name: /create/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/create')
    })
  })

  describe('structure', () => {
    it('should render within EmptyState component', () => {
      const { container } = render(<MyAppsEmptyState />, { wrapper })

      const card = container.querySelector('.rounded-md')
      expect(card).toBeInTheDocument()
    })
  })

  describe('button composition', () => {
    it('should render button with child content', () => {
      const { container } = render(<MyAppsEmptyState />, { wrapper })

      const buttonText = screen.getByText('Create')
      expect(buttonText).toBeInTheDocument()

      const icon = container.querySelector('.h-4.w-4')
      expect(icon).toBeInTheDocument()
    })

    it('should have proper button structure', () => {
      render(<MyAppsEmptyState />, { wrapper })

      const link = screen.getByText('Create').closest('a')
      expect(link).toContainHTML('svg')
    })
  })

  describe('accessibility', () => {
    it('should have accessible button text', () => {
      render(<MyAppsEmptyState />, { wrapper })

      const button = screen.getByRole('link', { name: /create/i })
      expect(button).toBeInTheDocument()
    })

    it('should have descriptive link text including icon', () => {
      render(<MyAppsEmptyState />, { wrapper })

      const link = screen.getByText('Create')
      expect(link).toBeInTheDocument()
    })
  })

  describe('content verification', () => {
    it('should mention templates in description', () => {
      render(<MyAppsEmptyState />, { wrapper })

      const description = screen.getByText(/templates/i)
      expect(description).toBeInTheDocument()
    })

    it('should mention Oasis ROFL in description', () => {
      render(<MyAppsEmptyState />, { wrapper })

      const description = screen.getByText(/Oasis ROFL/i)
      expect(description).toBeInTheDocument()
    })

    it('should have action-oriented title', () => {
      const { container } = render(<MyAppsEmptyState />, { wrapper })

      const title = container.querySelector('.text-xl.font-semibold')
      expect(title).toHaveTextContent('Create your first app')
    })
  })

  describe('integration', () => {
    it('should render as standalone component', () => {
      const { container } = render(<MyAppsEmptyState />, { wrapper })

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render within parent container', () => {
      const { container } = render(
        <div className="parent">
          <MyAppsEmptyState />
        </div>,
        { wrapper },
      )

      const parent = container.querySelector('.parent')
      expect(parent).toContainElement(screen.getByText('Create your first app'))
    })
  })
})
