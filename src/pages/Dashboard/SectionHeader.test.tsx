import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeader } from './SectionHeader'
import { MemoryRouter } from 'react-router-dom'

const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>

describe('SectionHeader Component', () => {
  describe('rendering', () => {
    it('should render title', () => {
      render(<SectionHeader title="Apps" to="/dashboard/apps" />, { wrapper })

      expect(screen.getByText('Apps')).toBeInTheDocument()
    })

    it('should render "View all" button', () => {
      render(<SectionHeader title="Apps" to="/dashboard/apps" />, { wrapper })

      expect(screen.getByText('View all')).toBeInTheDocument()
    })

    it('should render ArrowRight icon', () => {
      const { container } = render(<SectionHeader title="Apps" to="/dashboard/apps" />, { wrapper })

      const icon = container.querySelector('.h-4.w-4')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('enabled state', () => {
    it('should render enabled button when disabled is false', () => {
      render(<SectionHeader title="Apps" to="/dashboard/apps" disabled={false} />, { wrapper })

      // When not disabled, Button uses asChild to render as Link (anchor element)
      const link = screen.getByText('View all').closest('a')
      expect(link).toBeInTheDocument()
    })

    it('should render enabled button when disabled is undefined', () => {
      render(<SectionHeader title="Apps" to="/dashboard/apps" />, { wrapper })

      // When not disabled, Button uses asChild to render as Link (anchor element)
      const link = screen.getByText('View all').closest('a')
      expect(link).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('should render disabled button when disabled is true', () => {
      render(<SectionHeader title="Apps" to="/dashboard/apps" disabled={true} />, { wrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not render link when disabled', () => {
      render(<SectionHeader title="Apps" to="/dashboard/apps" disabled={true} />, { wrapper })

      const link = screen.queryByText('View all').closest('a')
      expect(link).toBeNull()
    })

    it('should render button when disabled', () => {
      const { container } = render(<SectionHeader title="Apps" to="/dashboard/apps" disabled={true} />, {
        wrapper,
      })

      const button = container.querySelector('button[disabled]')
      expect(button).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should render link to correct path when enabled', () => {
      render(<SectionHeader title="Machines" to="/dashboard/machines" />, { wrapper })

      const link = screen.getByText('View all').closest('a')
      expect(link).toHaveAttribute('href', '/dashboard/machines')
    })

    it('should render link with different paths', () => {
      const { container: container1 } = render(<SectionHeader title="Apps" to="/dashboard/apps" />, {
        wrapper,
      })

      const link1 = container1.querySelector('a')
      expect(link1).toHaveAttribute('href', '/dashboard/apps')

      const { container: container2 } = render(<SectionHeader title="Templates" to="/templates" />, {
        wrapper,
      })

      const link2 = container2.querySelector('a')
      expect(link2).toHaveAttribute('href', '/templates')
    })

    it('should handle complex paths', () => {
      render(<SectionHeader title="Details" to="/dashboard/apps/app-id-123/details" />, { wrapper })

      const link = screen.getByText('View all').closest('a')
      expect(link).toHaveAttribute('href', '/dashboard/apps/app-id-123/details')
    })
  })

  describe('structure and styling', () => {
    it('should render with flex container', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const flexContainer = container.querySelector('.flex')
      expect(flexContainer).toBeInTheDocument()
    })

    it('should render with border bottom', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const header = container.querySelector('.border-b')
      expect(header).toBeInTheDocument()
    })

    it('should render with padding bottom', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const header = container.querySelector('.pb-4')
      expect(header).toBeInTheDocument()
    })

    it('should render title with semibold font', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const heading = container.querySelector('.font-semibold')
      expect(heading).toBeInTheDocument()
    })

    it('should render title with white color', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const heading = container.querySelector('.text-white')
      expect(heading).toBeInTheDocument()
    })

    it('should render title with large font size', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const heading = container.querySelector('.text-xl')
      expect(heading).toBeInTheDocument()
    })
  })

  describe('button variants', () => {
    it('should render button with outline variant', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      // When not disabled, Button uses asChild to render as Link (anchor element)
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
    })

    it('should render disabled button with outline variant', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" disabled={true} />, { wrapper })

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('layout', () => {
    it('should justify content between', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const header = container.querySelector('.justify-between')
      expect(header).toBeInTheDocument()
    })

    it('should align items to center', () => {
      const { container } = render(<SectionHeader title="Test" to="/test" />, { wrapper })

      const header = container.querySelector('.items-center')
      expect(header).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty title', () => {
      render(<SectionHeader title="" to="/test" />, { wrapper })

      const heading = screen.queryByRole('heading')
      expect(heading).toBeInTheDocument()
    })

    it('should handle very long title', () => {
      const longTitle = 'This is a very long section title that should still render correctly'
      render(<SectionHeader title={longTitle} to="/test" />, { wrapper })

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(<SectionHeader title="Apps & Machines" to="/test" />, { wrapper })

      expect(screen.getByText('Apps & Machines')).toBeInTheDocument()
    })

    it('should handle numeric path segments', () => {
      render(<SectionHeader title="Item 123" to="/items/123" />, { wrapper })

      const link = screen.getByText('View all').closest('a')
      expect(link).toHaveAttribute('href', '/items/123')
    })
  })

  describe('combinations', () => {
    it('should render multiple SectionHeaders', () => {
      const { container } = render(
        <>
          <SectionHeader title="Apps" to="/apps" />
          <SectionHeader title="Machines" to="/machines" disabled={true} />
          <SectionHeader title="Templates" to="/templates" />
        </>,
        { wrapper },
      )

      expect(screen.getByText('Apps')).toBeInTheDocument()
      expect(screen.getByText('Machines')).toBeInTheDocument()
      expect(screen.getByText('Templates')).toBeInTheDocument()

      const links = container.querySelectorAll('a')
      expect(links.length).toBe(2)
    })
  })
})
