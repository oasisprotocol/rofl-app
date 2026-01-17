import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotFound } from './index'

// Mock the child components
vi.mock('../ErrorDisplay', () => ({
  ErrorDisplay: ({ error, className }: { error: Error; className?: string }) => (
    <div data-testid="error-display" className={className}>
      <div data-testid="error-title">{error.message}</div>
    </div>
  ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ headerContent, footerContent, children }: any) => (
    <div data-testid="layout">
      <div data-testid="header">{headerContent}</div>
      <div data-testid="content">{children}</div>
      <div data-testid="footer">{footerContent}</div>
    </div>
  ),
}))

vi.mock('../Layout/Header', () => ({
  Header: () => <div data-testid="header-component">Header</div>,
}))

vi.mock('../Layout/Footer', () => ({
  Footer: () => <div data-testid="footer-component">Footer</div>,
}))

describe('NotFound', () => {
  it('should render without crashing', () => {
    render(<NotFound />)

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render Layout component', () => {
    render(<NotFound />)

    const layout = screen.getByTestId('layout')
    expect(layout).toBeInTheDocument()
  })

  it('should render Header component', () => {
    render(<NotFound />)

    const header = screen.getByTestId('header-component')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('Header')
  })

  it('should render Footer component', () => {
    render(<NotFound />)

    const footer = screen.getByTestId('footer-component')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent('Footer')
  })

  it('should render ErrorDisplay component', () => {
    render(<NotFound />)

    const errorDisplay = screen.getByTestId('error-display')
    expect(errorDisplay).toBeInTheDocument()
  })

  it('should pass correct className to ErrorDisplay', () => {
    render(<NotFound />)

    const errorDisplay = screen.getByTestId('error-display')
    expect(errorDisplay).toHaveClass('min-h-[700px]')
  })

  it('should display "Page Not Found" error message', () => {
    render(<NotFound />)

    const errorTitle = screen.getByTestId('error-title')
    expect(errorTitle).toHaveTextContent('page_does_not_exist')
  })

  it('should have correct component structure', () => {
    const { container: _container } = render(<NotFound />)

    const layout = screen.getByTestId('layout')
    expect(layout).toBeInTheDocument()

    const header = screen.getByTestId('header')
    expect(header).toBeInTheDocument()

    const content = screen.getByTestId('content')
    expect(content).toBeInTheDocument()

    const footer = screen.getByTestId('footer')
    expect(footer).toBeInTheDocument()
  })
})
