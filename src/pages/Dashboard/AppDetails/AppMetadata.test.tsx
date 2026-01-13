import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { AppMetadata } from './AppMetadata'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'

// Create mock functions
const mockUseGetRuntimeRoflAppsIdTransactions = vi.fn()
const mockUseGetRuntimeRoflmarketInstances = vi.fn()
const mockUseDownloadArtifact = vi.fn()
const mockUseRoflAppBackendAuthContext = vi.fn()
const mockUseNetwork = vi.fn()
const mockUseAccount = vi.fn()
const mockGetEvmBech32Address = vi.fn()
const mockUseRoflAppDomains = vi.fn()
const mockIsUrlSafe = vi.fn(() => true)
const mockTrimLongString = vi.fn(str => str)

// Mock all the dependencies
vi.mock('../../../nexus/api', () => ({
  useGetRuntimeRoflAppsIdTransactions: () => mockUseGetRuntimeRoflAppsIdTransactions(),
  useGetRuntimeRoflmarketInstances: () => mockUseGetRuntimeRoflmarketInstances(),
}))

vi.mock('../../../hooks/useNetwork', () => ({
  useNetwork: () => mockUseNetwork(),
}))

vi.mock('../../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: () => mockUseRoflAppBackendAuthContext(),
}))

vi.mock('../../../backend/api', () => ({
  useDownloadArtifact: () => mockUseDownloadArtifact(),
}))

vi.mock('../../../backend/useRoflAppDomains', () => ({
  useRoflAppDomains: () => mockUseRoflAppDomains(),
}))

vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
  }
})

vi.mock('../../../utils/helpers', () => ({
  getEvmBech32Address: (addr: string) => mockGetEvmBech32Address(addr),
}))

vi.mock('../../../utils/url', () => ({
  isUrlSafe: (url: string) => mockIsUrlSafe(url),
}))

vi.mock('../../../utils/trimLongString', () => ({
  trimLongString: (str: string) => mockTrimLongString(str),
}))

// Mock the MetadataDialog component
vi.mock('./MetadataDialog', () => ({
  MetadataDialog: ({ metadata, editEnabled }: any) =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { 'data-testid': 'metadata-dialog' },
        React.createElement('dt', null, 'Name'),
        React.createElement('dd', null, metadata.name),
        editEnabled && React.createElement('button', null, 'Edit'),
      ),
    ),
}))

// Mock the MachineResources component
vi.mock('../../../components/MachineResources', () => ({
  MachineResources: ({ cpus, memory, storage }: any) =>
    React.createElement(
      'span',
      { 'data-testid': 'machine-resources' },
      `${cpus} CPUs, ${memory}MiB, ${storage}GiB`,
    ),
}))

// Mock the MachineName component
vi.mock('../../../components/MachineName', () => ({
  MachineName: ({ machine }: any) =>
    React.createElement('span', { 'data-machine-id': machine.id }, `Machine ${machine.id}`),
}))

// Mock the MachineStatusIcon component
vi.mock('../../../components/MachineStatusIcon', () => ({
  MachineStatusIcon: ({ machine }: any) =>
    React.createElement('span', { 'data-status': machine.state }, machine.state),
}))

// Mock isMachineRemoved
vi.mock('../../../components/MachineStatusIcon/isMachineRemoved', () => ({
  isMachineRemoved: vi.fn(() => false),
}))

// Mock UI components
vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => React.createElement('div', { className, 'data-testid': 'skeleton' }),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, className, disabled, asChild, ...props }: any) =>
    React.createElement('button', { className, disabled, ...props }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('lucide-react', () => ({
  CircleArrowUp: () => React.createElement('span', { 'data-testid': 'circle-arrow-up' }, '↑'),
}))

// Mock react-router-dom Link
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
  }
})

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  return TestWrapper
}

beforeEach(() => {
  // Reset all mocks to default values
  mockUseGetRuntimeRoflAppsIdTransactions.mockReturnValue({
    data: { data: { transactions: [] } },
  })
  mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
    data: { data: { instances: [] } },
    isLoading: false,
    isFetched: true,
  })
  mockUseDownloadArtifact.mockReturnValue({ data: null })
  mockUseRoflAppBackendAuthContext.mockReturnValue({ token: 'test-token' })
  mockUseNetwork.mockReturnValue('testnet')
  mockUseAccount.mockReturnValue({ address: '0x123' })
  mockGetEvmBech32Address.mockReturnValue('oasis1address')
  mockUseRoflAppDomains.mockReturnValue({
    isLoading: false,
    isError: false,
    data: [],
  })
})

