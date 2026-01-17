import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { JazzIcon } from './index'

// Mock the jazzicon library
vi.mock('@metamask/jazzicon', () => ({
  default: vi.fn((diameter, seed) => {
    const element = document.createElement('div')
    element.setAttribute('data-diameter', String(diameter))
    element.setAttribute('data-seed', String(seed))
    return element
  }),
}))

describe('JazzIcon', () => {
  it('renders with correct diameter and seed', () => {
    const { container } = render(<JazzIcon diameter={32} seed={12345} />)

    const icon = container.querySelector('[data-diameter="32"]')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-seed', '12345')
  })

  it('renders with diameter 16', () => {
    const { container } = render(<JazzIcon diameter={16} seed={54321} />)

    const icon = container.querySelector('[data-diameter="16"]')
    expect(icon).toBeInTheDocument()
  })

  it('renders with diameter 64', () => {
    const { container } = render(<JazzIcon diameter={64} seed={99999} />)

    const icon = container.querySelector('[data-diameter="64"]')
    expect(icon).toBeInTheDocument()
  })

  it('renders with seed 0', () => {
    const { container } = render(<JazzIcon diameter={32} seed={0} />)

    const icon = container.querySelector('[data-seed="0"]')
    expect(icon).toBeInTheDocument()
  })

  it('updates when diameter changes', () => {
    const { rerender, container } = render(<JazzIcon diameter={32} seed={12345} />)

    expect(container.querySelector('[data-diameter="32"]')).toBeInTheDocument()

    rerender(<JazzIcon diameter={48} seed={12345} />)

    expect(container.querySelector('[data-diameter="48"]')).toBeInTheDocument()
  })

  it('updates when seed changes', () => {
    const { rerender, container } = render(<JazzIcon diameter={32} seed={12345} />)

    expect(container.querySelector('[data-seed="12345"]')).toBeInTheDocument()

    rerender(<JazzIcon diameter={32} seed={67890} />)

    expect(container.querySelector('[data-seed="67890"]')).toBeInTheDocument()
  })
})
