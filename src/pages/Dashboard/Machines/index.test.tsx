import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { Machines } from './index'
import * as useNexusInfiniteQueryModule from '../../../utils/useNexusInfiniteQuery'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: '0x1234567890abcdef1234567890abcdef12345678',
    isConnected: true,
  })),
}))

vi.mock('../../../hooks/useNetwork', () => ({
  useNetwork: vi.fn(() => 'mainnet'),
}))

vi.mock('../../../utils/useNexusInfiniteQuery', () => ({
  useNexusInfiniteQuery: vi.fn(),
}))

// Dynamic mock for useInView
let mockInView = false
const mockUseInView = vi.fn(() => ({ ref: vi.fn(), inView: mockInView }))

vi.mock('react-intersection-observer', () => ({
  useInView: () => mockUseInView(),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => React.createElement('div', { className, 'data-testid': 'skeleton' }),
}))

vi.mock('../../../components/MachineCard', () => ({
  MachineCard: ({ machine, network }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': 'machine-card',
        'data-machine-id': machine.id,
        'data-network': network,
      },
      `Machine ${machine.id}`,
    ),
}))

const mockUseNexusInfiniteQuery = vi.mocked(useNexusInfiniteQueryModule.useNexusInfiniteQuery)

describe('Machines', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to default mock for each test
    mockInView = false
    mockUseNexusInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            data: {
              instances: [
                {
                  id: 'instance-1',
                  provider: '0xprovider',
                  created_at: '2024-01-01T00:00:00Z',
                  paid_until: '2024-12-31T23:59:59Z',
                  resources: { cpus: 2, memory: '4Gi', storage: '100Gi' },
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
    } as any)
  })

  it('should be defined', () => {
    expect(Machines).toBeDefined()
  })

  it('should render without crashing', () => {
    const { container } = render(<Machines />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render loading skeletons when isLoading is true', () => {
    mockUseNexusInfiniteQuery.mockReturnValue({
      data: { pages: [] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: true,
      isFetched: false,
    } as any)

    render(<Machines />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons).toHaveLength(9) // pageLimit is 9
  })

  it('should render machine cards when data is loaded', () => {
    render(<Machines />)

    expect(screen.getByTestId('machine-card')).toBeInTheDocument()
    expect(screen.getByText('Machine instance-1')).toBeInTheDocument()
  })

  it('should render empty state when no machines exist', () => {
    mockUseNexusInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: { instances: [] } }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isFetched: true,
    } as any)

    render(<Machines />)

    expect(screen.getByText('You currently have no machines running')).toBeInTheDocument()
  })

  it('should render loading skeletons when fetching next page', () => {
    mockUseNexusInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            data: {
              instances: [
                {
                  id: 'instance-1',
                  provider: '0xprovider',
                  created_at: '2024-01-01T00:00:00Z',
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
    } as any)

    render(<Machines />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons).toHaveLength(3) // 3 skeletons for next page
  })

  it('should render multiple machine cards', () => {
    mockUseNexusInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            data: {
              instances: [
                {
                  id: 'instance-1',
                  provider: '0xprovider',
                  created_at: '2024-01-01T00:00:00Z',
                },
                {
                  id: 'instance-2',
                  provider: '0xprovider',
                  created_at: '2024-01-02T00:00:00Z',
                },
                {
                  id: 'instance-3',
                  provider: '0xprovider',
                  created_at: '2024-01-03T00:00:00Z',
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
    } as any)

    render(<Machines />)

    const machineCards = screen.getAllByTestId('machine-card')
    expect(machineCards).toHaveLength(3)
  })

  it('should pass network prop to MachineCard', () => {
    render(<Machines />)

    const machineCard = screen.getAllByTestId('machine-card')[0]
    expect(machineCard).toHaveAttribute('data-network', 'mainnet')
  })

  it('should render machines in a grid layout', () => {
    const { container } = render(<Machines />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-4')
  })

  it('should render intersection observer trigger div', () => {
    const { container } = render(<Machines />)

    const triggerDiv = container.querySelector('.h-10.w-full')
    expect(triggerDiv).toBeInTheDocument()
  })

  describe('Infinite Scroll', () => {
    it('should call fetchNextPage when inView, hasNextPage, and not fetching', () => {
      const fetchNextPage = vi.fn()

      // Set inView to true
      mockInView = true

      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                instances: [
                  {
                    id: 'instance-1',
                    provider: '0xprovider',
                    created_at: '2024-01-01T00:00:00Z',
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
      } as any)

      render(<Machines />)

      // fetchNextPage should be called when inView is true and there's a next page
      expect(fetchNextPage).toHaveBeenCalled()
    })

    it('should not call fetchNextPage when not in view', () => {
      const fetchNextPage = vi.fn()

      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                instances: [
                  {
                    id: 'instance-1',
                    provider: '0xprovider',
                    created_at: '2024-01-01T00:00:00Z',
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
      } as any)

      render(<Machines />)

      // fetchNextPage should not be called when inView is false (default mock)
      expect(fetchNextPage).not.toHaveBeenCalled()
    })

    it('should not call fetchNextPage when already fetching next page', () => {
      const fetchNextPage = vi.fn()

      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                instances: [
                  {
                    id: 'instance-1',
                    provider: '0xprovider',
                    created_at: '2024-01-01T00:00:00Z',
                  },
                ],
              },
            },
          ],
        },
        fetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: true,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<Machines />)

      // fetchNextPage should not be called when already fetching
      expect(fetchNextPage).not.toHaveBeenCalled()
    })

    it('should not call fetchNextPage when no next page', () => {
      const fetchNextPage = vi.fn()

      mockUseNexusInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              data: {
                instances: [
                  {
                    id: 'instance-1',
                    provider: '0xprovider',
                    created_at: '2024-01-01T00:00:00Z',
                  },
                ],
              },
            },
          ],
        },
        fetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
        isFetched: true,
      } as any)

      render(<Machines />)

      // fetchNextPage should not be called when there's no next page
      expect(fetchNextPage).not.toHaveBeenCalled()
    })
  })
})
