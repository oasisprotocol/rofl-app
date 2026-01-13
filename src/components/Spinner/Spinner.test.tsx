import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Spinner } from './index'

describe('Spinner Component', () => {
  describe('Basic Rendering', () => {
    it('should render spinner with animation class', () => {
      const { container } = render(<Spinner />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should render without className when not provided', () => {
      const { container } = render(<Spinner />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should render Loader2 icon component', () => {
      const { container } = render(<Spinner />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner.tagName).toBe('svg')
      expect(spinner).toHaveClass('animate-spin')
    })
  })

  describe('Props and Variations', () => {
    it('should apply custom className', () => {
      const { container } = render(<Spinner className="custom-class" />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toHaveClass('custom-class')
    })

    it('should preserve animate-spin class with custom className', () => {
      const { container } = render(<Spinner className="custom-class another-class" />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toHaveClass('animate-spin')
      expect(spinner).toHaveClass('custom-class')
      expect(spinner).toHaveClass('another-class')
    })

    it('should apply single custom class', () => {
      const { container } = render(<Spinner className="w-8" />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('w-8')
    })

    it('should apply multiple custom classes', () => {
      const { container } = render(<Spinner className="w-8 h-8 text-blue-500" />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('w-8')
      expect(spinner).toHaveClass('h-8')
      expect(spinner).toHaveClass('text-blue-500')
    })

    it('should handle size classes', () => {
      const { container } = render(<Spinner className="w-4 h-4" />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('w-4')
      expect(spinner).toHaveClass('h-4')
    })

    it('should handle color classes', () => {
      const { container } = render(<Spinner className="text-red-500" />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('text-red-500')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string className', () => {
      const { container } = render(<Spinner className="" />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should handle className with spaces', () => {
      const { container } = render(<Spinner className="  w-8  h-8  " />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('w-8')
      expect(spinner).toHaveClass('h-8')
    })

    it('should handle very long className string', () => {
      const longClassName = 'class1 class2 class3 class4 class5 class6 class7 class8 class9 class10'
      const { container } = render(<Spinner className={longClassName} />)
      const spinner = container.firstChild as HTMLElement
      longClassName.split(' ').forEach(cls => {
        expect(spinner).toHaveClass(cls)
      })
    })
  })

  describe('Styling', () => {
    it('should have animate-spin class by default', () => {
      const { container } = render(<Spinner />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should not have additional classes when not provided', () => {
      const { container } = render(<Spinner />)
      const spinner = container.firstChild as SVGElement
      // SVG className is an SVGAnimatedString, use getAttribute instead
      // Loader2 from lucide-react has its own classes (lucide, lucide-loader-circle)
      const className = spinner.getAttribute('class')
      expect(className).toContain('animate-spin')
      expect(className).toContain('lucide')
    })

    it('should allow Tailwind utility classes', () => {
      const { container } = render(<Spinner className="w-12 h-12 text-primary animate-spin-slow" />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('w-12')
      expect(spinner).toHaveClass('h-12')
      expect(spinner).toHaveClass('text-primary')
      expect(spinner).toHaveClass('animate-spin-slow')
    })
  })

  describe('Component Structure', () => {
    it('should render as SVG element', () => {
      const { container } = render(<Spinner />)
      const spinner = container.firstChild as HTMLElement
      expect(spinner.tagName.toLowerCase()).toBe('svg')
    })

    it('should pass through all className props to SVG', () => {
      const { container } = render(<Spinner className="test-class" />)
      const spinner = container.firstChild as SVGElement
      // SVG className is an SVGAnimatedString, use getAttribute instead
      const className = spinner.getAttribute('class')
      expect(className).toContain('animate-spin')
      expect(className).toContain('test-class')
    })
  })
})
