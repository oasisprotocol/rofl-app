import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CustomInputsStep } from './CustomInputsStep'
import type { AgentFormData, XAgentFormData, HlCopyTraderFormData, CustomBuildFormData } from './types'

// Mock the CreateLayout component
vi.mock('./CreateLayout', () => ({
  CreateLayout: ({
    children,
    currentStep,
    selectedTemplateName,
    selectedTemplateId,
    customStepTitle,
  }: any) => (
    <div
      data-testid="create-layout"
      data-current-step={currentStep}
      data-template-name={selectedTemplateName}
      data-template-id={selectedTemplateId}
      data-custom-title={customStepTitle}
    >
      {children}
    </div>
  ),
}))

// Mock the CreateFormHeader component
vi.mock('./CreateFormHeader', () => ({
  CreateFormHeader: ({ title }: any) => <h1 data-testid="form-header">{title}</h1>,
}))

// Mock the form components
vi.mock('./CustomBuildSetupForm', () => ({
  CustomBuildSetupForm: () => <div data-testid="custom-build-form">Custom Build Form</div>,
}))

vi.mock('./TgbotAgentForm', () => ({
  TgbotAgentForm: () => <div data-testid="tgbot-form">Tgbot Form</div>,
}))

vi.mock('./XAgentForm', () => ({
  XAgentForm: () => <div data-testid="x-agent-form">X Agent Form</div>,
}))

vi.mock('./HlCopyTraderForm', () => ({
  HlCopyTraderForm: () => <div data-testid="hl-copy-trader-form">HL Copy Trader Form</div>,
}))

const mockHandleNext = vi.fn()
const mockHandleBack = vi.fn()
const mockSetAppDataForm = vi.fn()

describe('CustomInputsStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports CustomInputsStep component', () => {
    expect(CustomInputsStep).toBeDefined()
    expect(typeof CustomInputsStep).toBe('function')
  })

  it('renders without crashing', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Custom Inputs"
      />,
    )
    expect(screen.getByTestId('create-layout')).toBeInTheDocument()
  })

  it('renders CreateLayout with correct currentStep', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Custom Inputs"
      />,
    )
    const layout = screen.getByTestId('create-layout')
    expect(layout).toHaveAttribute('data-current-step', '2')
  })

  it('renders CreateLayout with selectedTemplateName', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateName="My Template"
        customStepTitle="Custom Inputs"
      />,
    )
    const layout = screen.getByTestId('create-layout')
    expect(layout).toHaveAttribute('data-template-name', 'My Template')
  })

  it('renders CreateLayout with selectedTemplateId', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="template-123"
        customStepTitle="Custom Inputs"
      />,
    )
    const layout = screen.getByTestId('create-layout')
    expect(layout).toHaveAttribute('data-template-id', 'template-123')
  })

  it('renders CreateLayout with customStepTitle', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Configuration"
      />,
    )
    const layout = screen.getByTestId('create-layout')
    expect(layout).toHaveAttribute('data-custom-title', 'Configuration')
  })

  it('renders CreateFormHeader with customStepTitle', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        customStepTitle="Bot Configuration"
      />,
    )
    expect(screen.getByTestId('form-header')).toHaveTextContent('Bot Configuration')
  })

  it('renders CustomBuildSetupForm when templateId is custom-build', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="custom-build"
        customStepTitle="Custom Build"
      />,
    )
    expect(screen.getByTestId('custom-build-form')).toBeInTheDocument()
  })

  it('renders TgbotAgentForm when templateId is tgbot', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="tgbot"
        customStepTitle="Telegram Bot"
      />,
    )
    expect(screen.getByTestId('tgbot-form')).toBeInTheDocument()
  })

  it('renders XAgentForm when templateId is x-agent', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="x-agent"
        customStepTitle="X Agent"
      />,
    )
    expect(screen.getByTestId('x-agent-form')).toBeInTheDocument()
  })

  it('renders HlCopyTraderForm when templateId is hl-copy-trader', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="hl-copy-trader"
        customStepTitle="HL Copy Trader"
      />,
    )
    expect(screen.getByTestId('hl-copy-trader-form')).toBeInTheDocument()
  })

  it('passes correct props to CustomBuildSetupForm', () => {
    const inputs = {} as CustomBuildFormData
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        inputs={inputs}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="custom-build"
        customStepTitle="Custom Build"
      />,
    )
    expect(screen.getByTestId('custom-build-form')).toBeInTheDocument()
  })

  it('passes correct props to TgbotAgentForm', () => {
    const inputs = {} as AgentFormData
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        inputs={inputs}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="tgbot"
        customStepTitle="Telegram Bot"
      />,
    )
    expect(screen.getByTestId('tgbot-form')).toBeInTheDocument()
  })

  it('passes correct props to XAgentForm', () => {
    const inputs = {} as XAgentFormData
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        inputs={inputs}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="x-agent"
        customStepTitle="X Agent"
      />,
    )
    expect(screen.getByTestId('x-agent-form')).toBeInTheDocument()
  })

  it('passes correct props to HlCopyTraderForm', () => {
    const inputs = {} as HlCopyTraderFormData
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        inputs={inputs}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="hl-copy-trader"
        customStepTitle="HL Copy Trader"
      />,
    )
    expect(screen.getByTestId('hl-copy-trader-form')).toBeInTheDocument()
  })

  it('does not render any form when templateId does not match', () => {
    render(
      <CustomInputsStep
        handleNext={mockHandleNext}
        handleBack={mockHandleBack}
        setAppDataForm={mockSetAppDataForm}
        selectedTemplateId="unknown-template"
        customStepTitle="Unknown"
      />,
    )
    expect(screen.queryByTestId('custom-build-form')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tgbot-form')).not.toBeInTheDocument()
    expect(screen.queryByTestId('x-agent-form')).not.toBeInTheDocument()
    expect(screen.queryByTestId('hl-copy-trader-form')).not.toBeInTheDocument()
  })
})
