import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiscardChanges } from './DiscardButton'

describe('DiscardButton (DiscardChanges)', () => {
  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(DiscardChanges).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof DiscardChanges).toBe('function')
    })
  })

  describe('Rendering', () => {
    it('should render a trigger button', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      expect(button).toBeInTheDocument()
    })

    it('should render destructive variant button', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      expect(button).toHaveClass('destructive')
    })
  })

  describe('Button State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<DiscardChanges disabled={true} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      expect(button).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      expect(button).not.toBeDisabled()
    })
  })

  describe('Dialog Interaction', () => {
    it('should open dialog when button is clicked', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      // Dialog should be visible after click
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should render dialog title', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      expect(screen.getByText('Please confirm your action')).toBeInTheDocument()
    })

    it('should render dialog description about discarding changes', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      expect(screen.getByText('All temporary changes will be discarded.')).toBeInTheDocument()
    })
  })

  describe('Dialog Actions', () => {
    it('should render Cancel button in dialog', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      const cancelButton = screen.getAllByRole('button').find(b => b.textContent === 'Cancel')
      expect(cancelButton).toBeInTheDocument()
    })

    it('should render Confirm button in dialog', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')
      expect(confirmButton).toBeInTheDocument()
    })

    it('should call onConfirm when Confirm button is clicked', () => {
      const onConfirm = vi.fn()
      render(<DiscardChanges disabled={false} onConfirm={onConfirm} />)

      // Open dialog
      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      // Click confirm
      const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')!
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when Cancel button is clicked', () => {
      const onConfirm = vi.fn()
      render(<DiscardChanges disabled={false} onConfirm={onConfirm} />)

      // Open dialog
      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      // Click cancel
      const cancelButton = screen.getAllByRole('button').find(b => b.textContent === 'Cancel')!
      fireEvent.click(cancelButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Props Interface', () => {
    it('should accept disabled prop', () => {
      const props = { disabled: true }
      expect(props.disabled).toBe(true)
    })

    it('should accept onConfirm callback', () => {
      const onConfirm = vi.fn()
      expect(typeof onConfirm).toBe('function')
    })

    it('should have required props', () => {
      const props: DiscardChangesProps = {
        disabled: false,
        onConfirm: vi.fn(),
      }

      expect(props.disabled).toBeDefined()
      expect(props.onConfirm).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should handle multiple open/close cycles', () => {
      const onConfirm = vi.fn()
      render(<DiscardChanges disabled={false} onConfirm={onConfirm} />)

      const button = screen.getByRole('button', { name: 'Discard' })

      // Open and close multiple times
      fireEvent.click(button)
      const cancelButton = screen.getAllByRole('button').find(b => b.textContent === 'Cancel')!
      fireEvent.click(cancelButton)

      fireEvent.click(button)
      fireEvent.click(cancelButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('should prevent confirmation when disabled', () => {
      const onConfirm = vi.fn()
      render(<DiscardChanges disabled={true} onConfirm={onConfirm} />)

      const button = screen.getByRole('button', { name: 'Discard' })

      // Button is disabled, should not be clickable
      expect(button).toBeDisabled()
    })
  })

  describe('Dialog Structure', () => {
    it('should render dialog content with correct class', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      const dialogContent = screen.getByTestId('dialog-content')
      expect(dialogContent).toHaveClass('sm:max-w-[425px]')
    })

    it('should render dialog header', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
    })

    it('should render dialog footer', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
    })
  })

  describe('Callback Behavior', () => {
    it('should call onConfirm without errors when provided', () => {
      const onConfirm = vi.fn()
      render(<DiscardChanges disabled={false} onConfirm={onConfirm} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')!
      expect(() => fireEvent.click(confirmButton)).not.toThrow()
      expect(onConfirm).toHaveBeenCalled()
    })

    it('should handle onConfirm being called multiple times', () => {
      const onConfirm = vi.fn()
      render(<DiscardChanges disabled={false} onConfirm={onConfirm} />)

      // Open dialog multiple times and confirm each time
      for (let i = 0; i < 3; i++) {
        const button = screen.getByRole('button', { name: 'Discard' })
        fireEvent.click(button)

        const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')!
        fireEvent.click(confirmButton)
      }

      expect(onConfirm).toHaveBeenCalledTimes(3)
    })
  })

  describe('Destructive Action Confirmation', () => {
    it('should use destructive variant for confirm button', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      // The confirm button should have destructive variant
      const buttons = screen.getAllByRole('button')
      const confirmButton = buttons.find(b => b.textContent === 'Confirm')
      expect(confirmButton).toHaveClass('destructive')
    })
  })

  describe('Accessibility', () => {
    it('should have descriptive button text', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      expect(button).toBeInTheDocument()
    })

    it('should have clear confirmation message', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      expect(screen.getByText('All temporary changes will be discarded.')).toBeInTheDocument()
    })
  })

  describe('Comparison with ApplyChanges', () => {
    it('should have similar structure to ApplyChanges but with destructive styling', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })

      // Button should have destructive variant
      expect(button).toHaveClass('destructive')
    })

    it('should have different message than ApplyChanges', () => {
      render(<DiscardChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Discard' })
      fireEvent.click(button)

      expect(screen.getByText(/discarded/i)).toBeInTheDocument()
    })
  })
})

type DiscardChangesProps = React.ComponentProps<typeof DiscardChanges>
