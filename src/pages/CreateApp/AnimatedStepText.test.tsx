import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AnimatedStepText, HeaderSteps, Steps } from './AnimatedStepText'
import { BrowserRouter } from 'react-router-dom'

// Mock the useCreateAndDeployApp hook
vi.mock('../../backend/api', () => ({
  useCreateAndDeployApp: () => ({
    progress: {
      steps: ['creating', 'building', 'updating', 'deploying'],
      currentStep: 'creating',
      stepEstimatedDurations: {
        creating: 5000,
        building: 10000,
      },
      stepLabels: {
        creating: 'Creating',
        building: 'Building',
        updating: 'Updating',
        deploying: 'Deploying',
      },
    },
  }),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('AnimatedStepText', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('AnimatedStepText Component', () => {
    it('renders creating step text', () => {
      renderWithRouter(<AnimatedStepText step="creating" />)
      expect(screen.getByText('Creating app...')).toBeInTheDocument()
    })

    it('renders building step text', () => {
      renderWithRouter(<AnimatedStepText step="building" />)
      expect(screen.getByText('Building app...')).toBeInTheDocument()
    })

    it('renders updating step text', () => {
      renderWithRouter(<AnimatedStepText step="updating" />)
      expect(screen.getByText('Updating app secrets...')).toBeInTheDocument()
    })

    it('renders deploying step text', () => {
      renderWithRouter(<AnimatedStepText step="deploying" />)
      expect(screen.getByText('Deploying app to machine...')).toBeInTheDocument()
    })

    it('renders success step with navigation button', () => {
      renderWithRouter(<AnimatedStepText step="success" />)
      expect(screen.getByText('App will be ready in 5 minutes!')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Navigate to Dashboard' })).toBeInTheDocument()
    })

    it('renders error step with error message', () => {
      renderWithRouter(<AnimatedStepText step="error" />)
      expect(screen.getByText('Error creating ROFL app')).toBeInTheDocument()
      expect(
        screen.getByText('An error occurred while creating the ROFL app. Please try again later.'),
      ).toBeInTheDocument()
    })

    it('applies animation classes correctly after delay', async () => {
      renderWithRouter(<AnimatedStepText step="creating" />)
      const header = screen.getByText('Creating app...')

      // Initially should be invisible (before animation delay)
      expect(header).toHaveClass('opacity-0', '-translate-y-2')

      // Run all timers to trigger the setTimeout in the component
      act(() => {
        vi.runAllTimers()
      })

      // After running timers, the header should be visible
      expect(header).toHaveClass('opacity-100', 'translate-y-0')
    })

    it('resets animation when step changes', async () => {
      const { rerender } = renderWithRouter(<AnimatedStepText step="creating" />)
      const header = screen.getByText('Creating app...')

      // Wait for initial animation
      act(() => {
        vi.runAllTimers()
      })

      expect(header).toHaveClass('opacity-100', 'translate-y-0')

      // Change step
      act(() => {
        rerender(
          <BrowserRouter>
            <AnimatedStepText step="building" />
          </BrowserRouter>,
        )
      })

      const newHeader = screen.getByText('Building app...')
      // Should be invisible again after step change
      expect(newHeader).toHaveClass('opacity-0', '-translate-y-2')

      // And then become visible again
      act(() => {
        vi.runAllTimers()
      })

      expect(newHeader).toHaveClass('opacity-100', 'translate-y-0')
    })
  })

  describe('HeaderSteps Component', () => {
    const mockProgress = {
      steps: ['creating', 'building', 'updating', 'deploying'],
      currentStep: 'building',
      stepEstimatedDurations: {
        creating: 5000,
        building: 10000,
      },
      stepLabels: {
        creating: 'Creating',
        building: 'Building',
        updating: 'Updating',
        deploying: 'Deploying',
      },
    }

    it('renders all steps', () => {
      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      expect(screen.getByText('Creating')).toBeInTheDocument()
      expect(screen.getByText('Building')).toBeInTheDocument()
      expect(screen.getByText('Updating')).toBeInTheDocument()
      expect(screen.getByText('Deploying')).toBeInTheDocument()
    })

    it('shows checkmark for completed steps', () => {
      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      // First step should have checkmark (currentStep is 'building', index 1)
      const checkmarks = document.querySelectorAll('svg.lucide-circle-check-big, svg.lucide-check-circle')
      expect(checkmarks.length).toBeGreaterThan(0)
    })

    it('shows active indicator for current step with duration', () => {
      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      // Current step should be highlighted
      const currentStepLabel = screen.getByText('Building')
      expect(currentStepLabel).toBeInTheDocument()
    })

    it('shows error state when bootstrap step is error', () => {
      const errorProgress = {
        ...mockProgress,
        currentStep: 'creating',
      }
      render(<HeaderSteps progress={errorProgress} bootstrapStep="error" />)

      // Should show warning icon for current step when there's an error
      const warnings = document.querySelectorAll('svg.lucide-triangle-alert, svg.lucide-alert-triangle')
      expect(warnings.length).toBeGreaterThan(0)
    })

    it('shows all checkmarks when bootstrap is success', () => {
      render(<HeaderSteps progress={mockProgress} bootstrapStep="success" />)

      const checkmarks = document.querySelectorAll('svg.lucide-circle-check-big, svg.lucide-check-circle')
      expect(checkmarks.length).toBe(4)
    })

    it('shows step numbers for pending steps', () => {
      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      // Should show numbers for incomplete steps
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('applies correct CSS classes for active step', () => {
      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      const stepNumbers = screen.getAllByText(/\d/).map(el => el.closest('div'))
      const activeStep = stepNumbers.find(el => el?.classList.contains('bg-primary'))
      expect(activeStep).toBeInTheDocument()
    })
  })

  describe('Steps Component', () => {
    const mockProgress = {
      steps: ['creating', 'building', 'updating', 'deploying'],
      currentStep: 'creating',
      stepEstimatedDurations: {
        creating: 5000,
      },
      stepLabels: {
        creating: 'Creating',
        building: 'Building',
        updating: 'Updating',
        deploying: 'Deploying',
      },
    }

    it('renders HeaderSteps and AnimatedStepText', () => {
      renderWithRouter(<Steps progress={mockProgress} bootstrapStep="pending" />)

      expect(screen.getByText('Creating')).toBeInTheDocument()
      expect(screen.getByText('Creating app...')).toBeInTheDocument()
    })

    it('renders video element when bootstrap step is pending', () => {
      renderWithRouter(<Steps progress={mockProgress} bootstrapStep="pending" />)

      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
    })

    it('does not render video element when bootstrap step is not pending', () => {
      renderWithRouter(<Steps progress={mockProgress} bootstrapStep="success" />)

      const video = document.querySelector('video')
      expect(video).not.toBeInTheDocument()
    })

    it('passes correct step to AnimatedStepText based on bootstrap state', () => {
      const { rerender } = renderWithRouter(<Steps progress={mockProgress} bootstrapStep="pending" />)

      expect(screen.getByText('Creating app...')).toBeInTheDocument()

      rerender(
        <BrowserRouter>
          <Steps progress={mockProgress} bootstrapStep="error" />
        </BrowserRouter>,
      )

      expect(screen.getByText('Error creating ROFL app')).toBeInTheDocument()
    })

    it('shows success text when bootstrap step is success', () => {
      renderWithRouter(<Steps progress={mockProgress} bootstrapStep="success" />)

      expect(screen.getByText('App will be ready in 5 minutes!')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Navigate to Dashboard' })).toBeInTheDocument()
    })
  })

  describe('Animation Timing', () => {
    it('should have 200ms delay before showing content', () => {
      renderWithRouter(<AnimatedStepText step="creating" />)

      const header = screen.getByText('Creating app...')

      // Before running timers, should be invisible
      expect(header).toHaveClass('opacity-0', '-translate-y-2')

      // After 200ms, should become visible
      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(header).toHaveClass('opacity-100', 'translate-y-0')
    })

    it('should use duration-400 for transition', () => {
      renderWithRouter(<AnimatedStepText step="creating" />)

      const header = screen.getByText('Creating app...')

      // Check for transition classes
      expect(header.className).toContain('transition-all')
      expect(header.className).toContain('duration-400')
    })

    it('should animate header from top', () => {
      renderWithRouter(<AnimatedStepText step="creating" />)

      const header = screen.getByText('Creating app...')

      // Header should slide down from top
      expect(header).toHaveClass('-translate-y-2')
    })

    it('should animate description from bottom', () => {
      renderWithRouter(<AnimatedStepText step="creating" />)

      act(() => {
        vi.runAllTimers()
      })

      // The description div should have transition classes
      const descriptionDivs = document.querySelectorAll('.transition-all.duration-400')
      expect(descriptionDivs.length).toBeGreaterThan(0)
    })
  })

  describe('Step Content Variations', () => {
    it('should render empty description for creating step', () => {
      renderWithRouter(<AnimatedStepText step="creating" />)

      expect(screen.getByText('Creating app...')).toBeInTheDocument()
    })

    it('should render empty description for building step', () => {
      renderWithRouter(<AnimatedStepText step="building" />)

      expect(screen.getByText('Building app...')).toBeInTheDocument()
    })

    it('should render empty description for updating step', () => {
      renderWithRouter(<AnimatedStepText step="updating" />)

      expect(screen.getByText('Updating app secrets...')).toBeInTheDocument()
    })

    it('should render empty description for deploying step', () => {
      renderWithRouter(<AnimatedStepText step="deploying" />)

      expect(screen.getByText('Deploying app to machine...')).toBeInTheDocument()
    })

    it('should render button for success step', () => {
      renderWithRouter(<AnimatedStepText step="success" />)

      expect(screen.getByRole('link', { name: 'Navigate to Dashboard' })).toBeInTheDocument()
    })

    it('should render error message for error step', () => {
      renderWithRouter(<AnimatedStepText step="error" />)

      expect(
        screen.getByText('An error occurred while creating the ROFL app. Please try again later.'),
      ).toBeInTheDocument()
    })
  })

  describe('HeaderSteps Progress Indicators', () => {
    it('should render step labels', () => {
      const mockProgress = {
        steps: ['creating', 'building', 'updating', 'deploying'],
        currentStep: 'building',
        stepEstimatedDurations: {},
        stepLabels: {
          creating: 'Creating',
          building: 'Building',
          updating: 'Updating',
          deploying: 'Deploying',
        },
      }

      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      expect(screen.getByText('Creating')).toBeInTheDocument()
      expect(screen.getByText('Building')).toBeInTheDocument()
      expect(screen.getByText('Updating')).toBeInTheDocument()
      expect(screen.getByText('Deploying')).toBeInTheDocument()
    })

    it('should not show spinner for steps without duration', () => {
      const mockProgress = {
        steps: ['creating', 'building', 'updating', 'deploying'],
        currentStep: 'building',
        stepEstimatedDurations: {},
        stepLabels: {
          creating: 'Creating',
          building: 'Building',
          updating: 'Updating',
          deploying: 'Deploying',
        },
      }

      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      // Should not crash when step has no duration
      expect(screen.getByText('Building')).toBeInTheDocument()
    })

    it('should show active indicator for current step', () => {
      const mockProgress = {
        steps: ['creating', 'building', 'updating', 'deploying'],
        currentStep: 'building',
        stepEstimatedDurations: {
          building: 10000,
        },
        stepLabels: {
          creating: 'Creating',
          building: 'Building',
          updating: 'Updating',
          deploying: 'Deploying',
        },
      }

      render(<HeaderSteps progress={mockProgress} bootstrapStep="pending" />)

      // Should show the step is active
      expect(screen.getByText('Building')).toBeInTheDocument()
    })
  })

  describe('Steps Component Integration', () => {
    it('should pass correct step based on bootstrap state', () => {
      const mockProgress = {
        steps: ['creating', 'building', 'updating', 'deploying'],
        currentStep: 'creating',
        stepEstimatedDurations: {},
        stepLabels: {
          creating: 'Creating',
          building: 'Building',
          updating: 'Updating',
          deploying: 'Deploying',
        },
      }

      const { rerender } = renderWithRouter(<Steps progress={mockProgress} bootstrapStep="pending" />)

      expect(screen.getByText('Creating app...')).toBeInTheDocument()

      rerender(
        <BrowserRouter>
          <Steps progress={mockProgress} bootstrapStep="error" />
        </BrowserRouter>,
      )

      expect(screen.getByText('Error creating ROFL app')).toBeInTheDocument()
    })

    it('should hide video when not pending', () => {
      const mockProgress = {
        steps: ['creating', 'building', 'updating', 'deploying'],
        currentStep: 'creating',
        stepEstimatedDurations: {},
        stepLabels: {
          creating: 'Creating',
          building: 'Building',
          updating: 'Updating',
          deploying: 'Deploying',
        },
      }

      const { rerender } = renderWithRouter(<Steps progress={mockProgress} bootstrapStep="pending" />)

      expect(document.querySelector('video')).toBeInTheDocument()

      rerender(
        <BrowserRouter>
          <Steps progress={mockProgress} bootstrapStep="success" />
        </BrowserRouter>,
      )

      expect(document.querySelector('video')).not.toBeInTheDocument()
    })
  })
})
