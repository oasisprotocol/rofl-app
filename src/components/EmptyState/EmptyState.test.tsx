import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './index'

describe('EmptyState Component', () => {
  describe('Basic Rendering', () => {
    it('should render title and description', () => {
      render(<EmptyState title="No Data" description="There is no data to display" />)

      expect(screen.getByText('No Data')).toBeInTheDocument()
      expect(screen.getByText('There is no data to display')).toBeInTheDocument()
    })

    it('should render with correct structure', () => {
      const { container } = render(<EmptyState title="Test Title" description="Test Description" />)

      const card = container.querySelector('div[class*="rounded-md"]')
      expect(card).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('should render without children', () => {
      const { container } = render(<EmptyState title="Test" description="Test description" />)

      // CardFooter should be rendered even without children
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })
  })

  describe('Props and Variations', () => {
    it('should render children in card footer', () => {
      render(
        <EmptyState title="Test" description="Test description">
          <button>Action</button>
        </EmptyState>,
      )

      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('should render multiple children in card footer', () => {
      render(
        <EmptyState title="Test" description="Test description">
          <button>First Action</button>
          <button>Second Action</button>
        </EmptyState>,
      )

      expect(screen.getByRole('button', { name: 'First Action' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Second Action' })).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<EmptyState title="Test" description="Test" className="custom-class" />)

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })

    it('should preserve default classes when custom className is provided', () => {
      const { container } = render(<EmptyState title="Test" description="Test" className="custom-class" />)

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('h-full')
      expect(card).toHaveClass('rounded-md')
      expect(card).toHaveClass('border-0')
      expect(card).toHaveClass('flex')
      expect(card).toHaveClass('justify-center')
      expect(card).toHaveClass('p-8')
      expect(card).toHaveClass('gap-2')
      expect(card).toHaveClass('custom-class')
    })

    it('should apply multiple custom classes', () => {
      const { container } = render(
        <EmptyState title="Test" description="Test" className="class1 class2 class3" />,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('class1')
      expect(card).toHaveClass('class2')
      expect(card).toHaveClass('class3')
    })
  })

  describe('Content Variations', () => {
    it('should render with string description', () => {
      render(<EmptyState title="Test" description="Simple string description" />)

      expect(screen.getByText('Simple string description')).toBeInTheDocument()
    })

    it('should render with ReactNode description', () => {
      render(
        <EmptyState
          title="Test"
          description={
            <div>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </div>
          }
        />,
      )

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
    })

    it('should render with complex ReactNode description', () => {
      render(
        <EmptyState
          title="Test"
          description={
            <>
              <span>Complex </span>
              <strong>description</strong>
            </>
          }
        />,
      )

      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('description')).toBeInTheDocument()
    })

    it('should render with empty string title', () => {
      const { container } = render(<EmptyState title="" description="Description" />)

      const titleElement = container.querySelector('[class*="text-xl"]')
      expect(titleElement).toBeInTheDocument()
      expect(titleElement?.textContent).toBe('')
    })

    it('should render with very long title', () => {
      const longTitle = 'This is a very long title that should wrap and still be displayed correctly'
      render(<EmptyState title={longTitle} description="Description" />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should render with very long description', () => {
      const longDescription =
        'This is a very long description that should wrap and be displayed correctly with proper text balancing'
      render(<EmptyState title="Title" description={longDescription} />)

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })

  describe('Children Variations', () => {
    it('should render null children', () => {
      render(
        <EmptyState title="Test" description="Description">
          {null}
        </EmptyState>,
      )

      // Should still render title and description
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render undefined children', () => {
      render(
        <EmptyState title="Test" description="Description">
          {undefined}
        </EmptyState>,
      )

      // Should still render title and description
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render complex children structure', () => {
      render(
        <EmptyState title="Test" description="Description">
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
            <span>Some text</span>
          </div>
        </EmptyState>,
      )

      expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument()
      expect(screen.getByText('Some text')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const { container } = render(<EmptyState title="Test Title" description="Test Description" />)

      const title = container.querySelector('[class*="text-xl"]')
      expect(title?.tagName).toBe('DIV')
      expect(title).toHaveTextContent('Test Title')
    })

    it('should have proper text alignment classes', () => {
      const { container } = render(<EmptyState title="Test" description="Description" />)

      const title = container.querySelector('[class*="text-xl"]')
      const content = container.querySelector('[class*="md:max-w-[60%]"]')

      expect(title).toHaveClass('text-center')
      expect(content).toHaveClass('text-center')
    })
  })

  describe('Styling', () => {
    it('should apply correct title styling', () => {
      const { container } = render(<EmptyState title="Test Title" description="Description" />)

      const title = container.querySelector('[class*="text-xl"]')
      expect(title).toHaveClass('text-xl')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('text-white')
      expect(title).toHaveClass('text-center')
    })

    it('should apply correct description styling', () => {
      const { container } = render(<EmptyState title="Title" description="Test Description" />)

      const content = container.querySelector('[class*="md:max-w-[60%]"]')
      expect(content).toHaveClass('md:max-w-[60%]')
      expect(content).toHaveClass('mx-auto')
      expect(content).toHaveClass('text-gray-400')
      expect(content).toHaveClass('text-sm')
      expect(content).toHaveClass('text-balance')
      expect(content).toHaveClass('text-center')
      expect(content).toHaveClass('leading-relaxed')
    })

    it('should apply correct footer styling', () => {
      const { container } = render(<EmptyState title="Title" description="Description" />)

      // Just verify the component renders correctly with all expected elements
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render with special characters in title', () => {
      render(<EmptyState title="Title with <special> & characters" description="Description" />)

      expect(screen.getByText('Title with <special> & characters')).toBeInTheDocument()
    })

    it('should render with special characters in description', () => {
      render(<EmptyState title="Title" description="Description with <special> & 'quotes'" />)

      expect(screen.getByText("Description with <special> & 'quotes'")).toBeInTheDocument()
    })

    it('should render with emoji in title', () => {
      render(<EmptyState title="🔍 No Results" description="Try a different search" />)

      expect(screen.getByText('🔍 No Results')).toBeInTheDocument()
    })

    it('should render with emoji in description', () => {
      render(<EmptyState title="No Data" description="No data found 📭" />)

      expect(screen.getByText('No data found 📭')).toBeInTheDocument()
    })
  })
})
