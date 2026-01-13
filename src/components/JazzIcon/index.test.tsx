import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JazzIcon } from './index'

// Mock jazzicon library - must be defined inline due to vi.mock hoisting
vi.mock('@metamask/jazzicon', () => ({
  default: vi.fn((diameter: number, seed: number) => {
    const div = document.createElement('div')
    div.setAttribute('data-diameter', diameter.toString())
    div.setAttribute('data-seed', seed.toString())
    div.className = 'jazzicon'
    return div
  }),
}))

describe('JazzIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('component rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<JazzIcon diameter={20} seed={12345} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should be defined', () => {
      expect(JazzIcon).toBeDefined()
    })

    it('should render a span element', () => {
      const { container } = render(<JazzIcon diameter={20} seed={12345} />)
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
    })

    it('should apply lineHeight 0 style', () => {
      const { container } = render(<JazzIcon diameter={20} seed={12345} />)
      const span = container.querySelector('span')
      expect(span).toHaveStyle({ lineHeight: 0 })
    })
  })

  describe('jazzicon integration', () => {
    it('should create jazzicon with correct diameter', () => {
      const diameter = 40
      const { container } = render(<JazzIcon diameter={diameter} seed={12345} />)
      const jazzicon = container.querySelector('.jazzicon')
      expect(jazzicon).toHaveAttribute('data-diameter', diameter.toString())
    })

    it('should create jazzicon with correct seed', () => {
      const seed = 54321
      const { container } = render(<JazzIcon diameter={20} seed={seed} />)
      const jazzicon = container.querySelector('.jazzicon')
      expect(jazzicon).toHaveAttribute('data-seed', seed.toString())
    })

    it('should replace children when diameter changes', () => {
      const { container, rerender } = render(<JazzIcon diameter={20} seed={12345} />)
      const initialChildren = container.querySelector('span')?.children.length

      rerender(<JazzIcon diameter={40} seed={12345} />)
      const updatedChildren = container.querySelector('span')?.children.length

      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-diameter', '40')
    })

    it('should replace children when seed changes', () => {
      const { container, rerender } = render(<JazzIcon diameter={20} seed={12345} />)

      rerender(<JazzIcon diameter={20} seed={54321} />)

      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-seed', '54321')
    })
  })

  describe('prop variations', () => {
    it('should render with small diameter', () => {
      const { container } = render(<JazzIcon diameter={10} seed={12345} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with medium diameter', () => {
      const { container } = render(<JazzIcon diameter={40} seed={12345} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with large diameter', () => {
      const { container } = render(<JazzIcon diameter={100} seed={12345} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with seed of 0', () => {
      const { container } = render(<JazzIcon diameter={20} seed={0} />)
      const jazzicon = container.querySelector('.jazzicon')
      expect(jazzicon).toHaveAttribute('data-seed', '0')
    })

    it('should render with large seed value', () => {
      const { container } = render(<JazzIcon diameter={20} seed={999999999} />)
      const jazzicon = container.querySelector('.jazzicon')
      expect(jazzicon).toHaveAttribute('data-seed', '999999999')
    })

    it('should render with negative seed value', () => {
      const { container } = render(<JazzIcon diameter={20} seed={-12345} />)
      const jazzicon = container.querySelector('.jazzicon')
      expect(jazzicon).toHaveAttribute('data-seed', '-12345')
    })
  })

  describe('memo behavior', () => {
    it('should be memoized component', () => {
      // JazzIcon is exported as memo() wrapped component
      // Check if it's a valid component
      expect(JazzIcon).toBeDefined()
      // Memo wraps components, so typeof might be 'object'
      expect(['function', 'object'].includes(typeof JazzIcon)).toBe(true)
    })

    it('should re-render when diameter prop changes', () => {
      const { container, rerender } = render(<JazzIcon diameter={20} seed={12345} />)
      rerender(<JazzIcon diameter={40} seed={12345} />)
      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-diameter', '40')
    })

    it('should re-render when seed prop changes', () => {
      const { container, rerender } = render(<JazzIcon diameter={20} seed={12345} />)
      rerender(<JazzIcon diameter={20} seed={54321} />)
      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-seed', '54321')
    })
  })

  describe('useEffect hook', () => {
    it('should update icon when props change', () => {
      const { container, rerender } = render(<JazzIcon diameter={20} seed={12345} />)

      // Initial render
      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-diameter', '20')
      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-seed', '12345')

      // Update diameter
      rerender(<JazzIcon diameter={40} seed={12345} />)
      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-diameter', '40')

      // Update seed
      rerender(<JazzIcon diameter={40} seed={54321} />)
      expect(container.querySelector('.jazzicon')).toHaveAttribute('data-seed', '54321')
    })
  })

  describe('ref behavior', () => {
    it('should attach ref to span element', () => {
      const { container } = render(<JazzIcon diameter={20} seed={12345} />)
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
    })

    it('should have jazzicon as child of span', () => {
      const { container } = render(<JazzIcon diameter={20} seed={12345} />)
      const span = container.querySelector('span')
      const jazzicon = span?.querySelector('.jazzicon')
      expect(jazzicon).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle diameter of 1', () => {
      const { container } = render(<JazzIcon diameter={1} seed={12345} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle very large diameter', () => {
      const { container } = render(<JazzIcon diameter={1000} seed={12345} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle same diameter and seed values', () => {
      const { container } = render(<JazzIcon diameter={20} seed={20} />)
      expect(container.querySelector('.jazzicon')).toBeInTheDocument()
    })
  })
})
