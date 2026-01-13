import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RemoveSecretDialog } from './RemoveSecretDialog'

describe('RemoveSecretDialog', () => {
  const mockHandleRemoveSecret = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dialog when open is true', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    const dialog = screen.getByTestId('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('should not render dialog content when open is false', () => {
    render(
      <RemoveSecretDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    const dialog = screen.getByTestId('dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  it('should display dialog title', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    expect(screen.getByText('Please confirm your action')).toBeInTheDocument()
  })

  it('should display secret key in description', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    // Check that the dialog description is rendered
    const description = screen.getByTestId('dialog-description')
    expect(description).toBeInTheDocument()
    // Check that the secret name is displayed in bold
    expect(screen.getByText('API_KEY')).toBeInTheDocument()
  })

  it('should display different secret keys', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="DATABASE_URL"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    expect(screen.getByText('DATABASE_URL')).toBeInTheDocument()
  })

  it('should render cancel button', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
  })

  it('should render confirm button', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton).toBeInTheDocument()
  })

  it('should call handleRemoveSecret with secret when confirm is clicked', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    expect(mockHandleRemoveSecret).toHaveBeenCalledTimes(1)
    expect(mockHandleRemoveSecret).toHaveBeenCalledWith('API_KEY')
  })

  it('should call handleRemoveSecret with different secret', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="DB_PASSWORD"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    expect(mockHandleRemoveSecret).toHaveBeenCalledWith('DB_PASSWORD')
  })

  it('should handle multiple secret removals', () => {
    const { rerender } = render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="SECRET1"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    fireEvent.click(screen.getByText('Confirm'))
    expect(mockHandleRemoveSecret).toHaveBeenCalledWith('SECRET1')

    rerender(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="SECRET2"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    fireEvent.click(screen.getByText('Confirm'))
    expect(mockHandleRemoveSecret).toHaveBeenCalledWith('SECRET2')
    expect(mockHandleRemoveSecret).toHaveBeenCalledTimes(2)
  })

  it('should not crash when handleRemoveSecret is undefined', () => {
    expect(() => {
      render(
        <RemoveSecretDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          secret="API_KEY"
          handleRemoveSecret={undefined as any}
        />,
      )
    }).not.toThrow()
  })

  it('should not crash when onOpenChange is undefined', () => {
    expect(() => {
      render(
        <RemoveSecretDialog
          open={true}
          onOpenChange={undefined as any}
          secret="API_KEY"
          handleRemoveSecret={mockHandleRemoveSecret}
        />,
      )
    }).not.toThrow()
  })

  it('should handle empty string secret', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret=""
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    // Check that the dialog description is rendered even with empty secret
    const description = screen.getByTestId('dialog-description')
    expect(description).toBeInTheDocument()
  })

  it('should handle special characters in secret name', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API-KEY_V2"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    expect(screen.getByText('API-KEY_V2')).toBeInTheDocument()

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    expect(mockHandleRemoveSecret).toHaveBeenCalledWith('API-KEY_V2')
  })

  it('should handle numeric secret name', () => {
    render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="123"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('should have correct dialog structure', () => {
    const { container } = render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    expect(container.querySelector('[data-testid="dialog"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="dialog-content"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="dialog-header"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="dialog-footer"]')).toBeInTheDocument()
  })

  it('should have proper styling class', () => {
    const { container } = render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    const dialogContent = container.querySelector('[data-testid="dialog-content"]')
    expect(dialogContent).toHaveClass('sm:max-w-[425px]')
  })

  it('should preserve secret name in description when it changes', () => {
    const { rerender } = render(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="API_KEY"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    expect(screen.getByText('API_KEY')).toBeInTheDocument()

    rerender(
      <RemoveSecretDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        secret="NEW_SECRET"
        handleRemoveSecret={mockHandleRemoveSecret}
      />,
    )

    expect(screen.getByText('NEW_SECRET')).toBeInTheDocument()
    expect(screen.queryByText('API_KEY')).not.toBeInTheDocument()
  })
})