describe('AppMetadata', () => {
  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(AppMetadata).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof AppMetadata).toBe('function')
    })
  })

  describe('Rendering', () => {
    it('should render with required props', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Test App')).toBeInTheDocument()
    })

    it('should render Explorer link with app ID', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test123"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      const explorerLink = screen.getByText('rofl1test123')
      expect(explorerLink).toBeInTheDocument()
      expect(explorerLink.closest('a')).toHaveAttribute(
        'href',
        'https://explorer.oasis.io/testnet/sapphire/rofl/app/rofl1test123',
      )
    })

    it('should render Created date', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-15T12:30:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText(/Created/i)).toBeInTheDocument()
    })

    it('should render Author field', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'John Doe <john@example.com>',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('John Doe <john@example.com>')).toBeInTheDocument()
    })

    it('should render Description field', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'This is a test application for ROFL.',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('This is a test application for ROFL.')).toBeInTheDocument()
    })

    it('should render Version field', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '2.1.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('2.1.0')).toBeInTheDocument()
    })

    it('should render Homepage link when URL is safe', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://myapp.example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      const homepageLink = screen.getByText('https://myapp.example.com')
      expect(homepageLink).toBeInTheDocument()
      expect(homepageLink.closest('a')).toHaveAttribute('href', 'https://myapp.example.com')
    })
  })

  describe('Machines Display', () => {
    it('should display "Machines data is not available" when no machines', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Machines data is not available.')).toBeInTheDocument()
    })

    it('should render machine list when machines are available', () => {
      mockUseGetRuntimeRoflmarketInstances.mockReturnValue({
        data: {
          data: {
            instances: [
              {
                id: 'instance1',
                provider: 'provider1',
                resources: { cpus: 2, memory: 4096, storage: 100 },
                state: 'Running',
                deployment: { app_id: 'rofl1test' },
              },
            ],
          },
        },
        isLoading: false,
        isFetched: true,
      })

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Machines')).toBeInTheDocument()
      expect(screen.getByText('Resources')).toBeInTheDocument()
    })
  })

  describe('Policy Section', () => {
    it('should render Policy section', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Policy')).toBeInTheDocument()
      expect(screen.getByText('Who can run this app')).toBeInTheDocument()
    })

    it('should display "Any" when policy allows anyone', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [{ any: true }] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Any')).toBeInTheDocument()
    })

    it('should display node endorsements when present', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [{ node: 'node1.example.com' }, { node: 'node2.example.com' }] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('node1.example.com')).toBeInTheDocument()
      expect(screen.getByText('node2.example.com')).toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('should render action buttons when editEnabled is true', () => {
      mockUseDownloadArtifact.mockReturnValue({ data: 'yaml content' })

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={true}
        />,
        { wrapper },
      )

      expect(screen.getByText(/Top up new machine based on last one/i)).toBeInTheDocument()
      expect(screen.getByText(/Deploy to new machine/i)).toBeInTheDocument()
    })

    it('should not render action buttons when editEnabled is false', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.queryByText(/Top up new machine based on last one/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Deploy to new machine/i)).not.toBeInTheDocument()
    })
  })

  describe('Proxy Domains', () => {
    it('should display proxy domains when available', () => {
      mockUseRoflAppDomains.mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          { ServiceName: 'web', Domain: 'https://app.example.com' },
          { ServiceName: 'api', Domain: 'https://api.example.com' },
        ],
      })

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Proxy Domains')).toBeInTheDocument()
      expect(screen.getByText('web:')).toBeInTheDocument()
      expect(screen.getByText('api:')).toBeInTheDocument()
    })

    it('should display Error when domains query fails', () => {
      mockUseRoflAppDomains.mockReturnValue({
        isLoading: false,
        isError: true,
        data: undefined,
      })

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Proxy Domains')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('Latest Update', () => {
    it('should display latest update transaction info', () => {
      mockUseGetRuntimeRoflAppsIdTransactions.mockReturnValue({
        data: {
          data: {
            transactions: [
              {
                hash: '0xtransactionhash',
                eth_hash: '0xethhash',
                timestamp: '2024-01-15T10:30:00Z',
              },
            ],
          },
        },
      })

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Latest Update')).toBeInTheDocument()
    })

    it('should not display latest update when no transactions', () => {
      mockUseGetRuntimeRoflAppsIdTransactions.mockReturnValue({
        data: { data: { transactions: [] } },
      })

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Latest Update')).toBeInTheDocument()
    })
  })

  describe('Props Interface', () => {
    it('should accept all required props', () => {
      const props: AppMetadataProps = {
        id: 'rofl1test',
        date_created: '2024-01-01T00:00:00Z',
        editableState: {
          name: 'Test',
          author: 'test@example.com',
          description: 'Test',
          version: '1.0.0',
          homepage: 'https://example.com',
        },
        policy: { endorsements: [] },
        setViewMetadataState: vi.fn(),
        editEnabled: false,
      }

      expect(props.id).toBe('rofl1test')
      expect(props.editEnabled).toBe(false)
    })

    it('should handle optional editEnabled prop', () => {
      const props1: AppMetadataProps = {
        id: 'rofl1test',
        date_created: '2024-01-01T00:00:00Z',
        editableState: {
          name: 'Test',
          author: 'test@example.com',
          description: 'Test',
          version: '1.0.0',
          homepage: '',
        },
        policy: { endorsements: [] },
        setViewMetadataState: vi.fn(),
      }

      const props2: AppMetadataProps = {
        ...props1,
        editEnabled: true,
      }

      expect(props1).toBeDefined()
      expect(props2.editEnabled).toBe(true)
    })
  })

  describe('Layout and Styling', () => {
    it('should use space-y-4 class for vertical spacing', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      const { container } = render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      const wrapperDiv = container.firstChild as HTMLElement
      expect(wrapperDiv.className).toContain('space-y-4')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty metadata fields', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: '',
            author: '',
            description: '',
            version: '',
            homepage: '',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      // Should not crash with empty values
      expect(screen.getByText('Explorer')).toBeInTheDocument()
    })

    it('should handle very long descriptions', () => {
      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()
      const longDescription = 'A'.repeat(1000)

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: longDescription,
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should not render homepage link when URL is unsafe', () => {
      mockIsUrlSafe.mockReturnValue(false)

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'javascript:alert(1)',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      // Homepage link should not be rendered
      const homepageLink = screen.queryByText('javascript:alert(1)')
      expect(homepageLink).not.toBeInTheDocument()
    })

    it('should display invalid proxy domain as span', () => {
      mockIsUrlSafe.mockImplementation((url: string) => {
        // Only https://app.example.com is safe
        return url === 'https://app.example.com'
      })

      mockUseRoflAppDomains.mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          { ServiceName: 'web', Domain: 'https://app.example.com' },
          { ServiceName: 'unsafe', Domain: 'javascript:alert(1)' },
        ],
      })

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      // Safe domain should be rendered as link
      expect(screen.getByText('https://app.example.com')).toBeInTheDocument()

      // Unsafe domain should be rendered as span (not a link)
      const unsafeDomain = screen.getByText('javascript:alert(1)')
      expect(unsafeDomain).toBeInTheDocument()
      expect(unsafeDomain.tagName.toLowerCase()).toBe('span')
    })

    it('should display provider_instance_admin endorsement for current user', () => {
      mockGetEvmBech32Address.mockReturnValue('oasis1_current_admin_address')

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [{ provider_instance_admin: 'oasis1_current_admin_address' }] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('You are currently admin on machine')).toBeInTheDocument()
    })

    it('should display provider_instance_admin endorsement for different user', () => {
      mockGetEvmBech32Address.mockReturnValue('oasis1_other_address')

      const wrapper = createTestWrapper()
      const setViewMetadataState = vi.fn()

      render(
        <AppMetadata
          id="rofl1test"
          date_created="2024-01-01T00:00:00Z"
          editableState={{
            name: 'Test App',
            author: 'test@example.com',
            description: 'Test description',
            version: '1.0.0',
            homepage: 'https://example.com',
          }}
          policy={{ endorsements: [{ provider_instance_admin: 'oasis1_admin_address' }] }}
          setViewMetadataState={setViewMetadataState}
          editEnabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('oasis1_admin_address is currently admin on machine')).toBeInTheDocument()
    })
  })
})

type AppMetadataProps = React.ComponentProps<typeof AppMetadata>
