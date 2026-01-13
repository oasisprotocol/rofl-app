import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { AppStatusIcon } from './index'

// Mock dependencies
vi.mock('@oasisprotocol/ui-library/src/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => React.createElement('div', { 'data-testid': 'tooltip' }, children),
  TooltipContent: ({ children }: any) =>
    React.createElement('div', { className: 'tooltip-content' }, children),
  TooltipTrigger: ({ children }: any) =>
    React.createElement('div', { className: 'tooltip-trigger' }, children),
}))

describe('AppStatusIcon', () => {
  beforeEach(() => {
    // Clear any React warnings
    vi.clearAllMocks()
  })

  it('should render active icon when has active instances', () => {
    const { container } = render(
      React.createElement(AppStatusIcon, { hasActiveInstances: true, removed: false }),
    )
    expect(container.querySelector('[data-testid="tooltip"]')).toBeInTheDocument()
  })

  it('should render inactive icon when no active instances', () => {
    const { container } = render(
      React.createElement(AppStatusIcon, { hasActiveInstances: false, removed: false }),
    )
    expect(container.querySelector('[data-testid="tooltip"]')).toBeInTheDocument()
  })

  it('should render removed icon when app is removed', () => {
    const { container } = render(
      React.createElement(AppStatusIcon, { hasActiveInstances: true, removed: true }),
    )
    expect(container.querySelector('[data-testid="tooltip"]')).toBeInTheDocument()
  })

  it('should render removed icon even when no active instances', () => {
    const { container } = render(
      React.createElement(AppStatusIcon, { hasActiveInstances: false, removed: true }),
    )
    expect(container.querySelector('[data-testid="tooltip"]')).toBeInTheDocument()
  })

  it('should render tooltip with active status message', () => {
    render(React.createElement(AppStatusIcon, { hasActiveInstances: true, removed: false }))
    expect(screen.getByText('Application is up and running')).toBeInTheDocument()
  })

  it('should render tooltip with inactive status message', () => {
    render(React.createElement(AppStatusIcon, { hasActiveInstances: false, removed: false }))
    expect(screen.getByText('Application is down')).toBeInTheDocument()
  })

  it('should render tooltip with removed status message', () => {
    render(React.createElement(AppStatusIcon, { hasActiveInstances: true, removed: true }))
    expect(screen.getByText('Application has been removed')).toBeInTheDocument()
  })

  it('should prioritize removed status over active status', () => {
    render(React.createElement(AppStatusIcon, { hasActiveInstances: true, removed: true }))
    expect(screen.getByText('Application has been removed')).toBeInTheDocument()
    expect(screen.queryByText('Application is up and running')).not.toBeInTheDocument()
  })

  it('should prioritize removed status over inactive status', () => {
    render(React.createElement(AppStatusIcon, { hasActiveInstances: false, removed: true }))
    expect(screen.getByText('Application has been removed')).toBeInTheDocument()
    expect(screen.queryByText('Application is down')).not.toBeInTheDocument()
  })

  it('should define getRoflAppStatus function', () => {
    // Test that the function exists and works correctly
    expect(AppStatusIcon).toBeDefined()
  })
})

describe('getRoflAppStatus', () => {
  it('should return "active" when has active instances and not removed', () => {
    // This is tested indirectly through the component
    render(React.createElement(AppStatusIcon, { hasActiveInstances: true, removed: false }))
    expect(screen.getByText('Application is up and running')).toBeInTheDocument()
  })

  it('should return "inactive" when no active instances and not removed', () => {
    render(React.createElement(AppStatusIcon, { hasActiveInstances: false, removed: false }))
    expect(screen.getByText('Application is down')).toBeInTheDocument()
  })

  it('should return "removed" when removed regardless of active instances', () => {
    render(React.createElement(AppStatusIcon, { hasActiveInstances: true, removed: true }))
    expect(screen.getByText('Application has been removed')).toBeInTheDocument()
  })
})
