import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Spinner } from './index'

describe('Spinner Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should have animate-spin class', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should render with default classes', () => {
    const { container } = render(<Spinner />)
    const spinner = container.firstChild as HTMLElement
    expect(spinner).toHaveClass('animate-spin')
  })

  it('should accept custom className', () => {
    const { container } = render(<Spinner className="custom-class" />)
    const spinner = container.firstChild as HTMLElement
    expect(spinner).toHaveClass('custom-class')
    expect(spinner).toHaveClass('animate-spin')
  })

  it('should accept multiple custom classes', () => {
    const { container } = render(<Spinner className="class1 class2 class3" />)
    const spinner = container.firstChild as HTMLElement
    expect(spinner).toHaveClass('class1')
    expect(spinner).toHaveClass('class2')
    expect(spinner).toHaveClass('class3')
    expect(spinner).toHaveClass('animate-spin')
  })

  it('should render without custom className', () => {
    const { container } = render(<Spinner />)
    const spinner = container.firstChild as HTMLElement
    expect(spinner).toHaveClass('animate-spin')
  })

  it('should export Spinner component', () => {
    expect(Spinner).toBeDefined()
    expect(typeof Spinner).toBe('function')
  })

  it('should render SVG element', () => {
    const { container } = render(<Spinner />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
