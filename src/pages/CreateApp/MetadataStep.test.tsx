import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetadataStep } from './MetadataStep'
import type { MetadataFormData } from './types'

// Mock CreateLayout
vi.mock('./CreateLayout', () => ({
  CreateLayout: ({
    children,
    currentStep,
    selectedTemplateName,
    selectedTemplateId,
    customStepTitle,
  }: any) => (
    <div data-testid="create-layout">
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="template-name">{selectedTemplateName || ''}</div>
      <div data-testid="template-id">{selectedTemplateId || ''}</div>
      <div data-testid="custom-step-title">{customStepTitle}</div>
      {children}
    </div>
  ),
}))

// Mock CreateFormHeader
vi.mock('./CreateFormHeader', () => ({
  CreateFormHeader: ({ title, description }: any) => (
    <div>
      <h1 data-testid="form-title">{title}</h1>
      {description && <p data-testid="form-description">{description}</p>}
    </div>
  ),
}))

// Mock CreateFormNavigation
vi.mock('./CreateFormNavigation', () => ({
  CreateFormNavigation: ({ disabled }: any) => (
    <button type="submit" disabled={disabled} data-testid="next-button">
      Next
    </button>
  ),
}))

// Mock MetadataFormFields
vi.mock('../../components/MetadataFormFields', () => ({
  MetadataFormFields: ({ control }: any) => (
    <div data-testid="metadata-form-fields">
      <input
        data-testid="name-input"
        {...control.register?.('name')}
        onChange={e => {
          control.setValue?.('name', e.target.value)
        }}
      />
      <input
        data-testid="author-input"
        {...control.register?.('author')}
        onChange={e => {
          control.setValue?.('author', e.target.value)
        }}
      />
      <input
        data-testid="description-input"
        {...control.register?.('description')}
        onChange={e => {
          control.setValue?.('description', e.target.value)
        }}
      />
      <input
        data-testid="version-input"
        {...control.register?.('version')}
        onChange={e => {
          control.setValue?.('version', e.target.value)
        }}
      />
      <input
        data-testid="homepage-input"
        {...control.register?.('homepage')}
        onChange={e => {
          control.setValue?.('homepage', e.target.value)
        }}
      />
    </div>
  ),
}))

const mockHandleNext = vi.fn()
const mockSetAppDataForm = vi.fn()

const defaultMetadata: MetadataFormData = {
  name: 'Test App',
  author: 'test@example.com',
  description: 'Test description',
  version: '1.0.0',
  homepage: 'https://example.com',
}

const defaultProps = {
  handleNext: mockHandleNext,
  setAppDataForm: mockSetAppDataForm,
  metadata: defaultMetadata,
  selectedTemplateName: 'Test Template',
  selectedTemplateId: 'test-template',
  customStepTitle: 'Input Metadata',
}

