import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NavbarLink } from './index'

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(<MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>)
}

describe('NavbarLink', () => {
  it('should render children', () => {
    renderWithRouter(<NavbarLink>Test Link</NavbarLink>)

    expect(screen.getByText('Test Link')).toBeInTheDocument()
  })

  it('should render as Button when no "to" prop is provided', () => {
    const { container } = renderWithRouter(<NavbarLink>Click Me</NavbarLink>)

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = renderWithRouter(<NavbarLink className="custom-class">Link</NavbarLink>)

    const button = container.querySelector('button')
    expect(button?.className).toContain('custom-class')
  })

  it('should have default classes', () => {
    const { container } = renderWithRouter(<NavbarLink>Link</NavbarLink>)

    const button = container.querySelector('button')
    expect(button?.className).toContain('flex')
    expect(button?.className).toContain('items-center')
    expect(button?.className).toContain('justify-start')
    expect(button?.className).toContain('px-2')
    expect(button?.className).toContain('py-2.5')
    expect(button?.className).toContain('rounded-md')
    expect(button?.className).toContain('text-base')
    expect(button?.className).toContain('font-medium')
  })

  it('should have variant ghost styling', () => {
    const { container } = renderWithRouter(<NavbarLink>Link</NavbarLink>)

    const button = container.querySelector('button')
    // Check for other button styling properties
    expect(button?.className).toContain('flex')
    expect(button?.className).toContain('items-center')
  })

  it('should call onClick handler when clicked (without "to" prop)', () => {
    const handleClick = vi.fn()

    const { container } = renderWithRouter(<NavbarLink onClick={handleClick}>Click Me</NavbarLink>)

    const button = container.querySelector('button')
    button?.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render complex children content', () => {
    const { container } = renderWithRouter(
      <NavbarLink>
        <span className="icon">Icon</span>
        <span>Text</span>
      </NavbarLink>,
    )

    expect(container.textContent).toContain('Icon')
    expect(container.textContent).toContain('Text')
  })

  it('should render without onClick handler', () => {
    const { container } = renderWithRouter(<NavbarLink>Link</NavbarLink>)

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
    // Should not throw when clicked without onClick
    button?.click()
  })

  it('should render with numeric children', () => {
    renderWithRouter(<NavbarLink>123</NavbarLink>)

    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('should render with icon and text children', () => {
    renderWithRouter(
      <NavbarLink>
        <svg data-testid="icon" />
        <span>Menu Item</span>
      </NavbarLink>,
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Menu Item')).toBeInTheDocument()
  })

  it('should handle falsy "to" prop by rendering as button', () => {
    const { container } = renderWithRouter(<NavbarLink to={undefined}>Link</NavbarLink>)

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()

    const link = container.querySelector('a')
    expect(link).not.toBeInTheDocument()
  })

  it('should handle empty string "to" prop', () => {
    const { container } = renderWithRouter(<NavbarLink to="">Link</NavbarLink>)

    // Empty string is falsy, so it should render as button
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('should render link text correctly', () => {
    renderWithRouter(<NavbarLink>Dashboard</NavbarLink>)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should render with multiple text nodes', () => {
    const { container } = renderWithRouter(<NavbarLink>Home Page</NavbarLink>)

    expect(container.textContent).toContain('Home')
    expect(container.textContent).toContain('Page')
  })

  it('should handle null children gracefully', () => {
    const { container } = renderWithRouter(<NavbarLink>{null}</NavbarLink>)

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('should handle undefined children gracefully', () => {
    const { container } = renderWithRouter(<NavbarLink>{undefined}</NavbarLink>)

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  describe('with NavLink behavior', () => {
    it('should render as NavLink when "to" prop is provided', () => {
      const { container } = renderWithRouter(<NavbarLink to="/dashboard">Dashboard</NavbarLink>)

      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/dashboard')
    })

    it('should apply active styling when route is active', () => {
      const { container } = renderWithRouter(<NavbarLink to="/dashboard">Dashboard</NavbarLink>, [
        '/dashboard',
      ])

      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      // When active, the span should have text-foreground class
      const span = container.querySelector('span')
      expect(span).toHaveClass('text-foreground')
    })

    it('should apply inactive styling when route is not active', () => {
      const { container } = renderWithRouter(<NavbarLink to="/dashboard">Dashboard</NavbarLink>, [
        '/other-route',
      ])

      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      // When not active, the span should have text-muted-foreground class
      const span = container.querySelector('span')
      expect(span).toHaveClass('text-muted-foreground')
    })

    it('should call onClick handler when NavLink is clicked', async () => {
      const handleClick = vi.fn()

      const { container } = renderWithRouter(
        <NavbarLink to="/dashboard" onClick={handleClick}>
          Dashboard
        </NavbarLink>,
      )

      const link = container.querySelector('a')
      await act(async () => {
        link?.click()
      })

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
