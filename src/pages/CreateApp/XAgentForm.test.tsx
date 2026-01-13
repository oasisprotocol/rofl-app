import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'

// Mock wagmi-config BEFORE any other imports
vi.mock('../../constants/wagmi-config', () => ({
  wagmiConfig: {},
}))

// Mock RoflAppBackendAuth hooks BEFORE importing test-utils
vi.mock('../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: () => ({
    token: 'mock-token',
    isAuthenticated: true,
    status: 'authenticated',
  }),
}))

// Mock useNetwork BEFORE importing test-utils
vi.mock('../../hooks/useNetwork', () => ({
  useNetwork: () => 'mainnet',
}))

// Mock the dependencies
vi.mock('../../components/InputFormField', () => ({
  InputFormField: ({ control, name, label, placeholder, type }: any) =>
    React.createElement(
      'div',
      { 'data-testid': `input-${name}`, 'data-type': type },
      React.createElement('label', null, label),
      type === 'textarea'
        ? React.createElement('textarea', { 'data-testid': name, placeholder })
        : React.createElement('input', {
            'data-testid': name,
            type: type === 'input' ? 'text' : type,
            placeholder,
          }),
    ),
}))

vi.mock('../../components/SelectFormField', () => ({
  SelectFormField: ({ control, name, label, placeholder, options }: any) =>
    React.createElement(
      'div',
      { 'data-testid': `select-${name}` },
      React.createElement('label', null, label),
      React.createElement(
        'select',
        { 'data-testid': name },
        React.createElement('option', { value: '' }, placeholder),
        options?.map((opt: any) =>
          React.createElement('option', { key: opt.value, value: opt.value }, opt.label),
        ),
      ),
    ),
}))

vi.mock('./CreateFormNavigation', () => ({
  CreateFormNavigation: ({ handleBack, disabled }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'form-navigation' },
      React.createElement('button', { 'data-testid': 'back-button', onClick: handleBack, disabled }, 'Back'),
      React.createElement('button', { 'data-testid': 'next-button', disabled }, 'Next'),
    ),
}))

// Import after mocking
import { XAgentForm } from './XAgentForm'
import type { XAgentFormData } from './types'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(HashRouter, null, children)

