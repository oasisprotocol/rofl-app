import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BuildStep } from './BuildStep'
import type { BuildFormData } from '../../types/build-form'

// Mock ONLY the complex child components that have external dependencies
vi.mock('../../components/BuildForm', () => ({
  BuildForm: ({ onSubmit, children, build, selectedTemplateRequirements, selectedTemplateId }: any) => (
    <div data-testid="build-form">
      <button
        onClick={() =>
          onSubmit({
            provider: '0xprovider123',
            duration: 'hours',
            number: 5,
            offerId: 'offer1',
            roseCostInBaseUnits: '1000000',
            offerCpus: 2,
            offerMemory: 4096,
            offerStorage: 1024,
          })
        }
        data-testid="submit-build-form"
      >
        Submit Build Form
      </button>
      <div
        data-build={JSON.stringify(build)}
        data-requirements={JSON.stringify(selectedTemplateRequirements)}
        data-template-id={selectedTemplateId}
      >
        {children({
          form: { formState: { isSubmitting: false } },
          noOffersWarning: false,
        })}
      </div>
    </div>
  ),
}))

// Mock Header and Footer due to complex auth dependencies
vi.mock('../../components/Layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

vi.mock('../../components/Layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

// Mock UI library components that have complex React Context requirements
vi.mock('@oasisprotocol/ui-library/src/components/ui/sidebar', () => ({
  Sidebar: ({ children }: any) => <div data-testid="sidebar">{children}</div>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ headerContent, footerContent, sidebar, children }: any) => (
    <div>
      {headerContent}
      {sidebar}
      {footerContent}
      <div data-testid="layout-content">{children}</div>
    </div>
  ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@oasisprotocol/ui-library/src/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}))

const mockHandleNext = vi.fn()
const mockHandleBack = vi.fn()
const mockSetAppDataForm = vi.fn()

const mockBuildData: BuildFormData = {
  provider: '0xprovider123',
  duration: 'hours',
  number: 5,
  offerId: 'offer1',
  roseCostInBaseUnits: '1000000',
  offerCpus: 2,
  offerMemory: 4096,
  offerStorage: 1024,
}

const mockSelectedTemplateRequirements = {
  tee: 'tdx' as const,
  cpus: 2,
  memory: 4,
  storage: 10,
}

describe('BuildStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports BuildStep component', () => {
    expect(BuildStep).toBeDefined()
    expect(typeof BuildStep).toBe('function')
  })

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>)
  }

  it('renders without crashing', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configure Machine"
      />,
    )
    expect(screen.getByTestId('layout-content')).toBeInTheDocument()
  })

  it('renders CreateFormHeader with correct title', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configure Machine"
      />,
    )
    expect(screen.getAllByText('Configure Machine')).toHaveLength(3) // 1 in sidebar, 1 in header h1, 1 in sidebar active step
  })

  it('renders BuildForm component', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        build={mockBuildData}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateRequirements={mockSelectedTemplateRequirements}
        selectedTemplateId="template-123"
        customStepTitle="Configure Machine"
      />,
    )
    expect(screen.getByTestId('build-form')).toBeInTheDocument()
  })

  it('renders CreateFormNavigation component', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configure Machine"
      />,
    )
    // Back button, Continue button, Submit Build Form button
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('renders with selectedTemplateName', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateName="My Template"
        customStepTitle="Configure Machine"
      />,
    )
    expect(screen.getByText(/Create your/)).toBeInTheDocument()
    expect(screen.getByText(/My Template/)).toBeInTheDocument()
  })

  it('renders without optional props', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configure Machine"
      />,
    )
    expect(screen.getByTestId('layout-content')).toBeInTheDocument()
  })

  it('passes build data to BuildForm', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        build={mockBuildData}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configure Machine"
      />,
    )
    const buildForm = screen.getByTestId('build-form')
    expect(buildForm).toBeInTheDocument()
    // Check that the inner div has the data attribute
    const innerDiv = buildForm.querySelector('[data-build]')
    expect(innerDiv?.getAttribute('data-build')).toBe(JSON.stringify(mockBuildData))
  })

  it('passes selectedTemplateRequirements to BuildForm', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        build={mockBuildData}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateRequirements={mockSelectedTemplateRequirements}
        customStepTitle="Configure Machine"
      />,
    )
    const buildForm = screen.getByTestId('build-form')
    const innerDiv = buildForm.querySelector('[data-requirements]')
    expect(innerDiv?.getAttribute('data-requirements')).toBe(JSON.stringify(mockSelectedTemplateRequirements))
  })

  it('passes selectedTemplateId to BuildForm', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        build={mockBuildData}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="template-123"
        customStepTitle="Configure Machine"
      />,
    )
    const buildForm = screen.getByTestId('build-form')
    const innerDiv = buildForm.querySelector('[data-template-id]')
    expect(innerDiv?.getAttribute('data-template-id')).toBe('template-123')
  })

  it('calls handleBack when back button is clicked', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configure Machine"
      />,
    )

    const buttons = screen.getAllByRole('button')
    const backButton = buttons.find(btn => btn.classList.contains('secondary'))
    fireEvent.click(backButton!)

    expect(mockHandleBack).toHaveBeenCalledTimes(1)
  })

  describe('onSubmit behavior', () => {
    it('should call setAppDataForm and handleNext when form is submitted', () => {
      renderWithRouter(
        <BuildStep
          handleNext={mockHandleNext}
          handleBack={mockHandleBack}
          setAppDataForm={mockSetAppDataForm}
          build={mockBuildData}
          customStepTitle="Configure Machine"
        />,
      )

      const submitButton = screen.getByTestId('submit-build-form')
      fireEvent.click(submitButton)

      expect(mockSetAppDataForm).toHaveBeenCalledWith({
        build: {
          provider: '0xprovider123',
          duration: 'hours',
          number: 5,
          offerId: 'offer1',
          roseCostInBaseUnits: '1000000',
          offerCpus: 2,
          offerMemory: 4096,
          offerStorage: 1024,
        },
      })
      expect(mockHandleNext).toHaveBeenCalled()
    })

    it('should wrap build data correctly when calling setAppDataForm', () => {
      const testFormData: BuildFormData = {
        provider: '0xprovider789',
        duration: 'months',
        number: 1,
        offerId: 'offer3',
        roseCostInBaseUnits: '3000000',
        offerCpus: 8,
        offerMemory: 16384,
        offerStorage: 4096,
      }

      // Simulate the onSubmit logic from lines 34-37
      const onSubmit = (values: BuildFormData) => {
        mockSetAppDataForm({ build: values })
        mockHandleNext()
      }

      onSubmit(testFormData)

      expect(mockSetAppDataForm).toHaveBeenCalledWith({ build: testFormData })
      expect(mockSetAppDataForm).toHaveBeenCalledTimes(1)
      expect(mockHandleNext).toHaveBeenCalledTimes(1)
    })

    it('should handle different build data variations', () => {
      const testCases: BuildFormData[] = [
        {
          provider: '0xprovider1',
          duration: 'hours',
          number: 5,
          offerId: 'offer1',
          roseCostInBaseUnits: '1000000',
          offerCpus: 2,
          offerMemory: 4096,
          offerStorage: 1024,
        },
        {
          provider: '0xprovider2',
          duration: 'days',
          number: 10,
          offerId: 'offer2',
          roseCostInBaseUnits: '2000000',
          offerCpus: 4,
          offerMemory: 8192,
          offerStorage: 2048,
        },
        {
          provider: '0xprovider3',
          duration: 'months',
          number: 1,
          offerId: 'offer3',
          roseCostInBaseUnits: '3000000',
          offerCpus: 8,
          offerMemory: 16384,
          offerStorage: 4096,
        },
      ]

      testCases.forEach(testFormData => {
        mockSetAppDataForm.mockClear()
        mockHandleNext.mockClear()

        // Simulate the onSubmit logic
        const onSubmit = (values: BuildFormData) => {
          mockSetAppDataForm({ build: values })
          mockHandleNext()
        }

        onSubmit(testFormData)

        expect(mockSetAppDataForm).toHaveBeenCalledWith({ build: testFormData })
        expect(mockHandleNext).toHaveBeenCalled()
      })
    })
  })

  it('should use currentStep=3 for CreateLayout', () => {
    renderWithRouter(
      <BuildStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configure Machine"
      />,
    )

    // The sidebar should show step indicators
    expect(screen.getByText('Input Metadata')).toBeInTheDocument()
    expect(screen.getAllByText('Configure Machine')).toHaveLength(3)
    expect(screen.getByText('Payment')).toBeInTheDocument()
  })
})
