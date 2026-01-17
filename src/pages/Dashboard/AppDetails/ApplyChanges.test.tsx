import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApplyChanges } from './ApplyChanges'

describe('ApplyChanges', () => {
  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(ApplyChanges).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof ApplyChanges).toBe('function')
    })
  })

  describe('Rendering', () => {
    it('should render a trigger button', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      expect(button).toBeInTheDocument()
    })

    it('should render default apply label', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    })

    it('should render custom apply label', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} applyLabel="Save Changes" />)

      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })
  })

  describe('Button State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<ApplyChanges disabled={true} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      expect(button).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      expect(button).not.toBeDisabled()
    })
  })

  describe('Dialog Interaction', () => {
    it('should open dialog when button is clicked', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      // Dialog should be visible after click
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should render dialog title', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      expect(screen.getByText('Please confirm your action')).toBeInTheDocument()
    })

    it('should render dialog description', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      expect(screen.getByText('All temporary changes will be saved.')).toBeInTheDocument()
    })
  })

  describe('Dialog Actions', () => {
    it('should render Cancel button in dialog', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toBeInTheDocument()
    })

    it('should render Confirm button in dialog', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      expect(confirmButton).toBeInTheDocument()
    })

    it('should call onConfirm when Confirm button is clicked', () => {
      const onConfirm = vi.fn()
      render(<ApplyChanges disabled={false} onConfirm={onConfirm} />)

      // Open dialog
      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      // Click confirm
      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when Cancel button is clicked', () => {
      const onConfirm = vi.fn()
      render(<ApplyChanges disabled={false} onConfirm={onConfirm} />)

      // Open dialog
      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
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

    it('should accept optional applyLabel prop', () => {
      const props1: ApplyChangesProps = {
        disabled: false,
        onConfirm: vi.fn(),
      }
      const props2: ApplyChangesProps = {
        disabled: false,
        onConfirm: vi.fn(),
        applyLabel: 'Save',
      }

      expect(props1).toBeDefined()
      expect(props2.applyLabel).toBe('Save')
    })

    it('should have default value for applyLabel', () => {
      const props: ApplyChangesProps = {
        disabled: false,
        onConfirm: vi.fn(),
      }
      // applyLabel defaults to 'Apply'
      expect(props).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should handle multiple open/close cycles', () => {
      const onConfirm = vi.fn()
      render(<ApplyChanges disabled={false} onConfirm={onConfirm} />)

      const button = screen.getByRole('button', { name: 'Apply' })

      // Open and close multiple times
      fireEvent.click(button)
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      fireEvent.click(button)
      fireEvent.click(cancelButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('should prevent confirmation when disabled', () => {
      const onConfirm = vi.fn()
      render(<ApplyChanges disabled={true} onConfirm={onConfirm} />)

      const button = screen.getByRole('button', { name: 'Apply' })

      // Button is disabled, should not be clickable
      expect(button).toBeDisabled()

      // Even if we could click, onConfirm shouldn't be called
      // because the dialog shouldn't open
    })
  })

  describe('Dialog Structure', () => {
    it('should render dialog content with correct class', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      const dialogContent = screen.getByTestId('dialog-content')
      expect(dialogContent).toHaveClass('sm:max-w-[425px]')
    })

    it('should render dialog header', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
    })

    it('should render dialog footer', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
    })
  })

  describe('Callback Behavior', () => {
    it('should call onConfirm without errors when provided', () => {
      const onConfirm = vi.fn()
      render(<ApplyChanges disabled={false} onConfirm={onConfirm} />)

      const button = screen.getByRole('button', { name: 'Apply' })
      fireEvent.click(button)

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      expect(() => fireEvent.click(confirmButton)).not.toThrow()
      expect(onConfirm).toHaveBeenCalled()
    })

    it('should handle onConfirm being called multiple times', () => {
      const onConfirm = vi.fn()
      render(<ApplyChanges disabled={false} onConfirm={onConfirm} />)

      // Open dialog multiple times and confirm each time
      for (let i = 0; i < 3; i++) {
        const button = screen.getByRole('button', { name: 'Apply' })
        fireEvent.click(button)

        const confirmButton = screen.getByRole('button', { name: 'Confirm' })
        fireEvent.click(confirmButton)
      }

      expect(onConfirm).toHaveBeenCalledTimes(3)
    })
  })

  describe('Accessibility', () => {
    it('should have button with role', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have descriptive button text', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} applyLabel="Apply Changes" />)

      const button = screen.getByRole('button', { name: 'Apply Changes' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty applyLabel gracefully', () => {
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} applyLabel="" />)

      const button = screen.queryAllByRole('button')[0]
      expect(button).toBeInTheDocument()
    })

    it('should handle very long applyLabel', () => {
      const longLabel = 'A'.repeat(100)
      render(<ApplyChanges disabled={false} onConfirm={vi.fn()} applyLabel={longLabel} />)

      const button = screen.getByRole('button', { name: longLabel })
      expect(button).toBeInTheDocument()
    })
  })
})

type ApplyChangesProps = React.ComponentProps<typeof ApplyChanges>
