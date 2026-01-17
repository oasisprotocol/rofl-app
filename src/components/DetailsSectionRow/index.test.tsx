import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DetailsSectionRow } from './index'

describe('DetailsSectionRow', () => {
  it('should render with label and children', () => {
    const { container } = render(<DetailsSectionRow label="Test Label">Test Value</DetailsSectionRow>)

    expect(container.textContent).toContain('Test Label')
    expect(container.textContent).toContain('Test Value')
  })

  it('should render with default grid layout classes', () => {
    const { container } = render(<DetailsSectionRow label="Label">Value</DetailsSectionRow>)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('grid')
    expect(wrapper.className).toContain('grid-cols-1')
    expect(wrapper.className).toContain('md:grid-cols-[minmax(200px,auto)_1fr]')
  })

  it('should render label with text-foreground class', () => {
    const { container } = render(<DetailsSectionRow label="Test Label">Value</DetailsSectionRow>)

    const labelSpan = container.querySelector('span:first-child')
    expect(labelSpan).toHaveClass('text-foreground')
    expect(labelSpan).toHaveClass('text-sm')
  })

  it('should render children with text-muted-foreground class', () => {
    const { container } = render(<DetailsSectionRow label="Label">Test Value</DetailsSectionRow>)

    const valueSpan = container.querySelector('span:last-child')
    expect(valueSpan).toHaveClass('text-muted-foreground')
    expect(valueSpan).toHaveClass('text-sm')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <DetailsSectionRow label="Label" className="custom-class">
        Value
      </DetailsSectionRow>,
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })

  it('should render complex children content', () => {
    const { container } = render(
      <DetailsSectionRow label="Status">
        <span className="text-green-500">Active</span>
      </DetailsSectionRow>,
    )

    expect(container.textContent).toContain('Status')
    expect(container.textContent).toContain('Active')
    expect(container.querySelector('.text-green-500')).toBeInTheDocument()
  })

  it('should render numeric children', () => {
    const { container } = render(<DetailsSectionRow label="Amount">42.5</DetailsSectionRow>)

    expect(container.textContent).toContain('Amount')
    expect(container.textContent).toContain('42.5')
  })

  it('should render React nodes as children', () => {
    const { container } = render(
      <DetailsSectionRow label="Items">
        <>
          <span>Item 1</span>
          <span>Item 2</span>
        </>
      </DetailsSectionRow>,
    )

    expect(container.textContent).toContain('Items')
    expect(container.textContent).toContain('Item 1')
    expect(container.textContent).toContain('Item 2')
  })

  it('should render empty string as value', () => {
    const { container } = render(<DetailsSectionRow label="Label">{''}</DetailsSectionRow>)

    expect(container.textContent).toContain('Label')
    const valueSpan = container.querySelector('span:last-child')
    expect(valueSpan).toHaveTextContent('')
  })

  it('should render null as value without errors', () => {
    const { container } = render(<DetailsSectionRow label="Label">{null}</DetailsSectionRow>)

    expect(container.textContent).toContain('Label')
  })

  it('should render undefined as value without errors', () => {
    const { container } = render(<DetailsSectionRow label="Label">{undefined}</DetailsSectionRow>)

    expect(container.textContent).toContain('Label')
  })
})
