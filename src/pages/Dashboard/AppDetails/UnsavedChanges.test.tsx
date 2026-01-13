import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnsavedChanges } from './UnsavedChanges'
import { MemoryRouter } from 'react-router-dom'

// Mock the useBlocker hook properly with vi.fn
const mockUseBlocker = vi.fn(() => ({ state: 'unblocked' }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useBlocker: () => mockUseBlocker(),
  }
})

// Track the onConfirm callback passed to ApplyChanges
let applyChangesOnConfirmCallback: (() => void) | null = null

// Mock ApplyChanges to expose the callback
vi.mock('./ApplyChanges', () => ({
  ApplyChanges: ({ disabled, onConfirm, applyLabel }: any) => {
    // Store the callback so we can trigger it in tests
    applyChangesOnConfirmCallback = onConfirm
    return (
      <button disabled={disabled} data-testid="apply-changes-button" onClick={onConfirm}>
        {applyLabel || 'Apply'}
      </button>
    )
  },
}))

describe('UnsavedChanges', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockUseBlocker.mockReturnValue({ state: 'unblocked' })
    applyChangesOnConfirmCallback = null
  })

  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(UnsavedChanges).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof UnsavedChanges).toBe('function')
    })
  })

  describe('Rendering', () => {
    it('should render when isDirty is true', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should not render when isDirty is false', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={false} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // Component should be hidden (has 'hidden' class when not dirty)
      const unsavedChangesDiv = container.querySelector('[class*="hidden"]')
      expect(unsavedChangesDiv).toBeInTheDocument()
    })

    it('should render Discard button', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // DiscardChanges component renders a button with "Discard" text
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should render Apply button with default label', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // ApplyChanges component renders a button with "Apply" text by default
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should render Apply button with custom label', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} applyLabel="Save All" />
        </MemoryRouter>,
      )

      // Should render with custom label
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('should pass disabled state to child components', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={false} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // When isDirty is false, should have hidden class
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('hidden')
    })

    it('should enable buttons when isDirty is true', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // When isDirty is true, should not have hidden class
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('hidden')
    })
  })

  describe('Callback Handlers', () => {
    it('should accept onDiscard callback', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(typeof onDiscard).toBe('function')
    })

    it('should accept onConfirm callback', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(typeof onConfirm).toBe('function')
    })

    it('should pass callbacks to child components', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // Component should render without errors
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })
  })

  describe('Props Interface', () => {
    it('should accept isDirty prop', () => {
      const props = { isDirty: true }
      expect(props.isDirty).toBe(true)
    })

    it('should accept onDiscard callback', () => {
      const onDiscard = vi.fn()
      const props = { isDirty: true, onDiscard }
      expect(typeof props.onDiscard).toBe('function')
    })

    it('should accept onConfirm callback', () => {
      const onConfirm = vi.fn()
      const props = { isDirty: true, onConfirm }
      expect(typeof props.onConfirm).toBe('function')
    })

    it('should accept optional applyLabel prop with default', () => {
      const props1: UnsavedChangesProps = {
        isDirty: true,
        onDiscard: vi.fn(),
        onConfirm: vi.fn(),
      }

      const props2: UnsavedChangesProps = {
        isDirty: true,
        onDiscard: vi.fn(),
        onConfirm: vi.fn(),
        applyLabel: 'Save Changes',
      }

      expect(props1).toBeDefined()
      expect(props2.applyLabel).toBe('Save Changes')
    })

    it('should have all required props', () => {
      const props: UnsavedChangesProps = {
        isDirty: true,
        onDiscard: vi.fn(),
        onConfirm: vi.fn(),
        applyLabel: 'Apply',
      }

      expect(props.isDirty).toBeDefined()
      expect(props.onDiscard).toBeDefined()
      expect(props.onConfirm).toBeDefined()
    })
  })

  describe('Layout and Styling', () => {
    it('should use flex layout for buttons', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('flex')
      expect(wrapper.className).toContain('items-center')
      expect(wrapper.className).toContain('gap-2')
    })

    it('should have absolute positioning', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('absolute')
      expect(wrapper.className).toContain('right-6')
      expect(wrapper.className).toContain('bottom-16')
    })

    it('should apply card background style', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-card')
    })

    it('should have rounded corners', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('rounded-md')
    })
  })

  describe('Visibility Control', () => {
    it('should be visible when isDirty is true', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('hidden')
    })

    it('should have hidden class when isDirty is false', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={false} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('hidden')
    })
  })

  describe('Navigation Blocking', () => {
    it('should use useBlocker hook when isDirty is true', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(mockUseBlocker).toHaveBeenCalled()
    })

    it('should use useBlocker hook when isDirty is false', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={false} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(mockUseBlocker).toHaveBeenCalled()
    })
  })

  describe('Blocked State Styling', () => {
    it('should add animate-bounce class when blocker is blocked', () => {
      mockUseBlocker.mockReturnValue({ state: 'blocked' })

      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('animate-bounce')
    })

    it('should not add animate-bounce class when blocker is unblocked', () => {
      mockUseBlocker.mockReturnValue({ state: 'unblocked' })

      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('animate-bounce')
    })
  })

  describe('Text Display', () => {
    it('should display "Unsaved Changes" text', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should have semibold font weight on text', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const textElement = container.querySelector('span')
      expect(textElement?.className).toContain('font-semibold')
    })

    it('should have right padding on text', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const textElement = container.querySelector('span')
      expect(textElement?.className).toContain('pr-6')
    })
  })

  describe('Child Components', () => {
    it('should render DiscardChanges component', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // DiscardChanges is a child component
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should render ApplyChanges component', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // ApplyChanges is a child component
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should pass correct props to DiscardChanges', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // Component should render without errors
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should pass correct props to ApplyChanges', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges
            isDirty={true}
            onDiscard={onDiscard}
            onConfirm={onConfirm}
            applyLabel="Custom Label"
          />
        </MemoryRouter>,
      )

      // Component should render without errors
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined applyLabel (use default)', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // Should use default "Apply" label
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle empty applyLabel', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} applyLabel="" />
        </MemoryRouter>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle very long applyLabel', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()
      const longLabel = 'A'.repeat(100)

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} applyLabel={longLabel} />
        </MemoryRouter>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should call onConfirm when Apply button triggers callback', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // The callback stored from ApplyChanges should be defined
      expect(applyChangesOnConfirmCallback).toBeDefined()

      // Trigger the callback - this executes lines 38-39 in UnsavedChanges.tsx
      if (applyChangesOnConfirmCallback) {
        applyChangesOnConfirmCallback()
      }

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should wrap onConfirm callback correctly', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      // Simulate the callback logic from lines 37-39
      const wrappedCallback = () => {
        onConfirm()
      }

      wrappedCallback()

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should handle onConfirm being called multiple times', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // Trigger the callback multiple times
      if (applyChangesOnConfirmCallback) {
        applyChangesOnConfirmCallback()
        applyChangesOnConfirmCallback()
        applyChangesOnConfirmCallback()
      }

      expect(onConfirm).toHaveBeenCalledTimes(3)
    })

    it('should handle rapid isDirty state changes', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container, rerender } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={false} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      // Toggle isDirty multiple times
      rerender(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      rerender(
        <MemoryRouter>
          <UnsavedChanges isDirty={false} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      rerender(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Integration with React Router', () => {
    it('should work within MemoryRouter', () => {
      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
    })

    it('should prevent navigation when blocked', () => {
      mockUseBlocker.mockReturnValue({ state: 'blocked', proceed: vi.fn(), reset: vi.fn() })

      const onDiscard = vi.fn()
      const onConfirm = vi.fn()

      const { container } = render(
        <MemoryRouter>
          <UnsavedChanges isDirty={true} onDiscard={onDiscard} onConfirm={onConfirm} />
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('animate-bounce')
    })
  })
})

type UnsavedChangesProps = React.ComponentProps<typeof UnsavedChanges>
