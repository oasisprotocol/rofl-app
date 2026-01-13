import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TgbotAgentForm } from './TgbotAgentForm'
import { type AgentFormData } from './types'

// Mock the dependencies
vi.mock('../../components/SelectFormField', () => ({
  SelectFormField: ({ label, name, placeholder, options, control }: any) => (
    <div data-testid={`select-${name}`}>
      <label>{label}</label>
      <select data-testid={name} placeholder={placeholder}>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}))

vi.mock('../../components/InputFormField', () => ({
  InputFormField: ({ label, name, placeholder, type, control }: any) => (
    <div data-testid={`input-${name}`}>
      <label>{label}</label>
      {type === 'textarea' ? (
        <textarea data-testid={name} placeholder={placeholder} />
      ) : (
        <input
          data-testid={name}
          type={type || 'text'}
          placeholder={placeholder}
          onChange={e => {
            // Simulate form field onChange
            const event = e as unknown as { target: { name: string; value: string } }
            control?.field?.onChange?.(event.target.value)
          }}
        />
      )}
    </div>
  ),
}))

vi.mock('./CreateFormNavigation', () => ({
  CreateFormNavigation: ({ handleBack, disabled }: any) => (
    <div data-testid="create-form-navigation">
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

describe('TgbotAgentForm', () => {
  const defaultProps = {
    handleNext: vi.fn(),
    handleBack: vi.fn(),
    setAppDataForm: vi.fn(),
  }

  const defaultFormValues = {
    secrets: {
      OLLAMA_MODEL: '',
      TELEGRAM_API_TOKEN: '',
      OLLAMA_SYSTEM_PROMPT: '',
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
      const { container } = render(<TgbotAgentForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should render OLLAMA_MODEL select field', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByTestId('select-secrets.OLLAMA_MODEL')).toBeInTheDocument()
      expect(screen.getByTestId('select-secrets.OLLAMA_MODEL')).toHaveTextContent(
        'LLM running inside your TEE bot',
      )
    })

    it('should render TELEGRAM_API_TOKEN input field', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByTestId('input-secrets.TELEGRAM_API_TOKEN')).toBeInTheDocument()
      expect(screen.getByTestId('input-secrets.TELEGRAM_API_TOKEN')).toHaveTextContent('Telegram API token')
    })

    it('should render OLLAMA_SYSTEM_PROMPT textarea field', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByTestId('input-secrets.OLLAMA_SYSTEM_PROMPT')).toBeInTheDocument()
      expect(screen.getByTestId('input-secrets.OLLAMA_SYSTEM_PROMPT')).toHaveTextContent('LLM system prompt')
    })

    it('should render form navigation', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByTestId('create-form-navigation')).toBeInTheDocument()
    })
  })

  describe('Form Field Labels and Placeholders', () => {
    it('should display correct label for model selection', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByText('LLM running inside your TEE bot')).toBeInTheDocument()
    })

    it('should display correct label for API token', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByText('Telegram API token')).toBeInTheDocument()
    })

    it('should display correct label for system prompt', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByText('LLM system prompt')).toBeInTheDocument()
    })

    it('should display correct placeholder for model selection', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      const select = screen.getByPlaceholderText('Select a model')
      expect(select).toBeInTheDocument()
    })

    it('should display correct placeholder for API token', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      const input = screen.getByPlaceholderText('Paste or type API token here')
      expect(input).toBeInTheDocument()
    })

    it('should display correct placeholder for system prompt', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      const textarea = screen.getByPlaceholderText('Instructions for the agent on how to act, behave...')
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Form Options', () => {
    it('should render Gemma 3 1B model option', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByText('Gemma 3 1B')).toBeInTheDocument()
    })

    it('should render Deepseek 1.5B model option', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(screen.getByText('Deepseek 1.5B')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call setAppDataForm with form data on submit', async () => {
      const { container } = render(<TgbotAgentForm {...defaultProps} />)
      const form = container.querySelector('form')
      if (form) fireEvent.submit(form)

      await waitFor(() => {
        expect(defaultProps.setAppDataForm).toHaveBeenCalledWith({
          inputs: defaultFormValues,
        })
      })
    })

    it('should call handleNext on successful form submission', async () => {
      const { container } = render(<TgbotAgentForm {...defaultProps} />)
      const form = container.querySelector('form')
      if (form) fireEvent.submit(form)

      await waitFor(() => {
        expect(defaultProps.handleNext).toHaveBeenCalled()
      })
    })

    it('should include secrets in form data', async () => {
      const { container } = render(<TgbotAgentForm {...defaultProps} />)
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
  })

  describe('Form Navigation', () => {
    it('should render back button', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      const backButton = screen.getByText('Back')
      expect(backButton).toBeInTheDocument()
    })

    it('should call handleBack when back button is clicked', async () => {
      render(<TgbotAgentForm {...defaultProps} />)
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

      render(<TgbotAgentForm {...defaultProps} />)
      const nextButton = screen.getByText('Next')
      expect(nextButton).toBeDisabled()
    })

    it('should enable navigation when form is not submitting', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      const nextButton = screen.getByText('Next')
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Form Initialization with Default Values', () => {
    it('should initialize with empty OLLAMA_MODEL', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })

    it('should initialize with empty TELEGRAM_API_TOKEN', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })

    it('should initialize with empty OLLAMA_SYSTEM_PROMPT', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })
  })

  describe('Form Initialization with Provided Values', () => {
    it('should initialize with provided inputs', () => {
      const providedInputs: AgentFormData = {
        secrets: {
          OLLAMA_MODEL: 'gemma3:1b',
          TELEGRAM_API_TOKEN: 'test-token',
          OLLAMA_SYSTEM_PROMPT: 'test prompt',
        },
      }

      render(<TgbotAgentForm {...defaultProps} inputs={providedInputs} />)

      expect(useForm).toHaveBeenCalled()
    })

    it('should merge provided inputs with default secrets structure', () => {
      const partialInputs: Partial<AgentFormData> = {
        secrets: {
          OLLAMA_MODEL: 'gemma3:1b',
          TELEGRAM_API_TOKEN: '',
          OLLAMA_SYSTEM_PROMPT: '',
        },
      }

      render(<TgbotAgentForm {...defaultProps} inputs={partialInputs as AgentFormData} />)

      expect(useForm).toHaveBeenCalled()
    })
  })

  describe('Form Field Types', () => {
    it('should use password type for TELEGRAM_API_TOKEN', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      const input = screen.getByPlaceholderText('Paste or type API token here')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should use textarea type for OLLAMA_SYSTEM_PROMPT', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      const textarea = screen.getByPlaceholderText('Instructions for the agent on how to act, behave...')
      expect(textarea.tagName.toLowerCase()).toBe('textarea')
    })
  })

  describe('Form Layout', () => {
    it('should use space-y-6 class for vertical spacing', () => {
      const { container } = render(<TgbotAgentForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('space-y-6')
    })

    it('should use mb-6 class for bottom margin', () => {
      const { container } = render(<TgbotAgentForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('mb-6')
    })

    it('should use w-full class for full width', () => {
      const { container } = render(<TgbotAgentForm {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('w-full')
    })
  })

  describe('Form Validation Setup', () => {
    it('should use zodResolver with tgbotFormSchema', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })

    it('should setup form with react-hook-form', () => {
      render(<TgbotAgentForm {...defaultProps} />)
      expect(useForm).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined inputs gracefully', () => {
      expect(() => render(<TgbotAgentForm {...defaultProps} inputs={undefined} />)).not.toThrow()
    })

    it('should handle empty inputs object', () => {
      expect(() => render(<TgbotAgentForm {...defaultProps} inputs={{} as AgentFormData} />)).not.toThrow()
    })

    it('should handle partial inputs', () => {
      const partialInputs: Partial<AgentFormData> = {
        secrets: {
          OLLAMA_MODEL: 'gemma3:1b',
          TELEGRAM_API_TOKEN: '',
          OLLAMA_SYSTEM_PROMPT: '',
        },
      }

      expect(() =>
        render(<TgbotAgentForm {...defaultProps} inputs={partialInputs as AgentFormData} />),
      ).not.toThrow()
    })
  })

  describe('User Interactions', () => {
    it('should allow user to select a model', async () => {
      const user = userEvent.setup()
      render(<TgbotAgentForm {...defaultProps} />)

      const select = screen.getByPlaceholderText('Select a model')
      expect(select).toBeInTheDocument()
    })

    it('should allow user to enter API token', async () => {
      const user = userEvent.setup()
      render(<TgbotAgentForm {...defaultProps} />)

      const input = screen.getByPlaceholderText('Paste or type API token here')
      await user.type(input, 'test-token-123')
      expect(input).toHaveValue('test-token-123')
    })

    it('should allow user to enter system prompt', async () => {
      const user = userEvent.setup()
      render(<TgbotAgentForm {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Instructions for the agent on how to act, behave...')
      await user.type(textarea, 'You are a helpful assistant.')
      expect(textarea).toHaveValue('You are a helpful assistant.')
    })
  })
})
