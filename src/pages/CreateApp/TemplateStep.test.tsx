import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TemplateStep } from './TemplateStep'

// Mock dependencies
vi.mock('../../components/Layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

vi.mock('../../components/Layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

vi.mock('../../components/TemplatesList', () => ({
  TemplatesList: ({ handleTemplateSelect }: any) => (
    <div>
      <button onClick={() => handleTemplateSelect('tgbot')} data-testid="tgbot-template">
        Telegram Bot
      </button>
      <button onClick={() => handleTemplateSelect('x-agent')} data-testid="x-agent-template">
        X Agent
      </button>
      <button onClick={() => handleTemplateSelect('hl-copy-trader')} data-testid="hl-copy-trader-template">
        HL Copy Trader
      </button>
      <button onClick={() => handleTemplateSelect('custom-build')} data-testid="custom-build-template">
        Custom Build
      </button>
    </div>
  ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ headerContent, footerContent, children }: any) => (
    <div>
      <div data-testid="layout-header">{headerContent}</div>
      <div data-testid="layout-footer">{footerContent}</div>
      <div data-testid="layout-content">{children}</div>
    </div>
  ),
}))

describe('TemplateStep', () => {
  it('should render the page heading', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    expect(screen.getByText('Start by Selecting a Template')).toBeInTheDocument()
  })

  it('should render Layout component', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    expect(screen.getByTestId('layout-header')).toBeInTheDocument()
    expect(screen.getByTestId('layout-footer')).toBeInTheDocument()
    expect(screen.getByTestId('layout-content')).toBeInTheDocument()
  })

  it('should render Header and Footer components', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render TemplatesList component', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    expect(screen.getByTestId('tgbot-template')).toBeInTheDocument()
    expect(screen.getByTestId('x-agent-template')).toBeInTheDocument()
    expect(screen.getByTestId('hl-copy-trader-template')).toBeInTheDocument()
    expect(screen.getByTestId('custom-build-template')).toBeInTheDocument()
  })

  it('should call setAppDataForm and handleNext when template is selected', async () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    const tgbotButton = screen.getByTestId('tgbot-template')
    fireEvent.click(tgbotButton)

    expect(mockSetAppDataForm).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'tgbot',
      }),
    )
    expect(mockHandleNext).toHaveBeenCalled()
  })

  it('should call setAppDataForm before handleNext', async () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    const tgbotButton = screen.getByTestId('tgbot-template')
    fireEvent.click(tgbotButton)

    expect(mockSetAppDataForm).toHaveBeenCalledBefore(mockHandleNext)
  })

  it('should handle x-agent template selection', async () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    const xAgentButton = screen.getByTestId('x-agent-template')
    fireEvent.click(xAgentButton)

    expect(mockSetAppDataForm).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'x-agent',
      }),
    )
    expect(mockHandleNext).toHaveBeenCalled()
  })

  it('should handle hl-copy-trader template selection', async () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    const hlCopyTraderButton = screen.getByTestId('hl-copy-trader-template')
    fireEvent.click(hlCopyTraderButton)

    expect(mockSetAppDataForm).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'hl-copy-trader',
      }),
    )
    expect(mockHandleNext).toHaveBeenCalled()
  })

  it('should handle custom-build template selection', async () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    const customBuildButton = screen.getByTestId('custom-build-template')
    fireEvent.click(customBuildButton)

    expect(mockSetAppDataForm).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'custom-build',
      }),
    )
    expect(mockHandleNext).toHaveBeenCalled()
  })

  it('should include template initialValues in setAppDataForm call', async () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    const tgbotButton = screen.getByTestId('tgbot-template')
    fireEvent.click(tgbotButton)

    expect(mockSetAppDataForm).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'tgbot',
        metadata: expect.any(Object),
        build: expect.any(Object),
      }),
    )
  })

  it('should have proper responsive styling', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    const { container } = render(
      <TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />,
    )

    const wrapper = container.querySelector('[class*="md:max-h-none"]')
    expect(wrapper).toBeInTheDocument()
    const wrapper2 = container.querySelector('[class*="md:h-auto"]')
    expect(wrapper2).toBeInTheDocument()
  })

  it('should have proper container structure', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    const { container } = render(
      <TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />,
    )

    const contentContainer = container.querySelector('.mx-auto.px-8.py-12')
    expect(contentContainer).toBeInTheDocument()
  })

  it('should have proper heading styling', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    render(<TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />)

    const heading = screen.getByText('Start by Selecting a Template')
    expect(heading.tagName).toBe('H1')
  })

  it('should have proper margin bottom on heading container', () => {
    const mockHandleNext = vi.fn()
    const mockSetAppDataForm = vi.fn()

    const { container } = render(
      <TemplateStep handleNext={mockHandleNext} setAppDataForm={mockSetAppDataForm} />,
    )

    const marginBottom = container.querySelector('.mb-8')
    expect(marginBottom).toBeInTheDocument()
  })
})
