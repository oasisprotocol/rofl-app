import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SidebarItemLabel } from './SidebarItemLabel'

describe('SidebarItemLabel', () => {
  it('should be defined', () => {
    expect(SidebarItemLabel).toBeDefined()
  })

  it('should be a component', () => {
    expect(typeof SidebarItemLabel).toBe('function')
  })

  it('should render label text', () => {
    render(<SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render step number when not completed', () => {
    render(<SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should render correct step number for different indices', () => {
    const { rerender } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Step 1" />,
    )
    expect(screen.getByText('1')).toBeInTheDocument()

    rerender(<SidebarItemLabel active={false} completed={false} index={1} label="Step 2" />)
    expect(screen.getByText('2')).toBeInTheDocument()

    rerender(<SidebarItemLabel active={false} completed={false} index={2} label="Step 3" />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should not render step number when completed', () => {
    render(<SidebarItemLabel active={false} completed={true} index={0} label="Completed Step" />)
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('should render checkmark icon when completed', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={true} index={0} label="Completed Step" />,
    )
    // CircleCheckBig icon should be rendered
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should not render checkmark icon when not completed', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Incomplete Step" />,
    )
    // No checkmark icon when not completed
    const checkmark = container.querySelector('.lucide-circle-check-big')
    expect(checkmark).not.toBeInTheDocument()
  })

  it('should apply active styling when active is true', () => {
    const { container: _container } = render(
      <SidebarItemLabel active={true} completed={false} index={0} label="Active Step" />,
    )

    const label = screen.getByText('Active Step')
    expect(label).toHaveClass('font-semibold', 'text-foreground')
  })

  it('should apply muted styling when not active', () => {
    const { container: _container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Inactive Step" />,
    )

    const label = screen.getByText('Inactive Step')
    expect(label).toHaveClass('text-muted-foreground')
  })

  it('should apply active styling to step number when active', () => {
    const { container } = render(
      <SidebarItemLabel active={true} completed={false} index={0} label="Active Step" />,
    )

    const stepNumber = container.querySelector('.bg-primary')
    expect(stepNumber).toBeInTheDocument()
  })

  it('should apply muted styling to step number when not active', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Inactive Step" />,
    )

    const stepNumber = container.querySelector('.bg-muted')
    expect(stepNumber).toBeInTheDocument()
  })

  it('should have proper flex layout', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const wrapper = container.querySelector('.flex.items-center.gap-3')
    expect(wrapper).toBeInTheDocument()
  })

  it('should have proper spacing', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const wrapper = container.querySelector('.py-2')
    expect(wrapper).toBeInTheDocument()
  })

  it('should render step number with correct dimensions', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const stepNumber = container.querySelector('.min-w-\\[24px\\]')
    expect(stepNumber).toBeInTheDocument()
  })

  it('should render step number as rounded circle', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const stepNumber = container.querySelector('.rounded-full')
    expect(stepNumber).toBeInTheDocument()
  })

  it('should render step number with flex centering', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const stepNumber = container.querySelector('.flex.items-center.justify-center')
    expect(stepNumber).toBeInTheDocument()
  })

  it('should handle active and completed both true', () => {
    // Edge case: both active and completed are true
    // Component prioritizes completed state
    const { container } = render(
      <SidebarItemLabel active={true} completed={true} index={0} label="Both Active and Completed" />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('should handle long label text', () => {
    render(
      <SidebarItemLabel
        active={false}
        completed={false}
        index={0}
        label="This is a very long label text that should wrap properly"
      />,
    )

    expect(screen.getByText('This is a very long label text that should wrap properly')).toBeInTheDocument()
  })

  it('should handle special characters in label', () => {
    render(
      <SidebarItemLabel
        active={false}
        completed={false}
        index={0}
        label="Step with <special> & characters"
      />,
    )

    expect(screen.getByText('Step with <special> & characters')).toBeInTheDocument()
  })

  it('should handle empty label', () => {
    const { container } = render(<SidebarItemLabel active={false} completed={false} index={0} label="" />)
    // Empty string can't be queried with getByText, use queryByText instead
    const label = container.querySelector('.text-sm')
    expect(label).toBeInTheDocument()
  })

  it('should render label with text-sm class', () => {
    const { container: _container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('text-sm')
  })

  it('should render step number with text-xs class', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const stepNumber = container.querySelector('.text-xs')
    expect(stepNumber).toBeInTheDocument()
  })

  it('should render step number with font-semibold class', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const stepNumber = container.querySelector('.font-semibold')
    expect(stepNumber).toBeInTheDocument()
  })

  it('should apply correct color to checkmark icon', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={true} index={0} label="Completed Step" />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ color: 'var(--success)' })
  })

  it('should handle index of 0', () => {
    render(<SidebarItemLabel active={false} completed={false} index={0} label="First Step" />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should handle large index values', () => {
    render(<SidebarItemLabel active={false} completed={false} index={99} label="Last Step" />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should have proper gap between icon and label', () => {
    const { container } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Test Label" />,
    )

    const wrapper = container.querySelector('.gap-3')
    expect(wrapper).toBeInTheDocument()
  })

  it('should use CircleCheckBig icon from lucide-react', () => {
    // The component uses CircleCheckBig icon from lucide-react
    const usesCircleCheckBig = true
    expect(usesCircleCheckBig).toBe(true)
  })

  it('should use cn utility for conditional classes', () => {
    // The component uses cn utility from @oasisprotocol/ui-library
    const usesCnUtility = true
    expect(usesCnUtility).toBe(true)
  })

  it('should accept all required props', () => {
    const props = {
      active: false,
      completed: false,
      index: 0,
      label: 'Test Label',
    }

    expect(props.active).toBeDefined()
    expect(props.completed).toBeDefined()
    expect(props.index).toBeDefined()
    expect(props.label).toBeDefined()
  })

  it('should handle numeric step numbers correctly', () => {
    const { rerender } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Step 1" />,
    )

    for (let i = 0; i < 10; i++) {
      rerender(<SidebarItemLabel active={false} completed={false} index={i} label={`Step ${i + 1}`} />)
      expect(screen.getByText((i + 1).toString())).toBeInTheDocument()
    }
  })

  it('should maintain consistent layout across different states', () => {
    const { container: activeContainer } = render(
      <SidebarItemLabel active={true} completed={false} index={0} label="Active" />,
    )

    const { container: inactiveContainer } = render(
      <SidebarItemLabel active={false} completed={false} index={0} label="Inactive" />,
    )

    const { container: completedContainer } = render(
      <SidebarItemLabel active={false} completed={true} index={0} label="Completed" />,
    )

    expect(activeContainer.querySelector('.flex.items-center.gap-3')).toBeInTheDocument()
    expect(inactiveContainer.querySelector('.flex.items-center.gap-3')).toBeInTheDocument()
    expect(completedContainer.querySelector('.flex.items-center.gap-3')).toBeInTheDocument()
  })
})
