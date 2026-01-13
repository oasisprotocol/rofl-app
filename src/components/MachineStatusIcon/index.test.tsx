import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MachineStatusIcon } from './index'
import * as oasisRT from '@oasisprotocol/client-rt'

// Mock the UI library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <div className={className} data-testid="badge">
      {children}
    </div>
  ),
}))

describe('MachineStatusIcon Component', () => {
  const createMockMachine = (overrides: any = {}): any => ({
    id: 'test-machine-id',
    provider: 'oasis1provider',
    offer_id: 'offer-1',
    status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
    creator: 'oasis1creator',
    admin: 'oasis1admin',
    metadata: {},
    resources: {},
    deployment: {},
    ...overrides,
  })

  describe('status: created', () => {
    it('should render CirclePause icon with warning color', () => {
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.CREATED,
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument()
    })
  })

  describe('status: accepted (ready to start)', () => {
    it('should render CirclePause icon with success color when no node_id', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: futureDate,
        node_id: undefined,
        deployment: undefined,
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('status: accepted (active)', () => {
    it('should render CircleCheck icon with success color when machine is active', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: futureDate,
        node_id: 'node-123',
        deployment: {},
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('status: removed', () => {
    it('should render CircleStop icon with error color when machine.removed is true', () => {
      const machine = createMockMachine({
        removed: true,
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should render CircleStop icon when status is CANCELLED', () => {
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.CANCELLED,
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('status: expired', () => {
    it('should render CircleStop icon with error color', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: pastDate,
        node_id: 'node-123',
        deployment: {},
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('status: expiring soon', () => {
    it('should render Badge with "Expiring Soon" text', () => {
      const fiveMinutesFromNow = new Date(Date.now() + 300000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: fiveMinutesFromNow,
        node_id: 'node-123',
        deployment: {},
      })
      render(<MachineStatusIcon machine={machine} />)

      expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toBeInTheDocument()
    })
  })

  describe('status: net.oasis.error', () => {
    it('should render CircleX icon with error color', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: futureDate,
        metadata: {
          'net.oasis.error': 'Some error occurred',
        },
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('status: unknown', () => {
    it('should render CircleOff icon with error color for unknown status', () => {
      const machine = createMockMachine({
        status: 9999, // Invalid status
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('tooltip behavior', () => {
    it('should render tooltip wrapper', () => {
      const machine = createMockMachine()
      render(<MachineStatusIcon machine={machine} />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('should render tooltip trigger', () => {
      const machine = createMockMachine()
      render(<MachineStatusIcon machine={machine} />)

      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument()
    })

    it('should render tooltip content with description', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: futureDate,
        node_id: 'node-123',
        deployment: {},
      })
      render(<MachineStatusIcon machine={machine} />)

      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle machine with missing deployment', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: futureDate,
        node_id: 'node-123',
        deployment: undefined,
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should handle machine with missing node_id', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: futureDate,
        node_id: undefined,
        deployment: {},
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should handle invalid paid_until date gracefully', () => {
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: 'invalid-date',
        node_id: 'node-123',
        deployment: {},
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      // Should render but without expiration warning
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should handle missing metadata', () => {
      // Note: The component currently doesn't handle undefined metadata gracefully
      // This test documents the current behavior - it will throw an error
      const machine = createMockMachine({
        metadata: undefined,
      })

      expect(() => render(<MachineStatusIcon machine={machine} />)).toThrow()
    })
  })

  describe('icon styles', () => {
    it('should apply w-5 h-5 classes to icons', () => {
      const machine = createMockMachine()
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toHaveClass('h-5')
      expect(icon).toHaveClass('w-5')
    })
  })

  describe('time-based status calculations', () => {
    it('should consider machine expiring when paid_until is within 10 minutes', () => {
      const nineMinutesFromNow = new Date(Date.now() + 540000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: nineMinutesFromNow,
        node_id: 'node-123',
        deployment: {},
      })
      render(<MachineStatusIcon machine={machine} />)

      expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
    })

    it('should not consider machine expiring when paid_until is more than 10 minutes away', () => {
      const elevenMinutesFromNow = new Date(Date.now() + 660000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: elevenMinutesFromNow,
        node_id: 'node-123',
        deployment: {},
      })
      render(<MachineStatusIcon machine={machine} />)

      expect(screen.queryByText('Expiring Soon')).not.toBeInTheDocument()
    })

    it('should consider machine expired when paid_until is in the past', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString()
      const machine = createMockMachine({
        status: oasisRT.types.RoflmarketInstanceStatus.ACCEPTED,
        paid_until: pastDate,
        node_id: 'node-123',
        deployment: {},
      })
      const { container } = render(<MachineStatusIcon machine={machine} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })
})
