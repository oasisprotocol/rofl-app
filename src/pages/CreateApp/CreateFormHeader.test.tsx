import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreateFormHeader } from './CreateFormHeader'

describe('CreateFormHeader', () => {
  it('renders title correctly', () => {
    render(<CreateFormHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders title with correct styling', () => {
    render(<CreateFormHeader title="Test Title" />)
    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('text-2xl', 'font-white', 'font-bold', 'mb-2')
  })

  it('does not render description when not provided', () => {
    render(<CreateFormHeader title="Test Title" />)
    const description = document.querySelector('p.text-muted-foreground')
    expect(description).not.toBeInTheDocument()
  })

  it('renders description when provided as string', () => {
    render(<CreateFormHeader title="Test Title" description="Test Description" />)
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders description with correct styling', () => {
    render(<CreateFormHeader title="Test Title" description="Test Description" />)
    const description = screen.getByText('Test Description')
    expect(description).toHaveClass('text-muted-foreground', 'text-sm')
  })

  it('renders description when provided as ReactNode', () => {
    const description = (
      <>
        <span>Line 1</span>
        <span>Line 2</span>
      </>
    )
    render(<CreateFormHeader title="Test Title" description={description} />)
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
  })

  it('renders complex description with markup', () => {
    const description = (
      <>
        <span>First paragraph </span>
        <span>
          Second paragraph with <strong>bold text</strong>
        </span>
      </>
    )
    render(<CreateFormHeader title="Test Title" description={description} />)
    expect(screen.getByText('First paragraph')).toBeInTheDocument()
    // Use a more flexible text matcher for text broken by elements
    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === 'Second paragraph with bold text'
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('bold text')).toBeInTheDocument()
  })

  it('wraps content in proper container', () => {
    render(<CreateFormHeader title="Test Title" />)
    const wrapper = document.querySelector('.w-full')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders title and description together', () => {
    render(<CreateFormHeader title="My Title" description="My Description" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('My Description')).toBeInTheDocument()
  })

  it('handles empty title gracefully', () => {
    const { container } = render(<CreateFormHeader title="" />)
    const title = container.querySelector('h1')
    expect(title).toBeInTheDocument()
    expect(title?.textContent).toBe('')
  })

  it('handles special characters in title', () => {
    render(<CreateFormHeader title="Title with <special> & characters" />)
    expect(screen.getByText('Title with <special> & characters')).toBeInTheDocument()
  })

  it('handles long title text', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines in the UI'
    render(<CreateFormHeader title={longTitle} />)
    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('handles multiline description', () => {
    const multilineDesc = 'Line 1\nLine 2\nLine 3'
    render(<CreateFormHeader title="Title" description={multilineDesc} />)
    // Text content normalizes whitespace, so we check for the text content
    const description = document.querySelector('.text-muted-foreground.text-sm')
    expect(description?.textContent).toBe(multilineDesc)
  })

  it('exports CreateFormHeader component', () => {
    expect(CreateFormHeader).toBeDefined()
    expect(typeof CreateFormHeader).toBe('function')
  })
})
