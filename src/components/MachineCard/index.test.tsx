import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { MachineCard } from './index'
import { MemoryRouter } from 'react-router-dom'

// Mock the nexus API hook
vi.mock('../../nexus/api', () => ({
  useGetRuntimeRoflAppsId: vi.fn(),
}))

// Mock the type import separately
type _RoflMarketInstance = {
  id: string
  provider: string
  offer_id: string
  status: number
  creator: string
  admin: string
  node_id?: string
  metadata: Record<string, unknown>
  resources: Record<string, unknown>
  deployment: Record<string, unknown> | undefined
  created_at: string
  updated_at: string
  paid_from: string
  paid_until: string
  payment: Record<string, unknown>
  payment_address: string
  refund_data: string
  cmd_next_id: string
  cmd_count: number
  cmds?: unknown[]
  removed: boolean
}

// Mock ui-library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/card', () => ({
  Card: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'card' }, children),
  CardContent: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'card-content' }, children),
  CardFooter: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'card-footer' }, children),
  CardHeader: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'card-header' }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => React.createElement('div', { className, 'data-testid': 'skeleton' }),
}))

vi.mock('@oasisprotocol/ui-library/src/lib/utils', () => ({
  cn: (...classes: any[]) => {
    // Simple implementation that mimics clsx/clsx behavior
    const result: string[] = []
    for (const cls of classes) {
      if (!cls) continue
      if (typeof cls === 'string') {
        result.push(cls)
      } else if (typeof cls === 'object') {
        // Handle conditional object like { 'text-foreground': true }
        for (const [key, value] of Object.entries(cls)) {
          if (value) result.push(key)
        }
      }
    }
    return result.join(' ')
  },
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, asChild, className, ...props }: any) => {
    if (asChild) {
      return React.cloneElement(React.Children.only(children) as React.ReactElement, {
        className,
      })
    }
    return React.createElement('button', { className, ...props }, children)
  },
}))

// Mock MachineStatusIcon component
vi.mock('../MachineStatusIcon', () => ({
  MachineStatusIcon: ({ machine }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'machine-status-icon', 'data-machine-id': machine.id },
      'Status',
    ),
}))

// Mock MachineName component
vi.mock('../MachineName', () => ({
  MachineName: ({ machine, network }: any) =>
    React.createElement(
      'span',
      { 'data-testid': 'machine-name', 'data-machine-id': machine.id, 'data-network': network },
      `Machine-${machine.id.slice(-6)}`,
    ),
}))

import { useGetRuntimeRoflAppsId } from '../../nexus/api'

