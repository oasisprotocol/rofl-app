import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { InputFormField } from './index'

// Mock UI library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/input', () => ({
  Input: ({ className, id, placeholder, type, disabled, min, ...props }: any) =>
    React.createElement('input', {
      className,
      id,
      placeholder,
      type,
      disabled,
      min,
      'data-testid': type === 'password' ? 'password-input' : 'text-input',
      ...props,
    }),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/textarea', () => ({
  Textarea: ({ className, id, placeholder, disabled, ...props }: any) =>
    React.createElement('textarea', {
      className,
      id,
      placeholder,
      disabled,
      'data-testid': 'textarea-input',
      ...props,
    }),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/label', () => ({
  Label: ({ children, htmlFor, className, ...props }: any) => {
    const { htmlFor: _htmlFor, ...restProps } = props
    return React.createElement(
      'label',
      {
        htmlFor,
        className,
        ...restProps,
      },
      children,
    )
  },
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, type, asChild, ...props }: any) =>
    React.createElement('button', { onClick, className, type, ...props }, children),
}))

vi.mock('lucide-react', () => ({
  Eye: ({ className }: any) => React.createElement('span', { className, 'data-testid': 'eye-icon' }, '👁️'),
  EyeOff: ({ className }: any) =>
    React.createElement('span', { className, 'data-testid': 'eye-off-icon' }, '🙈'),
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  Controller: ({ render, ...props }: any) => {
    const [value, setValue] = React.useState('')
    const field = {
      name: props.name,
      value,
      onChange: (e: any) => {
        const actualValue = typeof e === 'object' && 'target' in e ? e.target.value : e
        setValue(actualValue)
      },
      onBlur: () => {},
      ref: () => {},
    }
    const fieldState = {
      invalid: false,
      isTouched: false,
      isDirty: false,
      error: undefined,
    }
    return React.createElement(React.Fragment, null, render({ field, fieldState }))
  },
  useForm: () => ({
    control: { _formRef: 'mock-ref' },
    register: () => ({}),
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.()
      return fn({})
    },
    watch: () => '',
    setValue: () => {},
    getValues: () => ({}),
    trigger: () => Promise.resolve(true),
    formState: {
      errors: {},
      isValid: true,
      isDirty: false,
    },
  }),
  useController: () => ({
    field: {
      name: 'test',
      value: '',
      onChange: () => {},
      onBlur: () => {},
      ref: () => {},
    },
    fieldState: {
      invalid: false,
      isTouched: false,
      isDirty: false,
      error: undefined,
    },
  }),
}))

// Mock types
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<any>('react-hook-form')
  return {
    ...actual,
    Controller: ({ render, ...props }: any) => {
      const [value, setValue] = React.useState('')
      const field = {
        name: props.name,
        value,
        onChange: (e: any) => {
          const actualValue = typeof e === 'object' && 'target' in e ? e.target.value : e
          setValue(actualValue)
        },
        onBlur: () => {},
        ref: () => {},
      }
      const fieldState = {
        invalid: false,
        isTouched: false,
        isDirty: false,
        error: undefined,
      }
      return React.createElement(React.Fragment, null, render({ field, fieldState }))
    },
  }
})

// Create a mock control object
const createMockControl = () => ({
  _formRef: 'mock-ref',
  _subjects: {
    values: { next: [] },
    array: { next: [] },
    state: { next: [] },
  },
  _names: {
    array: new Set(),
    mount: new Set(),
    unmount: new Set(),
    values: [],
  },
})

