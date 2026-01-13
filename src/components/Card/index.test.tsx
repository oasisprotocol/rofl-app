import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CardWrapper } from './index'

// Mock the UI library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={className}>{children}</h3>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={className}>{children}</p>
  ),
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, disabled, className, asChild, ...props }: any) => {
    const Comp = asChild ? children : 'button'
    if (asChild) {
      return <>{children}</>
    }
    return (
      <button disabled={disabled} className={className} {...props}>
        {children}
      </button>
    )
  },
}))

vi.mock('@oasisprotocol/ui-library/src/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}))

describe('CardWrapper Component', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>

  it('should render title and description', () => {
    const { container } = render(<CardWrapper title="Test Card" description="Test Description" />, {
      wrapper,
    })

    expect(container.textContent).toContain('Test Card')
    expect(container.textContent).toContain('Test Description')
  })

  it('should render link when "to" prop is provided', () => {
    const { container } = render(
      <CardWrapper title="Test Card" description="Test Description" to="/test" label="Go to test" />,
      { wrapper },
    )

    const link = container.querySelector('a')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(container.textContent).toContain('Go to test')
  })

  it('should render "Coming Soon" button when no "to" prop', () => {
    const { container } = render(<CardWrapper title="Test Card" description="Test Description" />, {
      wrapper,
    })

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
    expect(button?.textContent).toContain('Coming Soon')
    expect(button).toBeDisabled()
  })

  it('should render image when provided', () => {
    const { container } = render(
      <CardWrapper title="Test Card" description="Test Description" image="/test-image.jpg" />,
      { wrapper },
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test-image.jpg')
    expect(img).toHaveAttribute('alt', 'Test Card')
  })

  it('should apply correct base classes', () => {
    const { container } = render(<CardWrapper title="Test Card" description="Test Description" />, {
      wrapper,
    })

    const card = container.querySelector('.bg-zinc-900')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('p-6', 'rounded-md', 'relative', 'overflow-hidden')
  })

  it('should apply min-height when image is provided', () => {
    const { container } = render(
      <CardWrapper title="Test Card" description="Test Description" image="/test.jpg" />,
      { wrapper },
    )

    const card = container.querySelector('.bg-zinc-900')
    expect(card).toHaveClass('min-h-[300px]')
  })

  it('should not render link when "to" is not provided', () => {
    const { container } = render(<CardWrapper title="Test Card" description="Test Description" />, {
      wrapper,
    })

    expect(container.querySelector('a')).not.toBeInTheDocument()
  })

  it('should render ArrowRight icon when "to" is provided', () => {
    const { container } = render(
      <CardWrapper title="Test Card" description="Test Description" to="/test" label="View" />,
      { wrapper },
    )

    // The ArrowRight should be rendered within the link
    const link = container.querySelector('a')
    expect(link?.querySelector('svg')).toBeInTheDocument()
  })
})