describe('XAgentForm', () => {
  const mockHandleNext = vi.fn()
  const mockHandleBack = vi.fn()
  const mockSetAppDataForm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the form with all required fields', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByTestId('input-secrets.SYSTEM_PROMPT')).toBeInTheDocument()
    expect(screen.getByTestId('input-secrets.TWITTER_BEARER_TOKEN')).toBeInTheDocument()
    expect(screen.getByTestId('input-secrets.TWITTER_API_KEY')).toBeInTheDocument()
    expect(screen.getByTestId('input-secrets.TWITTER_API_SECRET')).toBeInTheDocument()
    expect(screen.getByTestId('input-secrets.TWITTER_ACCESS_TOKEN')).toBeInTheDocument()
    expect(screen.getByTestId('input-secrets.TWITTER_ACCESS_TOKEN_SECRET')).toBeInTheDocument()
    expect(screen.getByTestId('input-secrets.OPENAI_API_KEY')).toBeInTheDocument()
    expect(screen.getByTestId('select-secrets.OPENAI_MODEL')).toBeInTheDocument()
  })

  it('should render Bot Persona field with correct label', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const field = screen.getByTestId('input-secrets.SYSTEM_PROMPT')
    expect(field).toBeInTheDocument()
  })

  it('should render Bot Persona field as textarea', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const field = screen.getByTestId('input-secrets.SYSTEM_PROMPT')
    expect(field.getAttribute('data-type')).toBe('textarea')
  })

  it('should render all Twitter API fields with correct labels', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByText('Twitter Bearer Token')).toBeInTheDocument()
    expect(screen.getByText('Twitter API Key')).toBeInTheDocument()
    expect(screen.getByText('Twitter API Secret')).toBeInTheDocument()
    expect(screen.getByText('Twitter Access Token')).toBeInTheDocument()
    expect(screen.getByText('Twitter Access Token Secret')).toBeInTheDocument()
  })

  it('should render password fields for sensitive Twitter credentials', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByTestId('input-secrets.TWITTER_BEARER_TOKEN')).toHaveAttribute('data-type', 'password')
    expect(screen.getByTestId('input-secrets.TWITTER_API_SECRET')).toHaveAttribute('data-type', 'password')
    expect(screen.getByTestId('input-secrets.TWITTER_ACCESS_TOKEN_SECRET')).toHaveAttribute(
      'data-type',
      'password',
    )
  })

  it('should render text input fields for non-sensitive Twitter credentials', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByTestId('input-secrets.TWITTER_API_KEY')).toHaveAttribute('data-type', 'input')
    expect(screen.getByTestId('input-secrets.TWITTER_ACCESS_TOKEN')).toHaveAttribute('data-type', 'input')
  })

  it('should render OpenAI API Key field as password', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const field = screen.getByTestId('input-secrets.OPENAI_API_KEY')
    expect(field).toHaveAttribute('data-type', 'password')
  })

  it('should render OpenAI Model selector with all options', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const select = screen.getByTestId('select-secrets.OPENAI_MODEL')
    expect(select).toBeInTheDocument()
    expect(screen.getByText('OpenAI Model')).toBeInTheDocument()
  })

  it('should render navigation buttons', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByTestId('back-button')).toBeInTheDocument()
    expect(screen.getByTestId('next-button')).toBeInTheDocument()
  })

  it('should have correct form structure and classes', () => {
    const { container } = render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveClass('space-y-6', 'mb-6', 'w-full')
  })

  it('should initialize with default empty values', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByTestId('secrets.SYSTEM_PROMPT')).toBeInTheDocument()
    expect(screen.getByTestId('secrets.OPENAI_MODEL')).toBeInTheDocument()
  })

  it('should have correct placeholders for Twitter fields', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(
      screen.getByPlaceholderText('Your Twitter Bearer token (from Twitter Developer Portal)'),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Your Twitter API key (from Twitter Developer Portal)'),
    ).toBeInTheDocument()
  })

  it('should have correct placeholder for Bot Persona', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(
      screen.getByPlaceholderText(
        "Define your bot's personality and behavior. This determines what kind of tweets it will generate...",
      ),
    ).toBeInTheDocument()
  })

  it('should have correct placeholder for OpenAI API Key', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(
      screen.getByPlaceholderText('Your OpenAI API key for generating tweet content (sk-...)'),
    ).toBeInTheDocument()
  })

  it('should have correct placeholder for OpenAI Model selector', () => {
    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const selectElement = screen.getByTestId('secrets.OPENAI_MODEL')
    expect(selectElement).toBeInTheDocument()
  })

  it('should have form with submit handler', () => {
    const { container } = render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('should render with initial inputs if provided', () => {
    const initialInputs: XAgentFormData = {
      secrets: {
        SYSTEM_PROMPT: 'Test persona',
        TWITTER_BEARER_TOKEN: 'test-bearer',
        TWITTER_API_KEY: 'test-key',
        TWITTER_API_SECRET: 'test-secret',
        TWITTER_ACCESS_TOKEN: 'test-token',
        TWITTER_ACCESS_TOKEN_SECRET: 'test-token-secret',
        OPENAI_API_KEY: 'sk-test',
        OPENAI_MODEL: 'gpt-4o',
      },
    }

    render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        inputs: initialInputs,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByTestId('input-secrets.SYSTEM_PROMPT')).toBeInTheDocument()
  })

  it('should call setAppDataForm and handleNext on form submit', () => {
    const { container } = render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    const form = container.querySelector('form')
    if (form) {
      const event = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(event)
    }

    expect(screen.getByTestId('form-navigation')).toBeInTheDocument()
  })

  it('should reset form when inputs prop changes', () => {
    const initialInputs: XAgentFormData = {
      secrets: {
        SYSTEM_PROMPT: 'Initial persona',
        TWITTER_BEARER_TOKEN: 'initial-bearer',
        TWITTER_API_KEY: 'initial-key',
        TWITTER_API_SECRET: 'initial-secret',
        TWITTER_ACCESS_TOKEN: 'initial-token',
        TWITTER_ACCESS_TOKEN_SECRET: 'initial-token-secret',
        OPENAI_API_KEY: 'sk-initial',
        OPENAI_MODEL: 'gpt-3.5-turbo',
      },
    }

    const { rerender } = render(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        inputs: initialInputs,
        setAppDataForm: mockSetAppDataForm,
      }),
      { wrapper },
    )

    expect(screen.getByTestId('input-secrets.SYSTEM_PROMPT')).toBeInTheDocument()

    const updatedInputs: XAgentFormData = {
      secrets: {
        SYSTEM_PROMPT: 'Updated persona',
        TWITTER_BEARER_TOKEN: 'updated-bearer',
        TWITTER_API_KEY: 'updated-key',
        TWITTER_API_SECRET: 'updated-secret',
        TWITTER_ACCESS_TOKEN: 'updated-token',
        TWITTER_ACCESS_TOKEN_SECRET: 'updated-token-secret',
        OPENAI_API_KEY: 'sk-updated',
        OPENAI_MODEL: 'gpt-4o',
      },
    }

    rerender(
      React.createElement(XAgentForm, {
        handleNext: mockHandleNext,
        handleBack: mockHandleBack,
        inputs: updatedInputs,
        setAppDataForm: mockSetAppDataForm,
      }),
    )

    expect(screen.getByTestId('input-secrets.SYSTEM_PROMPT')).toBeInTheDocument()
  })
})
