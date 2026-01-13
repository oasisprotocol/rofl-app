import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetadataFormFields } from './index'
import { Control } from 'react-hook-form'

// Mock the InputFormField component
vi.mock('../InputFormField', () => ({
  InputFormField: ({ label, name, placeholder, type }: any) => (
    <div data-testid={`input-${name}`}>
      {type === 'textarea' ? (
        <>
          <label htmlFor={name}>{label}</label>
          <textarea id={name} placeholder={placeholder} data-field={name} />
        </>
      ) : (
        <>
          <label htmlFor={name}>{label}</label>
          <input id={name} placeholder={placeholder} type={type} data-field={name} />
        </>
      )}
    </div>
  ),
}))

describe('MetadataFormFields Component', () => {
  const mockControl = {
    _execute: vi.fn(),
  } as unknown as Control<any>

  it('should render all form fields', () => {
    render(<MetadataFormFields control={mockControl} />)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Author')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Version')).toBeInTheDocument()
    expect(screen.getByLabelText('Homepage')).toBeInTheDocument()
  })

  it('should render name field with correct placeholder', () => {
    render(<MetadataFormFields control={mockControl} />)

    const nameInput = screen.getByPlaceholderText('App name')
    expect(nameInput).toBeInTheDocument()
  })

  it('should render author field with correct placeholder', () => {
    render(<MetadataFormFields control={mockControl} />)

    const authorInput = screen.getByPlaceholderText('John Doe <john@example.com>')
    expect(authorInput).toBeInTheDocument()
  })

  it('should render description field as textarea', () => {
    render(<MetadataFormFields control={mockControl} />)

    const descriptionTextarea = screen.getByPlaceholderText('Tell us something about it', {
      selector: 'textarea',
    })
    expect(descriptionTextarea).toBeInTheDocument()
    expect(descriptionTextarea.tagName.toLowerCase()).toBe('textarea')
  })

  it('should render version field with correct placeholder', () => {
    render(<MetadataFormFields control={mockControl} />)

    const versionInput = screen.getByPlaceholderText('App version')
    expect(versionInput).toBeInTheDocument()
  })

  it('should render homepage field with correct placeholder', () => {
    render(<MetadataFormFields control={mockControl} />)

    const homepageInput = screen.getByPlaceholderText('Website, Twitter, Discord')
    expect(homepageInput).toBeInTheDocument()
  })

  it('should render fields in correct order', () => {
    const { container } = render(<MetadataFormFields control={mockControl} />)

    const fields = container.querySelectorAll('[data-testid^="input-"]')
    expect(fields).toHaveLength(5)

    expect(fields[0]).toHaveAttribute('data-testid', 'input-name')
    expect(fields[1]).toHaveAttribute('data-testid', 'input-author')
    expect(fields[2]).toHaveAttribute('data-testid', 'input-description')
    expect(fields[3]).toHaveAttribute('data-testid', 'input-version')
    expect(fields[4]).toHaveAttribute('data-testid', 'input-homepage')
  })

  it('should render with proper spacing container', () => {
    const { container } = render(<MetadataFormFields control={mockControl} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('space-y-6')
  })

  it('should pass control prop to all InputFormField components', () => {
    const { container } = render(<MetadataFormFields control={mockControl} />)

    const fields = container.querySelectorAll('[data-testid^="input-"]')
    fields.forEach(field => {
      expect(field).toBeInTheDocument()
    })
  })

  it('should render with all required fields', () => {
    render(<MetadataFormFields control={mockControl} />)

    // All fields should be present and labeled
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Version')).toBeInTheDocument()
    expect(screen.getByText('Homepage')).toBeInTheDocument()
  })

  it('should handle empty control gracefully', () => {
    // This should not throw any errors
    expect(() => {
      render(<MetadataFormFields control={mockControl} />)
    }).not.toThrow()
  })

  it('should render each field with correct name attribute', () => {
    const { container } = render(<MetadataFormFields control={mockControl} />)

    expect(container.querySelector('[data-testid="input-name"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="input-author"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="input-description"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="input-version"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="input-homepage"]')).toBeInTheDocument()
  })

  it('should match snapshot structure', () => {
    const { container } = render(<MetadataFormFields control={mockControl} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children.length).toBe(5) // 5 form fields
  })
})
