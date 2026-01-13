import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { MachineRestart } from './MachineRestart'

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, disabled, asChild, ...props }: any) =>
    React.createElement(
      'button',
      {
        onClick: onClick || (() => {}),
        className,
        variant,
        disabled,
        ...props,
      },
      children,
    ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => {
    return React.createElement('div', { 'data-testid': 'dialog' }, children)
  },
  DialogTrigger: ({ children, asChild, ...props }: any) => {
    const child = React.Children.only(children)
    return React.cloneElement(child, {
      ...props,
      'data-testid': 'dialog-trigger',
    })
  },
  DialogContent: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'dialog-content' }, children),
  DialogHeader: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-header' }, children),
  DialogTitle: ({ children }: any) => React.createElement('h2', { 'data-testid': 'dialog-title' }, children),
  DialogDescription: ({ children }: any) =>
    React.createElement('p', { 'data-testid': 'dialog-description' }, children),
  DialogFooter: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-footer' }, children),
  DialogClose: ({ children, asChild, onClick, ...props }: any) => {
    const child = React.Children.only(children)
    return React.cloneElement(child, {
      ...props,
      'data-testid': 'dialog-close',
      onClick: onClick,
    })
  },
}))

vi.mock('lucide-react', () => ({
  RotateCcw: () => React.createElement('span', { 'data-testid': 'rotate-ccw-icon' }, 'Restart Icon'),
}))

describe('MachineRestart', () => {
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    expect(MachineRestart).toBeDefined()
  })

  it('should render without crashing', () => {
    const { container } = render(<MachineRestart onConfirm={mockOnConfirm} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render restart button', () => {
    render(<MachineRestart onConfirm={mockOnConfirm} />)

    expect(screen.getByText('Restart')).toBeInTheDocument()
    expect(screen.getByTestId('rotate-ccw-icon')).toBeInTheDocument()
  })

  it('should disable restart button when disabled prop is true', () => {
    render(<MachineRestart onConfirm={mockOnConfirm} disabled={true} />)

    const restartButton = screen.getByRole('button', { name: /Restart/ })
    expect(restartButton).toBeDisabled()
  })

  it('should not disable restart button when disabled prop is false or undefined', () => {
    render(<MachineRestart onConfirm={mockOnConfirm} disabled={false} />)

    const restartButton = screen.getByRole('button', { name: /Restart/ })
    expect(restartButton).not.toBeDisabled()
  })

  it('should render dialog with correct title and description', () => {
    render(<MachineRestart onConfirm={mockOnConfirm} />)

    expect(screen.getByText('Restart machine')).toBeInTheDocument()
    expect(
      screen.getByText('The machine and your app will be unavailable during the restart process.'),
    ).toBeInTheDocument()
  })

  it('should render cancel button in dialog', () => {
    render(<MachineRestart onConfirm={mockOnConfirm} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should not call onConfirm when cancel button is clicked', () => {
    render(<MachineRestart onConfirm={mockOnConfirm} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)

    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('should render button with outline variant', () => {
    const { container } = render(<MachineRestart onConfirm={mockOnConfirm} />)

    const button = screen.getByRole('button', { name: /Restart/ })
    expect(button).toHaveAttribute('variant', 'outline')
  })
})
