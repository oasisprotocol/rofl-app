import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppsList } from './index'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'

// Mock dependencies
const mockUseInView = vi.fn(() => ({ ref: vi.fn(), inView: false }))
vi.mock('react-intersection-observer', () => ({
  useInView: () => mockUseInView(),
}))

vi.mock('../../hooks/useNetwork', () => ({
  useNetwork: vi.fn(fallback => fallback || 'mainnet'),
}))

const mockUseNexusInfiniteQuery = vi.fn()
vi.mock('../../utils/useNexusInfiniteQuery', () => ({
  useNexusInfiniteQuery: (...args: any[]) => mockUseNexusInfiniteQuery(...args),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x123',
    isConnected: true,
    chainId: 1,
    connector: undefined,
  }),
}))

// Mock Skeleton component
vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div className={className} data-testid="skeleton" />,
}))

// Mock AppCard component
vi.mock('../AppCard', () => ({
  AppCard: ({ app, network, type }: any) => (
    <div data-testid={`app-card-${app.id}`}>
      {app.id} - {type} - {network}
    </div>
  ),
}))

describe('AppsList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock return value
    mockUseNexusInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            data: {
              rofl_apps: [
                {
                  id: 'app-0',
                  admin: 'admin-0',
                  stake: '1000000',
                  policy: {},
                  sek: 'sek',
                  metadata: {},
                  secrets: {},
                  removed: false,
                  date_created: '2024-01-01T00:00:00Z',
                  num_active_instances: 1,
                },
                {
                  id: 'app-1',
                  admin: 'admin-1',
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
            },
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isFetched: true,
    })
  })

  describe('dashboard type', () => {
    it('should render app cards when connected and apps exist', () => {
      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      expect(screen.getByTestId('app-card-app-0')).toBeInTheDocument()
      expect(screen.getByTestId('app-card-app-1')).toBeInTheDocument()
    })

    it('should use correct page limit for dashboard (9)', () => {
      render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      expect(mockUseNexusInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.arrayContaining([expect.objectContaining({ limit: 9 })]),
        }),
      )
    })
  })

  describe('explore type', () => {
    it('should render app cards', () => {
      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="explore" />)

      expect(screen.getByTestId('app-card-app-0')).toBeInTheDocument()
    })

    it('should use correct page limit for explore (18)', () => {
      render(<AppsList emptyState={<div>No apps</div>} type="explore" />)

      expect(mockUseNexusInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.arrayContaining([expect.objectContaining({ limit: 18 })]),
        }),
      )
    })
  })

  describe('loading states', () => {
    it('should render skeletons when loading', () => {
      mockUseNexusInfiniteQuery.mockReturnValue({
        data: undefined,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: true,
        isFetched: false,
      })

      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      const skeletons = container.querySelectorAll('[data-testid="skeleton"]')
      expect(skeletons.length).toBe(9) // dashboard limit
    })

    it('should render skeletons when fetching next page', () => {
      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                rofl_apps: [
                  {
                    id: 'app-1',
                    admin: 'admin-1',
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
              },
            },
          ],
        },
        fetchNextPage: vi.fn(),
        hasNextPage: true,
        isFetchingNextPage: true,
        isLoading: false,
        isFetched: true,
      })

      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      // Should show 3 skeletons for next page
      const skeletons = container.querySelectorAll('[data-testid="skeleton"]')
      expect(skeletons.length).toBe(3)
    })
  })

  describe('grid layout', () => {
    it('should render with correct grid classes', () => {
      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
      expect(grid).toHaveClass('lg:grid-cols-3')
    })

    it('should render with gap-4 class', () => {
      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('gap-4')
    })
  })

  describe('infinite scroll', () => {
    it('should render intersection observer ref element', () => {
      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      const ref = container.querySelector('.h-10.w-full')
      expect(ref).toBeInTheDocument()
    })

    it('should fetch next page when in view and has next page', () => {
      const fetchNextPage = vi.fn()
      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                rofl_apps: [
                  {
                    id: 'app-1',
                    admin: 'admin-1',
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
              },
            },
          ],
        },
        fetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: false,
        isLoading: false,
        isFetched: true,
      })

      // Mock useInView to return inView: true
      mockUseInView.mockReturnValue({ ref: vi.fn(), inView: true })

      render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      // fetchNextPage should be called when inView is true and hasNextPage is true
      expect(fetchNextPage).toHaveBeenCalled()

      // Reset mock
      mockUseInView.mockReturnValue({ ref: vi.fn(), inView: false })
    })

    it('should not fetch next page when already fetching', () => {
      const fetchNextPage = vi.fn()
      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                rofl_apps: [
                  {
                    id: 'app-1',
                    admin: 'admin-1',
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
              },
            },
          ],
        },
        fetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: true, // Already fetching
        isLoading: false,
        isFetched: true,
      })

      // Mock useInView to return inView: true
      mockUseInView.mockReturnValue({ ref: vi.fn(), inView: true })

      render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      // fetchNextPage should not be called when already fetching
      expect(fetchNextPage).not.toHaveBeenCalled()

      // Reset mock
      mockUseInView.mockReturnValue({ ref: vi.fn(), inView: false })
    })

    it('should not fetch next page when no next page', () => {
      const fetchNextPage = vi.fn()
      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                rofl_apps: [
                  {
                    id: 'app-1',
                    admin: 'admin-1',
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
              },
            },
          ],
        },
        fetchNextPage,
        hasNextPage: false, // No next page
        isFetchingNextPage: false,
        isLoading: false,
        isFetched: true,
      })

      // Mock useInView to return inView: true
      mockUseInView.mockReturnValue({ ref: vi.fn(), inView: true })

      render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      // fetchNextPage should not be called when no next page
      expect(fetchNextPage).not.toHaveBeenCalled()

      // Reset mock
      mockUseInView.mockReturnValue({ ref: vi.fn(), inView: false })
    })
  })

  describe('empty states', () => {
    it('should show empty state when no apps', () => {
      mockUseNexusInfiniteQuery.mockReturnValue({
        data: { pages: [{ data: { rofl_apps: [] } }] },
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
        isFetched: true,
      })

      const emptyState = <div data-testid="custom-empty">Custom empty message</div>
      render(<AppsList emptyState={emptyState} type="dashboard" />)

      expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    })

    it('should show empty state when no apps for explore', () => {
      mockUseNexusInfiniteQuery.mockReturnValue({
        data: { pages: [{ data: { rofl_apps: [] } }] },
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
        isFetched: true,
      })

      const emptyState = <div data-testid="explore-empty">No apps to explore</div>
      render(<AppsList emptyState={emptyState} type="explore" />)

      expect(screen.getByTestId('explore-empty')).toBeInTheDocument()
    })
  })

  describe('AppCard rendering', () => {
    it('should pass correct props to AppCard for dashboard', () => {
      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      const firstCard = screen.getByTestId('app-card-app-0')
      expect(firstCard).toHaveTextContent('app-0')
      expect(firstCard).toHaveTextContent('dashboard')
      expect(firstCard).toHaveTextContent('mainnet')
    })

    it('should pass correct props to AppCard for explore', () => {
      const { container } = render(<AppsList emptyState={<div>No apps</div>} type="explore" />)

      const firstCard = screen.getByTestId('app-card-app-0')
      expect(firstCard).toHaveTextContent('app-0')
      expect(firstCard).toHaveTextContent('explore')
      expect(firstCard).toHaveTextContent('mainnet')
    })
  })

  describe('query parameters', () => {
    it('should pass admin address for dashboard type', () => {
      render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      expect(mockUseNexusInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.arrayContaining([
            expect.objectContaining({
              admin: '0x123',
            }),
          ]),
        }),
      )
    })

    it('should pass sort_by for dashboard type', () => {
      render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      expect(mockUseNexusInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.arrayContaining([
            expect.objectContaining({
              sort_by: 'created_at_desc',
            }),
          ]),
        }),
      )
    })

    it('should not pass admin or sort_by for explore type', () => {
      render(<AppsList emptyState={<div>No apps</div>} type="explore" />)

      const call = mockUseNexusInfiniteQuery.mock.calls[0][0]
      const params = call.params

      // Find the params object that has limit
      const paramsObj = params.find((p: any) => p?.limit)

      expect(paramsObj?.admin).toBeUndefined()
      expect(paramsObj?.sort_by).toBeUndefined()
    })
  })

  describe('enabled state', () => {
    it('should enable query when type is explore', () => {
      render(<AppsList emptyState={<div>No apps</div>} type="explore" />)

      expect(mockUseNexusInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        }),
      )
    })

    it('should enable query when type is dashboard and wallet is connected', () => {
      render(<AppsList emptyState={<div>No apps</div>} type="dashboard" />)

      expect(mockUseNexusInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        }),
      )
    })
  })
})