describe('InputFormField', () => {
  const mockControl = createMockControl()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<InputFormField control={mockControl} name="testField" />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render label when provided', () => {
      render(<InputFormField control={mockControl} name="testField" label="Test Label" />)

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should not render label when not provided', () => {
      render(<InputFormField control={mockControl} name="testField" />)

      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })

    it('should render input field by default', () => {
      render(<InputFormField control={mockControl} name="testField" />)

      expect(screen.getByTestId('text-input')).toBeInTheDocument()
    })

    it('should render password input when type is password', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" />)

      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })

    it('should render textarea when type is textarea', () => {
      render(<InputFormField control={mockControl} name="textareaField" type="textarea" />)

      expect(screen.getByTestId('textarea-input')).toBeInTheDocument()
    })

    it('should render placeholder when provided', () => {
      render(<InputFormField control={mockControl} name="testField" placeholder="Enter text" />)

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<InputFormField control={mockControl} name="testField" disabled={true} />)

      expect(screen.getByTestId('text-input')).toBeDisabled()
    })
  })

  describe('Password field', () => {
    it('should show password toggle button when type is password', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" />)

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should not show password toggle button when disabled', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" disabled={true} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should show eye icon initially when password is hidden', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" />)

      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('eye-off-icon')).not.toBeInTheDocument()
    })

    it('should toggle password visibility on button click', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" />)

      const toggleButton = screen.getByRole('button')
      const input = screen.getByTestId('password-input') as HTMLInputElement

      // Initially password type
      expect(input.type).toBe('password')
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()

      // Click to show
      fireEvent.click(toggleButton)
      expect(input.type).toBe('text')
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()

      // Click to hide again
      fireEvent.click(toggleButton)
      expect(input.type).toBe('password')
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    })

    it('should have correct aria-label for toggle button', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" />)

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label', 'Show contents')

      fireEvent.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide contents')
    })
  })

  describe('Accessibility', () => {
    it('should have correct htmlFor attribute on label', () => {
      render(<InputFormField control={mockControl} name="testField" label="Test Label" />)

      const label = screen.getByText('Test Label')
      // Check that the label element exists and is for the testField
      expect(label.tagName).toBe('LABEL')
      expect(label).toBeInTheDocument()
    })

    it('should have matching id on input', () => {
      render(<InputFormField control={mockControl} name="testField" label="Test Label" />)

      const input = screen.getByTestId('text-input')
      expect(input).toHaveAttribute('id', 'testField')
    })
  })

  describe('Input attributes', () => {
    it('should set min attribute for number input', () => {
      render(<InputFormField control={mockControl} name="numberField" type="number" min={0} />)

      const input = screen.getByTestId('text-input')
      expect(input).toHaveAttribute('min', '0')
    })

    it('should set autoComplete to off', () => {
      render(<InputFormField control={mockControl} name="testField" />)

      const input = screen.getByTestId('text-input')
      expect(input).toHaveAttribute('autoComplete', 'off')
    })

    it('should set spellCheck to true for non-password fields', () => {
      render(<InputFormField control={mockControl} name="testField" />)

      const input = screen.getByTestId('text-input')
      expect(input).toHaveAttribute('spellCheck', 'true')
    })

    it('should set spellCheck to false for password fields', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" />)

      const input = screen.getByTestId('password-input')
      expect(input).toHaveAttribute('spellCheck', 'false')
    })
  })

  describe('TypeScript types', () => {
    it('should accept valid type props', () => {
      expect(() => {
        render(<InputFormField control={mockControl} name="testField" type="input" />)
        render(<InputFormField control={mockControl} name="testField" type="password" />)
        render(<InputFormField control={mockControl} name="testField" type="number" />)
        render(<InputFormField control={mockControl} name="testField" type="textarea" />)
      }).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty label gracefully', () => {
      render(<InputFormField control={mockControl} name="testField" label="" />)

      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })

    it('should handle undefined placeholder', () => {
      render(<InputFormField control={mockControl} name="testField" />)

      const input = screen.getByTestId('text-input')
      expect(input).not.toHaveAttribute('placeholder')
    })

    it('should handle number type without min prop', () => {
      render(<InputFormField control={mockControl} name="numberField" type="number" />)

      const input = screen.getByTestId('text-input')
      expect(input).not.toHaveAttribute('min')
    })

    it('should handle password type with disabled state', () => {
      render(<InputFormField control={mockControl} name="passwordField" type="password" disabled={true} />)

      expect(screen.getByTestId('password-input')).toBeDisabled()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