const mockMachine = {
  id: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  provider: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr',
  offer_id: 'offer123',
  status: 1,
  creator: 'oasis1creator',
  admin: 'oasis1admin',
  node_id: 'node123',
  metadata: { 'net.oasis.provider.name': 'Test Provider' },
  resources: {},
  deployment: { app_id: 'app123456789' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  paid_from: '2024-01-01T00:00:00Z',
  paid_until: '2024-01-02T00:00:00Z',
  payment: {},
  payment_address: 'oasis1payment',
  refund_data: 'refund123',
  cmd_next_id: '1',
  cmd_count: 0,
  removed: false,
}

const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>

describe('MachineCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render without crashing', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      const { container } = render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render card structure', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByTestId('card-header')).toBeInTheDocument()
      expect(screen.getByTestId('card-content')).toBeInTheDocument()
      expect(screen.getByTestId('card-footer')).toBeInTheDocument()
    })

    it('should render machine name component', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const machineName = screen.getByTestId('machine-name')
      expect(machineName).toBeInTheDocument()
      expect(machineName).toHaveAttribute('data-machine-id', mockMachine.id)
      expect(machineName).toHaveAttribute('data-network', 'mainnet')
    })

    it('should render machine status icon', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const statusIcon = screen.getByTestId('machine-status-icon')
      expect(statusIcon).toBeInTheDocument()
      expect(statusIcon).toHaveAttribute('data-machine-id', mockMachine.id)
    })

    it('should render app ID', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByText('app123456789')).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('should show skeleton while loading app data', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should not show skeleton when not loading', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })
  })

  describe('app name display', () => {
    it('should display app name when available', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {
            'net.oasis.rofl.name': 'Test App Name',
          },
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByText('Test App Name')).toBeInTheDocument()
    })

    it('should show "Name not provided" when app name is missing', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {},
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByText('Name not provided')).toBeInTheDocument()
    })

    it('should show "Name not provided" when metadata is missing', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {},
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByText('Name not provided')).toBeInTheDocument()
    })

    it('should apply text-foreground class when app name exists', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {
            'net.oasis.rofl.name': 'Test App Name',
          },
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const appNameElement = screen.getByText('Test App Name').closest('span')
      expect(appNameElement?.className).toContain('text-foreground')
    })

    it('should apply text-muted-foreground class when app name does not exist', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {},
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const noNameElement = screen.getByText('Name not provided').closest('span')
      expect(noNameElement?.className).toContain('text-muted-foreground')
    })
  })

  describe('app link', () => {
    it('should show arrow icon and link to app when app name is available', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {
            'net.oasis.rofl.name': 'Test App Name',
          },
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const appLink = screen.getByText('Test App Name').closest('div')?.querySelector('a')
      expect(appLink).toHaveAttribute('href', '/dashboard/apps/app-id-123')
    })

    it('should not show arrow icon when app name is not available', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {},
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const noNameElement = screen.getByText('Name not provided').closest('span')
      expect(noNameElement?.querySelector('a')).not.toBeInTheDocument()
    })
  })

  describe('network prop', () => {
    it('should pass network to useGetRuntimeRoflAppsId hook - mainnet', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(useGetRuntimeRoflAppsId).toHaveBeenCalledWith('mainnet', 'sapphire', 'app123456789')
    })

    it('should pass network to useGetRuntimeRoflAppsId hook - testnet', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="testnet" />, { wrapper })

      expect(useGetRuntimeRoflAppsId).toHaveBeenCalledWith('testnet', 'sapphire', 'app123456789')
    })
  })

  describe('links', () => {
    it('should link machine name to machine details', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const machineNameLink = screen.getByTestId('machine-name').closest('a')
      expect(machineNameLink).toHaveAttribute(
        'href',
        `/dashboard/machines/${mockMachine.provider}/instances/${mockMachine.id}`,
      )
    })

    it('should have view details button linking to machine details', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      const viewDetailsButton = screen.getByText('View details')
      expect(viewDetailsButton).toBeInTheDocument()
      expect(viewDetailsButton.closest('a')).toHaveAttribute(
        'href',
        `/dashboard/machines/${mockMachine.provider}/instances/${mockMachine.id}`,
      )
    })
  })

  describe('edge cases', () => {
    it('should handle machine without deployment', () => {
      const machineWithoutDeployment = { ...mockMachine, deployment: undefined }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      const { container } = render(<MachineCard machine={machineWithoutDeployment} network="mainnet" />, {
        wrapper,
      })

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle machine with deployment but no app_id', () => {
      const machineWithoutAppId = {
        ...mockMachine,
        deployment: {},
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      const { container } = render(<MachineCard machine={machineWithoutAppId} network="mainnet" />, {
        wrapper,
      })

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle undefined app data response', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByText('Name not provided')).toBeInTheDocument()
    })

    it('should handle app data with undefined metadata', () => {
      const mockAppData = {
        data: {
          id: 'app-id-123',
          metadata: {},
        },
      }

      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: mockAppData,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(screen.getByText('Name not provided')).toBeInTheDocument()
    })
  })

  describe('component structure', () => {
    it('should be a functional component', () => {
      expect(typeof MachineCard).toBe('function')
    })

    it('should accept required props', () => {
      vi.mocked(useGetRuntimeRoflAppsId).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      } as any)

      const { container } = render(<MachineCard machine={mockMachine} network="mainnet" />, { wrapper })

      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
