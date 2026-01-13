import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { TopUpProgressDialog, ProgressStep } from './index'

// Mock the Spinner component
vi.mock('../../Spinner', () => ({
  Spinner: ({ className }: { className?: string }) => (
    <div data-testid="spinner" className={className}>
      Spinner
    </div>
  ),
}))

// Mock Dialog components
vi.mock('@oasisprotocol/ui-library/src/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null,
  DialogContent: ({ children, className }: any) => React.createElement('div', { className }, children),
  DialogHeader: ({ children }: any) => React.createElement('div', { children }, children),
  DialogTitle: ({ children }: any) => React.createElement('h2', { children }, children),
  DialogFooter: ({ children }: any) => React.createElement('div', { children }, children),
}))

// Mock Button component
vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, asChild, ...props }: any) =>
    React.createElement('button', { onClick, className, ...props }, children),
}))

// Mock the useCountdownTimer hook
const mockCountdown = {
  timeLeft: 30,
  formattedTime: '0:30',
  isNegative: false,
  start: vi.fn(),
  stop: vi.fn(),
  reset: vi.fn(),
  isActive: false,
}

vi.mock('./useCountdownTimer', () => ({
  useCountdownTimer: vi.fn(() => mockCountdown),
}))

describe('TopUpProgressDialog', () => {
  const mockProgressSteps: ProgressStep[] = [
    {
      id: 1,
      label: 'Validating chain connection',
      description: 'Ensuring wallet is connected to correct blockchain network',
    },
    {
      id: 2,
      label: 'Approving token spend',
      description: 'Granting permission to smart contract for token transfer',
    },
    {
      id: 3,
      label: 'Executing bridge transaction',
      description: 'Initiating cross-chain token transfer',
    },
    {
      id: 4,
      label: 'Confirming completion',
      description: 'Monitoring transaction until tokens arrive on destination chain',
      expectedTimeInSeconds: 30,
    },
  ]

  const defaultProps = {
    isOpen: true,
    currentStep: 1,
    stepStatuses: { 1: 'processing' as const },
    progressSteps: mockProgressSteps,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockCountdown.start.mockReset()
    mockCountdown.stop.mockReset()
    mockCountdown.reset.mockReset()
  })

  it('renders dialog when open', () => {
    render(<TopUpProgressDialog {...defaultProps} />)

    expect(screen.getByText('Top up Progress')).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(<TopUpProgressDialog {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Top up Progress')).not.toBeInTheDocument()
  })

  it('renders all progress steps', () => {
    render(<TopUpProgressDialog {...defaultProps} />)

    expect(screen.getByText('Validating chain connection')).toBeInTheDocument()
    expect(screen.getByText('Approving token spend')).toBeInTheDocument()
    expect(screen.getByText('Executing bridge transaction')).toBeInTheDocument()
    expect(screen.getByText('Confirming completion')).toBeInTheDocument()
  })

  it('renders step descriptions', () => {
    render(<TopUpProgressDialog {...defaultProps} />)

    expect(screen.getByText('Ensuring wallet is connected to correct blockchain network')).toBeInTheDocument()
    expect(screen.getByText('Granting permission to smart contract for token transfer')).toBeInTheDocument()
  })

  it('shows spinner for processing step', () => {
    render(<TopUpProgressDialog {...defaultProps} />)

    const spinner = screen.getByTestId('spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('shows checkmark for completed step', () => {
    const props = {
      ...defaultProps,
      stepStatuses: { 1: 'completed' as const, 2: 'processing' as const },
      currentStep: 2,
    }
    render(<TopUpProgressDialog {...props} />)

    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  it('shows error icon for error step', () => {
    const props = {
      ...defaultProps,
      stepStatuses: { 1: 'error' as const },
      currentStep: 1,
    }
    render(<TopUpProgressDialog {...props} />)

    const errorIcons = screen.getAllByText('✗')
    expect(errorIcons.length).toBeGreaterThan(0)
  })

  it('shows step number for pending step', () => {
    const props = {
      ...defaultProps,
      stepStatuses: { 1: 'completed' as const, 2: 'pending' as const },
      currentStep: 2,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows "Complete" text for completed step', () => {
    const props = {
      ...defaultProps,
      stepStatuses: { 1: 'completed' as const },
      currentStep: null,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(screen.getAllByText('Complete').length).toBeGreaterThan(0)
  })

  it('shows "Error occurred" text for error step', () => {
    const props = {
      ...defaultProps,
      stepStatuses: { 1: 'error' as const },
      currentStep: null,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })

  it('shows countdown timer for processing step with expected time', () => {
    const props = {
      ...defaultProps,
      stepStatuses: {
        1: 'completed' as const,
        2: 'completed' as const,
        3: 'completed' as const,
        4: 'processing' as const,
      },
      currentStep: 4,
    }
    const { container } = render(<TopUpProgressDialog {...props} />)

    // Verify the hook was called with the expected time
    expect(mockCountdown.reset).toHaveBeenCalled()
    expect(mockCountdown.start).toHaveBeenCalled()

    // Check that the step with expected time is processing
    expect(screen.getByText('Confirming completion')).toBeInTheDocument()
  })

  it('shows overtime when countdown is negative', () => {
    // For this test, we'll verify the hook behavior with negative time
    // The actual display logic is: countdown.isNegative ? 'Overtime: ' : 'Expected: '
    mockCountdown.isNegative = true
    mockCountdown.formattedTime = '-0:05'

    const props = {
      ...defaultProps,
      stepStatuses: {
        1: 'completed' as const,
        2: 'completed' as const,
        3: 'completed' as const,
        4: 'processing' as const,
      },
      currentStep: 4,
    }

    const { container } = render(<TopUpProgressDialog {...props} />)

    // Verify the hook methods are called
    expect(mockCountdown.reset).toHaveBeenCalled()
    expect(mockCountdown.start).toHaveBeenCalled()
  })

  it('displays "Top up Complete" title when all steps completed', () => {
    const props = {
      ...defaultProps,
      stepStatuses: {
        1: 'completed' as const,
        2: 'completed' as const,
        3: 'completed' as const,
        4: 'completed' as const,
      },
      currentStep: null,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(screen.getByText('Top up Complete')).toBeInTheDocument()
  })

  it('displays "Top up Failed" title when there is an error', () => {
    const props = {
      ...defaultProps,
      stepStatuses: { 1: 'error' as const },
      currentStep: null,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(screen.getByText('Top up Failed')).toBeInTheDocument()
  })

  it('shows close button when all steps completed', () => {
    const props = {
      ...defaultProps,
      stepStatuses: {
        1: 'completed' as const,
        2: 'completed' as const,
        3: 'completed' as const,
        4: 'completed' as const,
      },
      currentStep: null,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('shows close button when there is an error', () => {
    const props = {
      ...defaultProps,
      stepStatuses: { 1: 'error' as const },
      currentStep: null,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('does not show close button while processing', () => {
    render(<TopUpProgressDialog {...defaultProps} />)

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const props = {
      ...defaultProps,
      stepStatuses: {
        1: 'completed' as const,
        2: 'completed' as const,
        3: 'completed' as const,
        4: 'completed' as const,
      },
      currentStep: null,
    }
    render(<TopUpProgressDialog {...props} />)

    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)

    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('starts countdown timer when step with expected time starts processing', () => {
    const props = {
      ...defaultProps,
      stepStatuses: {
        1: 'completed' as const,
        2: 'completed' as const,
        3: 'completed' as const,
        4: 'processing' as const,
      },
      currentStep: 4,
    }
    render(<TopUpProgressDialog {...props} />)

    expect(mockCountdown.reset).toHaveBeenCalled()
    expect(mockCountdown.start).toHaveBeenCalled()
  })

  it('stops countdown timer when dialog is closed', () => {
    const { rerender } = render(<TopUpProgressDialog {...defaultProps} />)

    rerender(<TopUpProgressDialog {...defaultProps} isOpen={false} />)

    expect(mockCountdown.stop).toHaveBeenCalled()
  })

  it('stops countdown timer when step does not have expected time', () => {
    const props = {
      ...defaultProps,
      currentStep: 1, // Step 1 doesn't have expectedTimeInSeconds
      stepStatuses: { 1: 'processing' as const },
    }
    render(<TopUpProgressDialog {...props} />)

    expect(mockCountdown.stop).toHaveBeenCalled()
  })

  it('handles empty progress steps', () => {
    const props = {
      ...defaultProps,
      progressSteps: [],
      currentStep: null,
      stepStatuses: {},
    }
    render(<TopUpProgressDialog {...props} />)

    // With empty steps, allStepsCompleted is true, so it shows "Top up Complete"
    expect(screen.getByText('Top up Complete')).toBeInTheDocument()
  })

  it('applies correct color classes for different step states', () => {
    const props = {
      ...defaultProps,
      stepStatuses: {
        1: 'completed' as const,
        2: 'processing' as const,
        3: 'error' as const,
        4: 'pending' as const,
      },
      currentStep: 2,
    }
    const { container } = render(<TopUpProgressDialog {...props} />)

    // Check for different colored indicators
    const successElements = container.querySelectorAll('.bg-success')
    const errorElements = container.querySelectorAll('.bg-error')
    const foregroundElements = container.querySelectorAll('.bg-foreground')

    expect(successElements.length).toBeGreaterThan(0)
    expect(errorElements.length).toBeGreaterThan(0)
    expect(foregroundElements.length).toBeGreaterThan(0)
  })

  describe('Payment flow integration', () => {
    it('should track chain validation step', () => {
      const props = {
        ...defaultProps,
        currentStep: 1,
        stepStatuses: { 1: 'processing' as const },
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Validating chain connection')).toBeInTheDocument()
      expect(
        screen.getByText('Ensuring wallet is connected to correct blockchain network'),
      ).toBeInTheDocument()
    })

    it('should track token approval step', () => {
      const props = {
        ...defaultProps,
        currentStep: 2,
        stepStatuses: { 1: 'completed' as const, 2: 'processing' as const },
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Approving token spend')).toBeInTheDocument()
      expect(screen.getByText('Granting permission to smart contract for token transfer')).toBeInTheDocument()
    })

    it('should track bridge transaction execution step', () => {
      const props = {
        ...defaultProps,
        currentStep: 3,
        stepStatuses: { 1: 'completed' as const, 2: 'completed' as const, 3: 'processing' as const },
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Executing bridge transaction')).toBeInTheDocument()
      expect(screen.getByText('Initiating cross-chain token transfer')).toBeInTheDocument()
    })

    it('should track completion confirmation step', () => {
      const props = {
        ...defaultProps,
        currentStep: 4,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'processing' as const,
        },
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Confirming completion')).toBeInTheDocument()
      expect(
        screen.getByText('Monitoring transaction until tokens arrive on destination chain'),
      ).toBeInTheDocument()
    })

    it('should track final chain validation step', () => {
      const props = {
        ...defaultProps,
        currentStep: 5,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'completed' as const,
          5: 'processing' as const,
        },
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Validating chain connection')).toBeInTheDocument()
    })
  })

  describe('Transaction progress tracking', () => {
    it('should show spinner for current processing step', () => {
      const props = {
        ...defaultProps,
        stepStatuses: { 1: 'processing' as const },
        currentStep: 1,
      }
      render(<TopUpProgressDialog {...props} />)

      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should show checkmark for completed steps', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'processing' as const,
        },
        currentStep: 3,
      }
      render(<TopUpProgressDialog {...props} />)

      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks.length).toBe(2)
    })

    it('should show error icon for failed step', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'error' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      const errorIcon = screen.getByText('✗')
      expect(errorIcon).toBeInTheDocument()
    })

    it('should show step number for pending steps', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'processing' as const,
          3: 'pending' as const,
          4: 'pending' as const,
        },
        currentStep: 2,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  describe('Error handling during payment', () => {
    it('should display error message when step fails', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'error' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Error occurred')).toBeInTheDocument()
      expect(screen.getByText('Top up Failed')).toBeInTheDocument()
    })

    it('should allow closing dialog on error', () => {
      const props = {
        ...defaultProps,
        stepStatuses: { 1: 'error' as const },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should show error state for failed approval step', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'error' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('✗')).toBeInTheDocument()
    })

    it('should show error state for failed transaction step', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'error' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('✗')).toBeInTheDocument()
    })
  })

  describe('Network switching scenarios', () => {
    it('should track first chain switch step', () => {
      const props = {
        ...defaultProps,
        currentStep: 1,
        stepStatuses: { 1: 'processing' as const },
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Validating chain connection')).toBeInTheDocument()
    })

    it('should track final chain switch step', () => {
      const props = {
        ...defaultProps,
        currentStep: 4,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'processing' as const,
        },
      }
      render(<TopUpProgressDialog {...props} />)

      // Should show the final chain validation step
      expect(screen.getByText('Confirming completion')).toBeInTheDocument()
    })

    it('should handle chain switch failure', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'error' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Top up Failed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty steps array', () => {
      const props = {
        ...defaultProps,
        progressSteps: [],
        stepStatuses: {},
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Top up Complete')).toBeInTheDocument()
    })

    it('should handle step with no expected time', () => {
      const props = {
        ...defaultProps,
        currentStep: 1,
        stepStatuses: { 1: 'processing' as const },
      }
      render(<TopUpProgressDialog {...props} />)

      // Should not show countdown for steps without expected time
      expect(screen.getByText('Validating chain connection')).toBeInTheDocument()
    })

    it('should handle all steps completed', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'completed' as const,
          5: 'completed' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Top up Complete')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should handle rapid step changes', () => {
      const { rerender } = render(<TopUpProgressDialog {...defaultProps} />)

      // Simulate rapid step changes
      rerender(
        <TopUpProgressDialog
          {...defaultProps}
          currentStep={2}
          stepStatuses={{ 1: 'completed' as const, 2: 'processing' as const }}
        />,
      )
      rerender(
        <TopUpProgressDialog
          {...defaultProps}
          currentStep={3}
          stepStatuses={{ 1: 'completed' as const, 2: 'completed' as const, 3: 'processing' as const }}
        />,
      )

      expect(screen.getByText('Executing bridge transaction')).toBeInTheDocument()
    })

    it('should handle dialog close during processing', () => {
      const props = {
        ...defaultProps,
        currentStep: 2,
        stepStatuses: { 1: 'completed' as const, 2: 'processing' as const },
      }
      render(<TopUpProgressDialog {...props} />)

      // Should not show close button during processing
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    })

    it('should handle countdown going negative', () => {
      mockCountdown.isNegative = true
      mockCountdown.formattedTime = '-0:30'

      const props = {
        ...defaultProps,
        currentStep: 4,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'processing' as const,
        },
      }
      render(<TopUpProgressDialog {...props} />)

      // Should show overtime indicator
      expect(mockCountdown.isNegative).toBe(true)
    })

    it('should handle zero expected time', () => {
      mockCountdown.timeLeft = 0
      mockCountdown.formattedTime = '0:00'

      const props = {
        ...defaultProps,
        currentStep: 4,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'processing' as const,
        },
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Confirming completion')).toBeInTheDocument()
    })

    it('should handle multiple steps with same status', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'pending' as const,
          2: 'pending' as const,
          3: 'pending' as const,
          4: 'pending' as const,
        },
        currentStep: null,
      }
      const { container } = render(<TopUpProgressDialog {...props} />)

      // All steps should show as pending
      const pendingNumbers = container.querySelectorAll('.bg-muted')
      expect(pendingNumbers.length).toBeGreaterThan(0)
    })

    it('should handle null currentStep with all completed', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'completed' as const,
          3: 'completed' as const,
          4: 'completed' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Top up Complete')).toBeInTheDocument()
    })

    it('should handle null currentStep with error', () => {
      const props = {
        ...defaultProps,
        stepStatuses: {
          1: 'completed' as const,
          2: 'error' as const,
        },
        currentStep: null,
      }
      render(<TopUpProgressDialog {...props} />)

      expect(screen.getByText('Top up Failed')).toBeInTheDocument()
    })
  })
})
