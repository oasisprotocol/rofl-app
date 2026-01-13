import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResourcesCpu, ResourcesMemory, ResourcesStorage, MachineResources } from './index'

describe('ResourcesCpu', () => {
  it('returns N/A for falsy value', () => {
    const { container } = render(<ResourcesCpu value={null} />)
    expect(container.textContent).toBe('N/A')
  })

  it('returns N/A for undefined', () => {
    const { container } = render(<ResourcesCpu value={undefined} />)
    expect(container.textContent).toBe('N/A')
  })

  it('returns singular "CPU" for value of 1', () => {
    const { container } = render(<ResourcesCpu value={1} />)
    expect(container.textContent).toBe('1 CPU')
  })

  it('returns plural "CPUs" for value greater than 1', () => {
    const { container } = render(<ResourcesCpu value={4} />)
    expect(container.textContent).toBe('4 CPUs')
  })

  it('handles string numbers', () => {
    const { container } = render(<ResourcesCpu value="8" />)
    expect(container.textContent).toBe('8 CPUs')
  })
})

describe('ResourcesMemory', () => {
  it('returns N/A for falsy value', () => {
    const { container } = render(<ResourcesMemory value={null} />)
    expect(container.textContent).toBe('N/A')
  })

  it('converts MB to GB correctly', () => {
    const { container } = render(<ResourcesMemory value={1024} />)
    expect(container.textContent).toBe('1 GB')
  })

  it('formats decimal values correctly', () => {
    const { container } = render(<ResourcesMemory value={1536} />)
    expect(container.textContent).toBe('1.5 GB')
  })

  it('rounds larger values', () => {
    const { container } = render(<ResourcesMemory value={10240} />)
    expect(container.textContent).toBe('10 GB')
  })
})

describe('ResourcesStorage', () => {
  it('returns N/A for falsy value', () => {
    const { container } = render(<ResourcesStorage value={null} />)
    expect(container.textContent).toBe('N/A')
  })

  it('converts MB to GB correctly', () => {
    const { container } = render(<ResourcesStorage value={1024} />)
    expect(container.textContent).toBe('1 GB Storage')
  })

  it('rounds to whole number', () => {
    const { container } = render(<ResourcesStorage value={2048} />)
    expect(container.textContent).toBe('2 GB Storage')
  })

  it('handles larger values', () => {
    const { container } = render(<ResourcesStorage value={102400} />)
    expect(container.textContent).toBe('100 GB Storage')
  })
})

describe('MachineResources', () => {
  it('renders all resources together', () => {
    const { container } = render(<MachineResources cpus={4} memory={2048} storage={10240} />)

    // Text is split across fragments with commas, check container content
    expect(container.textContent).toContain('4 CPUs')
    expect(container.textContent).toContain('2 GB')
    expect(container.textContent).toContain('10 GB Storage')
  })

  it('handles missing values', () => {
    const { container } = render(<MachineResources />)

    // Should have 3 N/A's with commas
    expect(container.textContent).toContain('N/A')
  })
})