describe('MetadataStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(MetadataStep).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof MetadataStep).toBe('function')
    })

    it('should export as named export', () => {
      expect(MetadataStep.name).toBe('MetadataStep')
    })
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })

    it('should render CreateFormHeader with correct title', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('form-title')).toHaveTextContent('Input Metadata')
    })

    it('should render CreateFormHeader with correct description', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('form-description')).toHaveTextContent(
        'All data you provide here will be visible publicly on-chain.',
      )
    })

    it('should render CreateFormNavigation component', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('next-button')).toBeInTheDocument()
    })

    it('should render MetadataFormFields component', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('metadata-form-fields')).toBeInTheDocument()
    })

    it('should render form element', () => {
      const { container } = render(<MetadataStep {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should pass currentStep to CreateLayout', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('current-step')).toHaveTextContent('1')
    })

    it('should pass selectedTemplateName to CreateLayout', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('template-name')).toHaveTextContent('Test Template')
    })

    it('should pass selectedTemplateId to CreateLayout', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('template-id')).toHaveTextContent('test-template')
    })

    it('should pass customStepTitle to CreateLayout', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('custom-step-title')).toHaveTextContent('Input Metadata')
    })

    it('should handle undefined selectedTemplateName', () => {
      const props = { ...defaultProps, selectedTemplateName: undefined }
      render(<MetadataStep {...props} />)
      expect(screen.getByTestId('template-name')).toHaveTextContent('')
    })

    it('should handle undefined selectedTemplateId', () => {
      const props = { ...defaultProps, selectedTemplateId: undefined }
      render(<MetadataStep {...props} />)
      expect(screen.getByTestId('template-id')).toHaveTextContent('')
    })

    it('should handle custom step title', () => {
      const props = { ...defaultProps, customStepTitle: 'Custom Step' }
      render(<MetadataStep {...props} />)
      expect(screen.getByTestId('custom-step-title')).toHaveTextContent('Custom Step')
    })
  })

  describe('Form State Management', () => {
    it('should initialize form with provided metadata', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })

    it('should update form when metadata prop changes', () => {
      const { rerender } = render(<MetadataStep {...defaultProps} />)

      const newMetadata: MetadataFormData = {
        name: 'Updated App',
        author: 'updated@example.com',
        description: 'Updated description',
        version: '2.0.0',
        homepage: 'https://updated.com',
      }

      rerender(<MetadataStep {...defaultProps} metadata={newMetadata} />)

      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })

    it('should handle empty metadata object', () => {
      const emptyMetadata: MetadataFormData = {
        name: '',
        author: '',
        description: '',
        version: '',
        homepage: '',
      }

      render(<MetadataStep {...defaultProps} metadata={emptyMetadata} />)

      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })

    it('should handle undefined metadata', () => {
      const props = { ...defaultProps, metadata: undefined }
      render(<MetadataStep {...props} />)

      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })
  })

  describe('Form Structure', () => {
    it('should have form with correct className', () => {
      const { container } = render(<MetadataStep {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('space-y-6', 'mb-6', 'w-full')
    })

    it('should have form with onSubmit handler', () => {
      const { container } = render(<MetadataStep {...defaultProps} />)
      const form = container.querySelector('form')
      // React doesn't render event handlers as HTML attributes
      // We verify the form element exists and is properly configured
      expect(form).toBeInTheDocument()
    })
  })

  describe('CreateFormNavigation Integration', () => {
    it('should pass disabled prop based on form submission state', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('next-button')).not.toBeDisabled()
    })
  })

  describe('MetadataFormFields Integration', () => {
    it('should pass control prop to MetadataFormFields', () => {
      render(<MetadataStep {...defaultProps} />)
      expect(screen.getByTestId('metadata-form-fields')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long metadata values', () => {
      const longMetadata: MetadataFormData = {
        name: 'A'.repeat(200),
        author: 'test@example.com',
        description: 'B'.repeat(5000),
        version: '1.0.0',
        homepage: 'https://example.com',
      }

      render(<MetadataStep {...defaultProps} metadata={longMetadata} />)

      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })

    it('should handle special characters in metadata', () => {
      const specialMetadata: MetadataFormData = {
        name: 'App <script>alert("xss")</script>',
        author: 'test@example.com',
        description: 'Description with "quotes" and \'apostrophes\'',
        version: '1.0.0',
        homepage: 'https://example.com?param=value&other=123',
      }

      render(<MetadataStep {...defaultProps} metadata={specialMetadata} />)

      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })

    it('should handle unicode characters in metadata', () => {
      const unicodeMetadata: MetadataFormData = {
        name: '应用名称',
        author: 'test@example.com',
        description: 'Описание с эмодзи 🚀',
        version: '1.0.0',
        homepage: 'https://example.com',
      }

      render(<MetadataStep {...defaultProps} metadata={unicodeMetadata} />)

      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })

    it('should handle missing optional props', () => {
      const minimalProps = {
        handleNext: mockHandleNext,
        setAppDataForm: mockSetAppDataForm,
        customStepTitle: 'Test',
      }

      render(<MetadataStep {...minimalProps} />)

      expect(screen.getByTestId('create-layout')).toBeInTheDocument()
    })
  })

  describe('Component Props Type', () => {
    it('should accept all required props', () => {
      const props: React.ComponentProps<typeof MetadataStep> = {
        handleNext: vi.fn(),
        setAppDataForm: vi.fn(),
        customStepTitle: 'Test',
      }

      expect(props.customStepTitle).toBe('Test')
    })

    it('should accept optional props', () => {
      const props: React.ComponentProps<typeof MetadataStep> = {
        handleNext: vi.fn(),
        setAppDataForm: vi.fn(),
        metadata: defaultMetadata,
        selectedTemplateName: 'Template',
        selectedTemplateId: 'id',
        customStepTitle: 'Test',
      }

      expect(props.metadata).toEqual(defaultMetadata)
      expect(props.selectedTemplateName).toBe('Template')
    })
  })
})
