import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Dashboard } from './index'
import { MemoryRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
  })),
}))

// Mock useNetwork hook
vi.mock('../../hooks/useNetwork', () => ({
  useNetwork: vi.fn(() => 'mainnet'),
}))

// Mock nexus API hooks
const mockUseGetRuntimeRoflApps = vi.fn()
const mockUseGetRuntimeRoflmarketInstances = vi.fn()

vi.mock('../../nexus/api', () => ({
  useGetRuntimeRoflApps: (...args: any[]) => mockUseGetRuntimeRoflApps(...args),
  useGetRuntimeRoflmarketInstances: (...args: any[]) => mockUseGetRuntimeRoflmarketInstances(...args),
}))

// Mock UI components
vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div className={className} data-testid="skeleton" />,
}))

// Mock child components
vi.mock('./MetricCard', () => ({
  MetricCard: ({ title, value, isTotalCountClipped }: any) => (
    <div data-testid={`metric-${title.toLowerCase().replace(' ', '-')}`}>
      {isTotalCountClipped && '> '}
      {value}
    </div>
  ),
}))

vi.mock('./SectionHeader', () => ({
  SectionHeader: ({ title, to, disabled }: any) => (
    <div data-testid={`section-${title.toLowerCase().replace(' ', '-')}`} data-disabled={disabled}>
      <a href={to}>View all</a>
    </div>
  ),
}))

vi.mock('../../components/AppCard', () => ({
  AppCard: ({ app, type }: any) => (
    <div data-testid={`app-card-${app.id}`} data-type={type}>
      {app.metadata?.['net.oasis.rofl.name'] || app.id}
    </div>
  ),
}))

vi.mock('../../components/MachineCard', () => ({
  MachineCard: ({ machine }: any) => <div data-testid={`machine-card-${machine.id}`}>{machine.id}</div>,
}))

vi.mock('../../components/MachineStatusIcon/isMachineRemoved', () => ({
  isMachineRemoved: (machine: any) => machine.removed || machine.status === 'CANCELLED',
}))

const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>

const mockApps = [
  {
    id: 'app-1',
    admin: '0x123',
    stake: '1000000',
    policy: {},
    sek: 'sek',
    metadata: { 'net.oasis.rofl.name': 'Test App 1' },
    secrets: {},
    removed: false,
    date_created: '2024-01-01T00:00:00Z',
    num_active_instances: 2,
  },
  {
    id: 'app-2',
    admin: '0x123',
    stake: '1000000',
    policy: {},
    sek: 'sek',
    metadata: { 'net.oasis.rofl.name': 'Test App 2' },
    secrets: {},
    removed: false,
    date_created: '2024-01-01T00:00:00Z',
    num_active_instances: 0,
  },
]

