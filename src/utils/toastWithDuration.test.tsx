import { describe, it, expect, vi } from 'vitest'
import { toastWithDuration } from './toastWithDuration'
import { toast } from 'sonner'
import { render } from '@testing-library/react'
import React from 'react'

vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

describe('toastWithDuration', () => {
  it('should be a function', () => {
    expect(typeof toastWithDuration).toBe('function')
  })

  it('should call toast with message and duration', () => {
    toastWithDuration('test message', 1000)
    expect(toast).toHaveBeenCalledWith(expect.anything(), { duration: 1000 })
  })

  it('should call toast with custom element containing message', () => {
    toastWithDuration('custom message', 2000)
    expect(toast).toHaveBeenCalled()
    const call = vi.mocked(toast).mock.calls[0]
    const element = call[0]

    // Check that the element is a React element with the message
    expect(element).toBeDefined()
    expect(typeof element).toBe('object')
  })

  it('should render the message text in the component', () => {
    toastWithDuration('test message', 1000)
    const call = vi.mocked(toast).mock.calls[0]
    const element = call[0] as React.ReactElement

    const { container } = render(element)
    expect(container.textContent).toContain('test message')
  })

  it('should set CSS variable for animation duration', () => {
    toastWithDuration('test', 9000)
    expect(toast).toHaveBeenCalled()
    const call = vi.mocked(toast).mock.calls[vi.mocked(toast).mock.calls.length - 1]
    const element = call[0] as React.ReactElement

    const { container } = render(element)
    const div = container.firstChild as HTMLElement
    expect(div.style.getPropertyValue('--animate-dashoffset-duration')).toBe('9000ms')
  })

  it('should render SVG progress bar', () => {
    toastWithDuration('test', 8000)
    const call = vi.mocked(toast).mock.calls[vi.mocked(toast).mock.calls.length - 1]
    const element = call[0] as React.ReactElement

    const { container } = render(element)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 4')

    const line = svg?.querySelector('line')
    expect(line).toBeInTheDocument()
    expect(line?.getAttribute('x1')).toBe('1')
    expect(line?.getAttribute('y1')).toBe('2')
    expect(line?.getAttribute('x2')).toBe('99')
    expect(line?.getAttribute('y2')).toBe('2')
    // Note: strokeLinecap is kebab-case in the source but may be camelCase in the DOM
    expect(line?.getAttribute('stroke-linecap') || line?.getAttribute('strokeLinecap')).toBeTruthy()
  })

  it('should be callable with different messages', () => {
    expect(() => toastWithDuration('test', 1000)).not.toThrow()
    expect(() => toastWithDuration('another message', 5000)).not.toThrow()
    expect(() => toastWithDuration('', 1000)).not.toThrow()
  })

  it('should be callable with different durations', () => {
    expect(() => toastWithDuration('test', 100)).not.toThrow()
    expect(() => toastWithDuration('test', 10000)).not.toThrow()
    expect(() => toastWithDuration('test', 0)).not.toThrow()
  })

  it('should handle special characters in message', () => {
    expect(() => toastWithDuration('test with <special> & "characters"', 1000)).not.toThrow()
    toastWithDuration('test with emoji 🎉', 1000)
    const call = vi.mocked(toast).mock.calls[vi.mocked(toast).mock.calls.length - 1]
    const element = call[0] as React.ReactElement
    const { container } = render(element)
    expect(container.textContent).toContain('test with emoji 🎉')
  })

  it('should handle very long messages', () => {
    const longMessage = 'a'.repeat(1000)
    expect(() => toastWithDuration(longMessage, 1000)).not.toThrow()
  })

  it('should create element with correct CSS classes', () => {
    toastWithDuration('test', 7000)
    const call = vi.mocked(toast).mock.calls[vi.mocked(toast).mock.calls.length - 1]
    const element = call[0] as React.ReactElement

    const { container } = render(element)
    const svg = container.querySelector('svg')
    expect(svg?.classList.contains('absolute')).toBe(true)
    expect(svg?.classList.contains('left-0')).toBe(true)
    expect(svg?.classList.contains('w-full')).toBe(true)
    expect(svg?.classList.contains('h-6')).toBe(true)

    const line = svg?.querySelector('line')
    expect(line?.classList.contains('stroke-current')).toBe(true)
    expect(line?.classList.contains('text-muted')).toBe(true)
    expect(line?.classList.contains('animate-dashoffset-reverse')).toBe(true)
  })
})
