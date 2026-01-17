import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MachinesEmptyState } from './emptyState'

describe('MachinesEmptyState', () => {
  it('should render without crashing', () => {
    const { container } = render(<MachinesEmptyState />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should be defined', () => {
    expect(MachinesEmptyState).toBeDefined()
  })

  it('should render correct title', () => {
    render(<MachinesEmptyState />)
    expect(screen.getByText('You currently have no machines running')).toBeInTheDocument()
  })

  it('should render correct description', () => {
    render(<MachinesEmptyState />)
    expect(
      screen.getByText('Once you create your first app, the machine(s) running it will appear here.'),
    ).toBeInTheDocument()
  })

  it('should render with correct structure', () => {
    const { container } = render(<MachinesEmptyState />)

    const card = container.querySelector('div[class*="rounded-md"]')
    expect(card).toBeInTheDocument()
  })
})
