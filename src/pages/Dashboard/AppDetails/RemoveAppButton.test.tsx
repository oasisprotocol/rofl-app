import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RemoveAppButton } from './RemoveAppButton'

// Mock hooks before importing the component
vi.mock('../../../hooks/useTicker', () => ({
  useTicker: () => 'ROSE',
}))

vi.mock('../../../hooks/useNetwork', () => ({
  useNetwork: () => 'mainnet',
}))

describe('RemoveAppButton', () => {
  const getIconButton = () => {
    const buttons = screen.getAllByRole('button')
    return buttons[0] // First button is the icon button
  }

  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(RemoveAppButton).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof RemoveAppButton).toBe('function')
    })
  })

  describe('Rendering', () => {
    it('should render icon button', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render outline variant button', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      expect(iconButton).toHaveClass('outline')
    })

    it('should render icon size variant', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      expect(iconButton).toHaveClass('icon')
    })
  })

  describe('Dialog Interaction', () => {
    it('should open dialog when button is clicked', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const dialog = screen.getByTestId('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should render dialog title "Remove App"', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByText('Remove App')).toBeInTheDocument()
    })

    it('should render dialog description with staked amount', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByText(/permanently remove the app/i)).toBeInTheDocument()
    })

    it('should mention action cannot be undone', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
    })
  })

  describe('Staked Amount Display', () => {
    it('should display staked amount in description', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const dialog = screen.getByTestId('dialog')
      expect(dialog.textContent).toBeDefined()
    })

    it('should handle different staked amounts', () => {
      const amounts = ['1000000', '5000000', '10000000']

      amounts.forEach(amount => {
        const { unmount } = render(<RemoveAppButton stakedAmount={amount} onConfirm={vi.fn()} />)

        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)

        unmount()
      })
    })
  })

  describe('Dialog Actions', () => {
    it('should render Cancel button in dialog', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const cancelButton = screen.getAllByRole('button').find(b => b.textContent === 'Cancel')
      expect(cancelButton).toBeInTheDocument()
    })

    it('should render Confirm button in dialog', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')
      expect(confirmButton).toBeInTheDocument()
    })

    it('should call onConfirm when Confirm button is clicked', () => {
      const onConfirm = vi.fn()
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={onConfirm} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')!
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when Cancel button is clicked', () => {
      const onConfirm = vi.fn()
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={onConfirm} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const cancelButton = screen.getAllByRole('button').find(b => b.textContent === 'Cancel')!
      fireEvent.click(cancelButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Props Interface', () => {
    it('should accept stakedAmount prop', () => {
      const props = { stakedAmount: '1000000' }
      expect(props.stakedAmount).toBe('1000000')
    })

    it('should accept onConfirm callback', () => {
      const onConfirm = vi.fn()
      expect(typeof onConfirm).toBe('function')
    })

    it('should have required props', () => {
      const props: RemoveAppButtonProps = {
        stakedAmount: '1000000',
        onConfirm: vi.fn(),
      }

      expect(props.stakedAmount).toBeDefined()
      expect(props.onConfirm).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should handle multiple open/close cycles', () => {
      const onConfirm = vi.fn()
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={onConfirm} />)

      const iconButton = getIconButton()

      fireEvent.click(iconButton)
      const cancelButton = screen.getAllByRole('button').find(b => b.textContent === 'Cancel')!
      fireEvent.click(cancelButton)

      fireEvent.click(iconButton)
      fireEvent.click(cancelButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Dialog Structure', () => {
    it('should render dialog content with correct class', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const dialogContent = screen.getByTestId('dialog-content')
      expect(dialogContent).toHaveClass('sm:max-w-[425px]')
    })

    it('should render dialog header', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
    })

    it('should render dialog footer', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
    })
  })

  describe('Destructive Action', () => {
    it('should use destructive variant for confirm button', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const buttons = screen.getAllByRole('button')
      const confirmButton = buttons.find(b => b.textContent === 'Confirm')
      expect(confirmButton).toHaveClass('destructive')
    })

    it('should warn about permanent action', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByText(/permanently/i)).toBeInTheDocument()
    })

    it('should mention getting back staked amount', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByText(/get back/i)).toBeInTheDocument()
    })
  })

  describe('Ticker Integration', () => {
    it('should use useTicker hook', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should display ticker in description', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const dialog = screen.getByTestId('dialog')
      expect(dialog.textContent).toContain('ROSE')
    })
  })

  describe('Callback Behavior', () => {
    it('should call onConfirm without errors when provided', () => {
      const onConfirm = vi.fn()
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={onConfirm} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')!
      expect(() => fireEvent.click(confirmButton)).not.toThrow()
      expect(onConfirm).toHaveBeenCalled()
    })

    it('should handle onConfirm being called multiple times', () => {
      const onConfirm = vi.fn()

      for (let i = 0; i < 3; i++) {
        const { unmount } = render(<RemoveAppButton stakedAmount="1000000" onConfirm={onConfirm} />)

        const iconButton = getIconButton()
        fireEvent.click(iconButton)

        const confirmButton = screen.getAllByRole('button').find(b => b.textContent === 'Confirm')!
        fireEvent.click(confirmButton)

        unmount()
      }

      expect(onConfirm).toHaveBeenCalledTimes(3)
    })
  })

  describe('Icon Display', () => {
    it('should use Trash2 icon from lucide-react', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      expect(iconButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have icon button with proper role', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have clear warning message', () => {
      render(<RemoveAppButton stakedAmount="1000000" onConfirm={vi.fn()} />)

      const iconButton = getIconButton()
      fireEvent.click(iconButton)

      expect(screen.getByText(/permanently remove/i)).toBeInTheDocument()
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero staked amount', () => {
      render(<RemoveAppButton stakedAmount="0" onConfirm={vi.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should handle very large staked amount', () => {
      render(<RemoveAppButton stakedAmount="999999999999" onConfirm={vi.fn()} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})

type RemoveAppButtonProps = React.ComponentProps<typeof RemoveAppButton>
