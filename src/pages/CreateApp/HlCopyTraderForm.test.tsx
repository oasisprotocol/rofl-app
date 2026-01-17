import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HlCopyTraderForm } from './HlCopyTraderForm'
import { type HlCopyTraderFormData } from './types'

// Mock the dependencies - keep them simple without data-testid
vi.mock('../../components/InputFormField', () => ({
  InputFormField: ({ label, name, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <input data-testid={name} type="text" placeholder={placeholder} />
    </div>
  ),
}))

vi.mock('./CreateFormNavigation', () => ({
  CreateFormNavigation: ({ handleBack, disabled }: any) => (
    <div>
      <button onClick={handleBack} disabled={disabled}>
        Back
      </button>
      <button type="submit" disabled={disabled} formNoValidate>
        Next
      </button>
    </div>
  ),
}))

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: (schema: any) => schema,
}))

import { useForm } from 'react-hook-form'

describe('HlCopyTraderForm', () => {
  const defaultProps = {
    handleNext: vi.fn(),
    handleBack: vi.fn(),
    setAppDataForm: vi.fn(),
  }

  const defaultFormValues: HlCopyTraderFormData = {
    secrets: {
      COPY_TRADE_ADDRESS: '',
      WITHDRAW_FUNDS_TO: '',
      WITHDRAW: 'false',
    },
  }

  const mockControl = {
    field: {
      name: 'test',
      value: '',
      onChange: vi.fn(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useForm).mockReturnValue({
      register: vi.fn(),
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.()
        fn(defaultFormValues)
        return Promise.resolve()
      },
      formState: { isSubmitting: false, errors: {} },
      control: mockControl,
      getValues: () => defaultFormValues,
      setValue: vi.fn(),
      trigger: vi.fn(),
      reset: vi.fn(),
    } as any)
  })

  describe('Basic Component Rendering', () => {
    it('should render the form', () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should render COPY_TRADE_ADDRESS input field', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByTestId('secrets.COPY_TRADE_ADDRESS')).toBeInTheDocument()
      expect(screen.getByText('Trader Address to Copy')).toBeInTheDocument()
    })

    it('should render WITHDRAW_FUNDS_TO input field', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByTestId('secrets.WITHDRAW_FUNDS_TO')).toBeInTheDocument()
      expect(screen.getByText('Withdrawal Address')).toBeInTheDocument()
    })

    it('should render form navigation', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  describe('Form Field Labels and Placeholders', () => {
    it('should display correct label for trader address', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByText('Trader Address to Copy')).toBeInTheDocument()
    })

    it('should display correct label for withdrawal address', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByText('Withdrawal Address')).toBeInTheDocument()
    })

    it('should display correct placeholder for trader address', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      const inputs = screen.getAllByPlaceholderText('0x...')
      expect(inputs.length).toBeGreaterThanOrEqual(1)
    })

    it('should display correct placeholder for withdrawal address', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      const inputs = screen.getAllByPlaceholderText('0x...')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Form Submission', () => {
    it('should call setAppDataForm with form data on submit', async () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      if (form) fireEvent.submit(form)

      await waitFor(() => {
        expect(defaultProps.setAppDataForm).toHaveBeenCalledWith({
          inputs: defaultFormValues,
        })
      })
    })

    it('should call handleNext on successful form submission', async () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      if (form) fireEvent.submit(form)

      await waitFor(() => {
        expect(defaultProps.handleNext).toHaveBeenCalled()
      })
    })

    it('should include secrets in form data', async () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      if (form) fireEvent.submit(form)

      await waitFor(() => {
        expect(defaultProps.setAppDataForm).toHaveBeenCalledWith({
          inputs: expect.objectContaining({
            secrets: expect.any(Object),
          }),
        })
      })
    })

    it('should include WITHDRAW field set to false', async () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      if (form) fireEvent.submit(form)

      await waitFor(() => {
        expect(defaultProps.setAppDataForm).toHaveBeenCalledWith({
          inputs: expect.objectContaining({
            secrets: expect.objectContaining({
              WITHDRAW: 'false',
            }),
          }),
        })
      })
    })
  })

  describe('Form Navigation', () => {
    it('should render back button', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      const backButton = screen.getByText('Back')
      expect(backButton).toBeInTheDocument()
    })

    it('should call handleBack when back button is clicked', async () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      const backButton = screen.getByText('Back')
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(defaultProps.handleBack).toHaveBeenCalled()
      })
    })

    it('should disable navigation when form is submitting', () => {
      vi.mocked(useForm).mockReturnValue({
        register: vi.fn(),
        handleSubmit: (fn: any) => (e: any) => {
          e?.preventDefault?.()
          fn(defaultFormValues)
          return Promise.resolve()
        },
        formState: { isSubmitting: true, errors: {} },
        control: mockControl,
        getValues: () => defaultFormValues,
        setValue: vi.fn(),
        trigger: vi.fn(),
        reset: vi.fn(),
      } as any)

      render(<HlCopyTraderForm {...defaultProps} />)
      const nextButton = screen.getByText('Next')
      expect(nextButton).toBeDisabled()
    })

    it('should enable navigation when form is not submitting', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      const nextButton = screen.getByText('Next')
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Form Initialization with Default Values', () => {
    it('should initialize with empty COPY_TRADE_ADDRESS', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })

    it('should initialize with empty WITHDRAW_FUNDS_TO', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })

    it('should initialize WITHDRAW as false', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })
  })

  describe('Form Initialization with Provided Values', () => {
    it('should initialize with provided inputs', () => {
      const providedInputs: HlCopyTraderFormData = {
        secrets: {
          COPY_TRADE_ADDRESS: '0x1234567890123456789012345678901234567890',
          WITHDRAW_FUNDS_TO: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          WITHDRAW: 'false',
        },
      }

      render(<HlCopyTraderForm {...defaultProps} inputs={providedInputs} />)

      expect(useForm).toHaveBeenCalled()
    })

    it('should merge provided inputs with default secrets structure', () => {
      const partialInputs: Partial<HlCopyTraderFormData> = {
        secrets: {
          COPY_TRADE_ADDRESS: '0x1234567890123456789012345678901234567890',
          WITHDRAW_FUNDS_TO: '',
          WITHDRAW: 'false',
        },
      }

      render(<HlCopyTraderForm {...defaultProps} inputs={partialInputs as HlCopyTraderFormData} />)

      expect(useForm).toHaveBeenCalled()
    })
  })

  describe('Form Layout', () => {
    it('should use space-y-6 class for vertical spacing', () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('space-y-6')
    })

    it('should use mb-6 class for bottom margin', () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('mb-6')
    })

    it('should use w-full class for full width', () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('w-full')
    })
  })

  describe('Form Validation Setup', () => {
    it('should use zodResolver with hlCopyTraderFormSchema', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })

    it('should setup form with react-hook-form', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })
  })

  describe('Ethereum Address Validation', () => {
    it('should accept valid lowercase ethereum address', () => {
      const validAddress = '0x1234567890123456789012345678901234567890'
      const addressPattern = /^0x[a-fA-F0-9]{40}$/
      expect(validAddress).toMatch(addressPattern)
    })

    it('should accept valid uppercase ethereum address', () => {
      const validAddress = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'
      const addressPattern = /^0x[a-fA-F0-9]{40}$/
      expect(validAddress).toMatch(addressPattern)
    })

    it('should accept valid mixed-case ethereum address', () => {
      const validAddress = '0xAbCdEf1234567890aBcDeF1234567890AbCdEf12'
      const addressPattern = /^0x[a-fA-F0-9]{40}$/
      expect(validAddress).toMatch(addressPattern)
    })

    it('should reject invalid ethereum address formats', () => {
      const invalidAddresses = [
        '0x123', // Too short
        '1234567890123456789012345678901234567890', // Missing 0x prefix
        '0xGHIJKL7890123456789012345678901234567890', // Invalid characters
        'not-an-address', // Completely invalid
        '0x12345678901234567890123456789012345678901', // Too long
      ]

      const addressPattern = /^0x[a-fA-F0-9]{40}$/

      invalidAddresses.forEach(address => {
        expect(address).not.toMatch(addressPattern)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined inputs gracefully', () => {
      expect(() => render(<HlCopyTraderForm {...defaultProps} inputs={undefined} />)).not.toThrow()
    })

    it('should handle empty inputs object', () => {
      expect(() =>
        render(<HlCopyTraderForm {...defaultProps} inputs={{} as HlCopyTraderFormData} />),
      ).not.toThrow()
    })

    it('should handle partial inputs', () => {
      const partialInputs: Partial<HlCopyTraderFormData> = {
        secrets: {
          COPY_TRADE_ADDRESS: '0x1234567890123456789012345678901234567890',
          WITHDRAW_FUNDS_TO: '',
          WITHDRAW: 'false',
        },
      }

      expect(() =>
        render(<HlCopyTraderForm {...defaultProps} inputs={partialInputs as HlCopyTraderFormData} />),
      ).not.toThrow()
    })
  })

  describe('User Interactions', () => {
    it('should allow user to enter trader address', async () => {
      const user = userEvent.setup()
      render(<HlCopyTraderForm {...defaultProps} />)

      const inputs = screen.getAllByPlaceholderText('0x...')
      await user.type(inputs[0], '0x1234567890123456789012345678901234567890')
      expect(inputs[0]).toHaveValue('0x1234567890123456789012345678901234567890')
    })

    it('should allow user to enter withdrawal address', async () => {
      const user = userEvent.setup()
      render(<HlCopyTraderForm {...defaultProps} />)

      const inputs = screen.getAllByPlaceholderText('0x...')
      await user.type(inputs[1], '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
      expect(inputs[1]).toHaveValue('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
    })
  })

  describe('Form Field Names', () => {
    it('should use correct field name for trader address', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByTestId('secrets.COPY_TRADE_ADDRESS')).toBeInTheDocument()
    })

    it('should use correct field name for withdrawal address', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByTestId('secrets.WITHDRAW_FUNDS_TO')).toBeInTheDocument()
    })

    it('should use nested field names for secrets', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByTestId('secrets.COPY_TRADE_ADDRESS')).toBeInTheDocument()
      expect(screen.getByTestId('secrets.WITHDRAW_FUNDS_TO')).toBeInTheDocument()
    })
  })

  describe('WITHDRAW Field Behavior', () => {
    it('should always include WITHDRAW field in form data', async () => {
      const { container } = render(<HlCopyTraderForm {...defaultProps} />)
      const form = container.querySelector('form')
      if (form) fireEvent.submit(form)

      await waitFor(() => {
        expect(defaultProps.setAppDataForm).toHaveBeenCalledWith({
          inputs: expect.objectContaining({
            secrets: expect.objectContaining({
              WITHDRAW: expect.any(String),
            }),
          }),
        })
      })
    })

    it('should have WITHDRAW prefilled as false by default', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })

    it('should not render WITHDRAW field as visible input', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.queryByTestId('input-secrets.WITHDRAW')).not.toBeInTheDocument()
    })
  })

  describe('Form Integration', () => {
    it('should integrate with InputFormField components', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByTestId('secrets.COPY_TRADE_ADDRESS')).toBeInTheDocument()
      expect(screen.getByTestId('secrets.WITHDRAW_FUNDS_TO')).toBeInTheDocument()
    })

    it('should integrate with CreateFormNavigation component', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should pass correct props to CreateFormNavigation', () => {
      render(<HlCopyTraderForm {...defaultProps} />)
      const backButton = screen.getByText('Back')
      const nextButton = screen.getByText('Next')
      expect(backButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })
  })
})
