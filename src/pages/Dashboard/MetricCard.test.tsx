import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from './MetricCard'

describe('MetricCard Component', () => {
  describe('rendering', () => {
    it('should render title and value', () => {
      render(<MetricCard title="Test Metric" value={42} />)

      expect(screen.getByText('Test Metric')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should render value as string', () => {
      render(<MetricCard title="Test Metric" value="custom" />)

      expect(screen.getByText('custom')).toBeInTheDocument()
    })

    it('should render value as number', () => {
      render(<MetricCard title="Test Metric" value={100} />)

      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render 0 when value is undefined', () => {
      render(<MetricCard title="Test Metric" value={undefined} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should render with clipped count indicator when isTotalCountClipped is true', () => {
      render(<MetricCard title="Test Metric" value={100} isTotalCountClipped={true} />)

      expect(screen.getByText('> 100')).toBeInTheDocument()
    })

    it('should not render clipped count indicator when isTotalCountClipped is false', () => {
      render(<MetricCard title="Test Metric" value={100} isTotalCountClipped={false} />)

      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.queryByText('> 100')).not.toBeInTheDocument()
    })

    it('should not render clipped count indicator when isTotalCountClipped is undefined', () => {
      render(<MetricCard title="Test Metric" value={100} />)

      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.queryByText('> 100')).not.toBeInTheDocument()
    })
  })

  describe('structure and styling', () => {
    it('should render with Card wrapper', () => {
      const { container } = render(<MetricCard title="Test" value={1} />)

      const card = container.querySelector('.rounded-md')
      expect(card).toBeInTheDocument()
    })

    it('should render with CardContent', () => {
      const { container } = render(<MetricCard title="Test" value={1} />)

      const cardContent = container.querySelector('.p-6')
      expect(cardContent).toBeInTheDocument()
    })

    it('should render value with large font size', () => {
      const { container } = render(<MetricCard title="Test" value={999} />)

      const valueElement = container.querySelector('.text-5xl')
      expect(valueElement).toBeInTheDocument()
    })

    it('should render value with bold font', () => {
      const { container } = render(<MetricCard title="Test" value={999} />)

      const valueElement = container.querySelector('.font-bold')
      expect(valueElement).toBeInTheDocument()
    })

    it('should render title with muted text color', () => {
      const { container } = render(<MetricCard title="Test Title" value={1} />)

      const titleElement = container.querySelector('.text-muted-foreground')
      expect(titleElement).toBeInTheDocument()
    })

    it('should render title with small font size', () => {
      const { container } = render(<MetricCard title="Test Title" value={1} />)

      const titleElement = container.querySelector('.text-sm')
      expect(titleElement).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle zero value', () => {
      render(<MetricCard title="Zero Metric" value={0} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle negative value', () => {
      render(<MetricCard title="Negative Metric" value={-5} />)

      expect(screen.getByText('-5')).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      render(<MetricCard title="Large Metric" value={999999} />)

      expect(screen.getByText('999999')).toBeInTheDocument()
    })

    it('should handle clipped count with zero value', () => {
      render(<MetricCard title="Test" value={0} isTotalCountClipped={true} />)

      expect(screen.getByText('> 0')).toBeInTheDocument()
    })

    it('should handle clipped count with undefined value', () => {
      render(<MetricCard title="Test" value={undefined} isTotalCountClipped={true} />)

      expect(screen.getByText('> 0')).toBeInTheDocument()
    })

    it('should handle empty string title', () => {
      const { container } = render(<MetricCard title="" value={1} />)

      const titleElement = container.querySelector('.text-muted-foreground')
      expect(titleElement).toBeInTheDocument()
      expect(titleElement).toHaveTextContent('')
    })

    it('should handle very long title', () => {
      const longTitle = 'This is a very long metric title that should still render correctly'
      render(<MetricCard title={longTitle} value={1} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })
  })

  describe('combinations', () => {
    it('should render multiple MetricCards with different values', () => {
      const { container } = render(
        <>
          <MetricCard title="Apps" value={5} />
          <MetricCard title="Machines" value={10} />
          <MetricCard title="Users" value={100} />
        </>,
      )

      expect(screen.getByText('Apps')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Machines')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()

      const cards = container.querySelectorAll('.rounded-md')
      expect(cards.length).toBe(3)
    })
  })
})
