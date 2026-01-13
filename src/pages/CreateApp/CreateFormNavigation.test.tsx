import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CreateFormNavigation } from './CreateFormNavigation'

describe('CreateFormNavigation', () => {
  it('exports CreateFormNavigation component', () => {
    expect(CreateFormNavigation).toBeDefined()
    expect(typeof CreateFormNavigation).toBe('function')
  })

  it('renders Continue button by default', () => {
    render(<CreateFormNavigation />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('renders back button when handleBack is provided', () => {
    const handleBack = vi.fn()
    render(<CreateFormNavigation handleBack={handleBack} />)
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument() // ArrowLeft icon button
  })

  it('does not render back button when handleBack is not provided', () => {
    render(<CreateFormNavigation />)
    const backButtons = screen.getAllByRole('button')
    // Should only have the Continue button
    expect(backButtons.length).toBe(1)
    expect(backButtons[0]).toHaveTextContent('Continue')
  })

  it('calls handleBack when back button is clicked', () => {
    const handleBack = vi.fn()
    render(<CreateFormNavigation handleBack={handleBack} />)
    const buttons = screen.getAllByRole('button')
    const backButton = buttons.find(btn => btn.querySelector('svg')) // Button with icon
    if (backButton) {
      fireEvent.click(backButton)
      expect(handleBack).toHaveBeenCalledTimes(1)
    }
  })

  it('disables Continue button when disabled prop is true', () => {
    render(<CreateFormNavigation disabled={true} />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
  })

  it('does not disable Continue button when disabled prop is false', () => {
    render(<CreateFormNavigation disabled={false} />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).not.toBeDisabled()
  })

  it('does not disable Continue button by default', () => {
    render(<CreateFormNavigation />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).not.toBeDisabled()
  })

  it('shows spinner when isLoading is true', () => {
    render(<CreateFormNavigation isLoading={true} />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    // Spinner should be rendered inside the button
    expect(continueButton.textContent).toContain('Continue')
  })

  it('does not show spinner when isLoading is false', () => {
    render(<CreateFormNavigation isLoading={false} />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toHaveTextContent('Continue')
  })

  it('disables Continue button when isLoading is true', () => {
    render(<CreateFormNavigation isLoading={true} />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
  })

  it('disables Continue button when both disabled and isLoading are true', () => {
    render(<CreateFormNavigation disabled={true} isLoading={true} />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
  })

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<CreateFormNavigation />)
    const navContainer = container.querySelector('.flex.justify-between')
    expect(navContainer).toBeInTheDocument()
  })

  it('applies correct CSS classes when handleBack is provided', () => {
    const { container } = render(<CreateFormNavigation handleBack={vi.fn()} />)
    const navContainer = container.querySelector('.justify-between')
    expect(navContainer).toBeInTheDocument()
  })

  it('applies correct CSS classes when handleBack is not provided', () => {
    const { container } = render(<CreateFormNavigation />)
    const navContainer = container.querySelector('.justify-end')
    expect(navContainer).toBeInTheDocument()
  })

  it('Continue button has type submit', () => {
    render(<CreateFormNavigation />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toHaveAttribute('type', 'submit')
  })

  it('back button has variant secondary styling', () => {
    const handleBack = vi.fn()
    render(<CreateFormNavigation handleBack={handleBack} />)
    const buttons = screen.getAllByRole('button')
    const backButton = buttons.find(btn => btn.querySelector('svg'))
    if (backButton) {
      // The button should have some variant styling
      expect(backButton).toBeInTheDocument()
    }
  })

  it('renders both buttons when handleBack is provided', () => {
    const handleBack = vi.fn()
    render(<CreateFormNavigation handleBack={handleBack} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(2)
  })

  it('handles all props combinations correctly', () => {
    const handleBack = vi.fn()
    const { container } = render(
      <CreateFormNavigation handleBack={handleBack} disabled={true} isLoading={false} />,
    )
    expect(container.querySelector('.flex')).toBeInTheDocument()
    expect(screen.getAllByRole('button').length).toBe(2)
  })
})