const mockMachines = [
  {
    id: 'machine-1',
    removed: false,
    status: 'ACCEPTED',
  },
  {
    id: 'machine-2',
    removed: false,
    status: 'CANCELLED',
  },
]

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseGetRuntimeRoflApps.mockReturnValue({
      data: {
        data: {
          rofl_apps: mockApps,
          total_count: 2,
          is_total_count_clipped: false,
        },
      },
      isLoading: false,
      isFetched: true,
    })

    mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
      data: {
        data: {
          instances: mockMachines,
          total_count: 2,
          is_total_count_clipped: false,
        },
      },
      isLoading: false,
      isFetched: true,
    })
  })

  describe('loading states', () => {
    it('should render skeleton when apps are loading', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })

      render(<Dashboard />, { wrapper })

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render skeleton when machines are loading', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })

      render(<Dashboard />, { wrapper })

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render both skeletons when both are loading', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })

      render(<Dashboard />, { wrapper })

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show MetricCard after loading completes', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByTestId('metric-apps-running')).toBeInTheDocument()
      expect(screen.getByTestId('metric-machines-running')).toBeInTheDocument()
    })
  })

  describe('metric cards', () => {
    it('should render apps running metric card', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByTestId('metric-apps-running')).toBeInTheDocument()
    })

    it('should calculate running apps correctly (with active instances)', () => {
      render(<Dashboard />, { wrapper })

      const metricCard = screen.getByTestId('metric-apps-running')
      expect(metricCard).toHaveTextContent('1') // Only app-1 has active instances
    })

    it('should render machines running metric card', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByTestId('metric-machines-running')).toBeInTheDocument()
    })

    it('should calculate running machines correctly (excluding removed)', () => {
      render(<Dashboard />, { wrapper })

      const metricCard = screen.getByTestId('metric-machines-running')
      expect(metricCard).toHaveTextContent('1') // Only machine-1 is not removed
    })

    it('should show clipped count for apps when is_total_count_clipped is true', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: {
          data: {
            rofl_apps: mockApps,
            total_count: 100,
            is_total_count_clipped: true,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      const metricCard = screen.getByTestId('metric-apps-running')
      expect(metricCard).toHaveTextContent('>')
    })

    it('should show clipped count for machines when is_total_count_clipped is true', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: {
          data: {
            instances: mockMachines,
            total_count: 100,
            is_total_count_clipped: true,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      const metricCard = screen.getByTestId('metric-machines-running')
      expect(metricCard).toHaveTextContent('>')
    })

    it('should handle zero running apps', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: {
          data: {
            rofl_apps: [{ ...mockApps[0], num_active_instances: 0 }],
            total_count: 1,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      const metricCard = screen.getByTestId('metric-apps-running')
      expect(metricCard).toHaveTextContent('0')
    })

    it('should handle zero running machines', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: {
          data: {
            instances: [{ id: 'machine-1', removed: false, status: 'CANCELLED' }],
            total_count: 1,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      const metricCard = screen.getByTestId('metric-machines-running')
      expect(metricCard).toHaveTextContent('0')
    })
  })

  describe('section headers', () => {
    it('should render Apps section header', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByTestId('section-apps')).toBeInTheDocument()
    })

    it('should render Machines section header', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByTestId('section-machines')).toBeInTheDocument()
    })

    it('should disable Apps section when no apps', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: {
          data: {
            rofl_apps: [],
            total_count: 0,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      const section = screen.getByTestId('section-apps')
      expect(section).toHaveAttribute('data-disabled', 'true')
    })

    it('should enable Apps section when apps exist', () => {
      render(<Dashboard />, { wrapper })

      const section = screen.getByTestId('section-apps')
      expect(section).toHaveAttribute('data-disabled', 'false')
    })

    it('should disable Machines section when no machines', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
            total_count: 0,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      const section = screen.getByTestId('section-machines')
      expect(section).toHaveAttribute('data-disabled', 'true')
    })

    it('should have correct links in section headers', () => {
      render(<Dashboard />, { wrapper })

      const appsLink = screen.getByTestId('section-apps').querySelector('a')
      const machinesLink = screen.getByTestId('section-machines').querySelector('a')

      expect(appsLink).toHaveAttribute('href', '/dashboard/apps')
      expect(machinesLink).toHaveAttribute('href', '/dashboard/machines')
    })
  })

  describe('apps section', () => {
    it('should render empty state when no apps', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: {
          data: {
            rofl_apps: [],
            total_count: 0,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      expect(screen.getByText('Create your first app')).toBeInTheDocument()
    })

    it('should render app cards', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByTestId('app-card-app-1')).toBeInTheDocument()
      expect(screen.getByTestId('app-card-app-2')).toBeInTheDocument()
    })

    it('should limit app cards to 3', () => {
      const manyApps = Array.from({ length: 10 }, (_, i) => ({
        id: `app-${i}`,
        admin: '0x123',
        stake: '1000000',
        policy: {},
        sek: 'sek',
        metadata: {},
        secrets: {},
        removed: false,
        date_created: '2024-01-01T00:00:00Z',
        num_active_instances: 1,
      }))

      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: {
          data: {
            rofl_apps: manyApps,
            total_count: 10,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      // Should only render first 3 apps
      expect(screen.getByTestId('app-card-app-0')).toBeInTheDocument()
      expect(screen.getByTestId('app-card-app-1')).toBeInTheDocument()
      expect(screen.getByTestId('app-card-app-2')).toBeInTheDocument()
      expect(screen.queryByTestId('app-card-app-3')).not.toBeInTheDocument()
    })

    it('should pass correct type to AppCard', () => {
      render(<Dashboard />, { wrapper })

      const appCard = screen.getByTestId('app-card-app-1')
      expect(appCard).toHaveAttribute('data-type', 'dashboard')
    })
  })

  describe('machines section', () => {
    it('should render empty state when no machines', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
            total_count: 0,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      expect(screen.getByText('You currently have no machines running')).toBeInTheDocument()
    })

    it('should render machine cards', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByTestId('machine-card-machine-1')).toBeInTheDocument()
      expect(screen.getByTestId('machine-card-machine-2')).toBeInTheDocument()
    })

    it('should limit machine cards to 3', () => {
      const manyMachines = Array.from({ length: 10 }, (_, i) => ({
        id: `machine-${i}`,
        removed: false,
        status: 'ACCEPTED',
      }))

      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: {
          data: {
            instances: manyMachines,
            total_count: 10,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      // Should only render first 3 machines
      expect(screen.getByTestId('machine-card-machine-0')).toBeInTheDocument()
      expect(screen.getByTestId('machine-card-machine-1')).toBeInTheDocument()
      expect(screen.getByTestId('machine-card-machine-2')).toBeInTheDocument()
      expect(screen.queryByTestId('machine-card-machine-3')).not.toBeInTheDocument()
    })
  })

  describe('layout', () => {
    it('should render with proper spacing', () => {
      const { container } = render(<Dashboard />, { wrapper })

      const spaceY = container.querySelector('.space-y-12')
      expect(spaceY).toBeInTheDocument()
    })

    it('should render metric cards in grid', () => {
      const { container } = render(<Dashboard />, { wrapper })

      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('should render app cards in grid', () => {
      const { container } = render(<Dashboard />, { wrapper })

      const grids = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3')
      expect(grids.length).toBeGreaterThan(0)
    })
  })

  describe('API calls', () => {
    it('should call useGetRuntimeRoflApps with correct params', () => {
      render(<Dashboard />, { wrapper })

      expect(mockUseGetRuntimeRoflApps).toHaveBeenCalledWith(
        'mainnet',
        'sapphire',
        expect.objectContaining({
          limit: 1000,
          offset: 0,
          admin: '0x1234567890123456789012345678901234567890',
          sort_by: 'created_at_desc',
        }),
        expect.any(Object),
      )
    })

    it('should call useGetRuntimeRoflmarketInstances with correct params', () => {
      render(<Dashboard />, { wrapper })

      expect(mockUseGetRuntimeRoflmarketInstances).toHaveBeenCalledWith(
        'mainnet',
        'sapphire',
        expect.objectContaining({
          limit: 1000,
          offset: 0,
          admin: '0x1234567890123456789012345678901234567890',
        }),
        expect.any(Object),
      )
    })

    it('should set refetchInterval for apps query', () => {
      render(<Dashboard />, { wrapper })

      expect(mockUseGetRuntimeRoflApps).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          query: expect.objectContaining({
            refetchInterval: 10000,
          }),
        }),
      )
    })

    it('should set refetchInterval for machines query', () => {
      render(<Dashboard />, { wrapper })

      expect(mockUseGetRuntimeRoflmarketInstances).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          query: expect.objectContaining({
            refetchInterval: 10000,
          }),
        }),
      )
    })
  })

  describe('error handling', () => {
    it('should handle undefined apps data gracefully', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      expect(() => render(<Dashboard />, { wrapper })).not.toThrow()
    })

    it('should handle undefined machines data gracefully', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      expect(() => render(<Dashboard />, { wrapper })).not.toThrow()
    })

    it('should handle missing metadata in apps', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: {
          data: {
            rofl_apps: [
              {
                id: 'app-no-metadata',
                admin: '0x123',
                stake: '1000000',
                policy: {},
                sek: 'sek',
                metadata: {},
                secrets: {},
                removed: false,
                date_created: '2024-01-01T00:00:00Z',
                num_active_instances: 1,
              },
            ],
            total_count: 1,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      expect(() => render(<Dashboard />, { wrapper })).not.toThrow()
    })
  })

  describe('integration', () => {
    it('should render complete dashboard with all sections', () => {
      render(<Dashboard />, { wrapper })

      // Metric cards
      expect(screen.getByTestId('metric-apps-running')).toBeInTheDocument()
      expect(screen.getByTestId('metric-machines-running')).toBeInTheDocument()

      // Section headers
      expect(screen.getByTestId('section-apps')).toBeInTheDocument()
      expect(screen.getByTestId('section-machines')).toBeInTheDocument()

      // Content
      expect(screen.getByTestId('app-card-app-1')).toBeInTheDocument()
      expect(screen.getByTestId('machine-card-machine-1')).toBeInTheDocument()
    })

    it('should handle all empty states', () => {
      mockUseGetRuntimeRoflApps.mockReturnValue({
        data: {
          data: {
            rofl_apps: [],
            total_count: 0,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: {
          data: {
            instances: [],
            total_count: 0,
            is_total_count_clipped: false,
          },
        },
        isLoading: false,
        isFetched: true,
      })

      render(<Dashboard />, { wrapper })

      expect(screen.getByText('Create your first app')).toBeInTheDocument()
      expect(screen.getByText('You currently have no machines running')).toBeInTheDocument()
    })
  })
})
