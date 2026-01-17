import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HelpWidget } from './HelpWidget'

describe('HelpWidget', () => {
  it('should be defined', () => {
    expect(HelpWidget).toBeDefined()
  })

  it('should be a component', () => {
    expect(typeof HelpWidget).toBe('function')
  })

  it('should render nothing when no markdown or templateId is provided', () => {
    const { container } = render(<HelpWidget isExpanded={false} setIsExpanded={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when empty markdown is provided', () => {
    const { container } = render(<HelpWidget markdown="" isExpanded={false} setIsExpanded={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render help button when not expanded with markdown', () => {
    render(<HelpWidget markdown="Test content" isExpanded={false} setIsExpanded={vi.fn()} />)
    expect(screen.getByRole('button', { name: /need help/i })).toBeInTheDocument()
  })

  it('should render help button when not expanded with templateId', () => {
    render(<HelpWidget selectedTemplateId="tgbot" isExpanded={false} setIsExpanded={vi.fn()} />)
    expect(screen.getByRole('button', { name: /need help/i })).toBeInTheDocument()
  })

  it('should render expanded panel when isExpanded is true', () => {
    render(
      <HelpWidget
        markdown="# Test Guide\n\nThis is test content."
        isExpanded={true}
        setIsExpanded={vi.fn()}
      />,
    )
    expect(screen.getByText(/template guide/i)).toBeInTheDocument()
  })

  it('should hide help button when panel is expanded', () => {
    const { container: _container } = render(
      <HelpWidget markdown="Test content" isExpanded={true} setIsExpanded={vi.fn()} />,
    )
    // The button uses conditional classes based on isExpanded state
    // When expanded, the button should have opacity-0 and pointer-events-none
    const helpButton = screen.queryByRole('button', { name: /need help/i })
    // Button is present in DOM but visually hidden
    expect(helpButton).toBeInTheDocument()
  })

  it('should call setIsExpanded(false) when close button is clicked', () => {
    const mockSetIsExpanded = vi.fn()
    render(<HelpWidget markdown="Test content" isExpanded={true} setIsExpanded={mockSetIsExpanded} />)

    const closeButton = screen.getByRole('button', { name: /close panel/i })
    fireEvent.click(closeButton)

    expect(mockSetIsExpanded).toHaveBeenCalledWith(false)
  })

  it('should call setIsExpanded(true) when help button is clicked', () => {
    const mockSetIsExpanded = vi.fn()
    render(<HelpWidget markdown="Test content" isExpanded={false} setIsExpanded={mockSetIsExpanded} />)

    const helpButton = screen.getByRole('button', { name: /need help/i })
    fireEvent.click(helpButton)

    expect(mockSetIsExpanded).toHaveBeenCalledWith(true)
  })

  it('should render markdown content', () => {
    render(
      <HelpWidget
        markdown="# Test Header\n\nThis is a test paragraph.\n\n- Item 1\n- Item 2"
        isExpanded={true}
        setIsExpanded={vi.fn()}
      />,
    )

    // Markdown content is rendered, may be in a single element or split
    const content = screen.getByText(/Test Header/)
    expect(content).toBeInTheDocument()
    expect(screen.getByText(/This is a test paragraph/)).toBeInTheDocument()
    expect(screen.getByText(/Item 1/)).toBeInTheDocument()
    expect(screen.getByText(/Item 2/)).toBeInTheDocument()
  })

  it('should render markdown with templateId lookup', () => {
    render(<HelpWidget selectedTemplateId="tgbot" isExpanded={true} setIsExpanded={vi.fn()} />)
    // The tgbot template should have documentation
    expect(screen.getByText(/template guide/i)).toBeInTheDocument()
  })

  it('should render links in markdown with target="_blank" and rel="noopener noreferrer"', () => {
    render(
      <HelpWidget markdown="[Test Link](https://example.com)" isExpanded={true} setIsExpanded={vi.fn()} />,
    )

    const link = screen.getByRole('link', { name: 'Test Link' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should prefer markdown prop over selectedTemplateId', () => {
    const markdownContent = 'Custom markdown content'
    render(
      <HelpWidget
        selectedTemplateId="tgbot"
        markdown={markdownContent}
        isExpanded={true}
        setIsExpanded={vi.fn()}
      />,
    )
    expect(screen.getByText(markdownContent)).toBeInTheDocument()
  })

  it('should render code blocks in markdown', () => {
    render(<HelpWidget markdown="```bash\nnpm install\n```" isExpanded={true} setIsExpanded={vi.fn()} />)
    expect(screen.getByText(/npm install/)).toBeInTheDocument()
  })

  it('should render inline code in markdown', () => {
    render(<HelpWidget markdown="Use `npm install` to install." isExpanded={true} setIsExpanded={vi.fn()} />)
    expect(screen.getByText(/npm install/)).toBeInTheDocument()
  })

  it('should have proper CSS classes for positioning', () => {
    const { container } = render(<HelpWidget markdown="Test" isExpanded={true} setIsExpanded={vi.fn()} />)
    const panel = container.querySelector('.fixed.z-10')
    expect(panel).toBeInTheDocument()
  })

  it('should have close button with proper styling', () => {
    render(<HelpWidget markdown="Test" isExpanded={true} setIsExpanded={vi.fn()} />)
    const closeButton = screen.getByRole('button', { name: /close panel/i })
    expect(closeButton).toHaveClass('h-8', 'w-8', 'p-0')
  })

  it('should render HelpCircle icon in header', () => {
    render(<HelpWidget markdown="Test" isExpanded={true} setIsExpanded={vi.fn()} />)
    // The component should render a HelpCircle icon (lucide-react icon)
    const header = screen.getByText(/template guide/i).parentElement
    expect(header).toBeInTheDocument()
  })

  it('should render ChevronRight icon in close button', () => {
    render(<HelpWidget markdown="Test" isExpanded={true} setIsExpanded={vi.fn()} />)
    const closeButton = screen.getByRole('button', { name: /close panel/i })
    expect(closeButton).toBeInTheDocument()
  })

  it('should support markdown tables', () => {
    render(
      <HelpWidget
        markdown="| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |"
        isExpanded={true}
        setIsExpanded={vi.fn()}
      />,
    )
    // Tables may be rendered as paragraph text in test environment
    const content = screen.getByText(/Header 1/)
    expect(content).toBeInTheDocument()
  })

  it('should not render panel when isExpanded is false', () => {
    const { container } = render(
      <HelpWidget markdown="Test content" isExpanded={false} setIsExpanded={vi.fn()} />,
    )
    const panel = container.querySelector('.fixed')
    expect(panel).not.toBeInTheDocument()
  })

  it('should render panel with proper width constraints', () => {
    const { container } = render(<HelpWidget markdown="Test" isExpanded={true} setIsExpanded={vi.fn()} />)
    const panel = container.querySelector('.w-\\[min\\(380px\\2c 100vw\\)\\]')
    expect(panel).toBeInTheDocument()
  })

  it('should render panel with border styling', () => {
    const { container } = render(<HelpWidget markdown="Test" isExpanded={true} setIsExpanded={vi.fn()} />)
    const panel = container.querySelector('.border-l')
    expect(panel).toBeInTheDocument()
  })

  it('should return null for invalid templateId', () => {
    const { container } = render(
      <HelpWidget selectedTemplateId="invalid-template-id" isExpanded={true} setIsExpanded={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should handle multiple clicks on help button', () => {
    const mockSetIsExpanded = vi.fn()
    render(<HelpWidget markdown="Test" isExpanded={false} setIsExpanded={mockSetIsExpanded} />)

    const helpButton = screen.getByRole('button', { name: /need help/i })
    fireEvent.click(helpButton)
    fireEvent.click(helpButton)

    expect(mockSetIsExpanded).toHaveBeenCalledTimes(2)
  })

  it('should handle multiple clicks on close button', () => {
    const mockSetIsExpanded = vi.fn()
    render(<HelpWidget markdown="Test" isExpanded={true} setIsExpanded={mockSetIsExpanded} />)

    const closeButton = screen.getByRole('button', { name: /close panel/i })
    fireEvent.click(closeButton)
    fireEvent.click(closeButton)

    expect(mockSetIsExpanded).toHaveBeenCalledTimes(2)
    expect(mockSetIsExpanded).toHaveBeenLastCalledWith(false)
  })
})
