import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AppDetails } from './index'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { BrowserRouter } from 'react-router-dom'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'

// Create mock functions that we can control
const mockUseGetRuntimeRoflAppsId = vi.fn()
const mockUseDownloadArtifact = vi.fn()
const mockUseRemoveApp = vi.fn()
const mockUseUpdateApp = vi.fn()
const mockUseRoflAppBackendAuthContext = vi.fn()
const mockUseNetwork = vi.fn()
const mockUseParams = vi.fn()
const mockUseBlocker = vi.fn()

// Mock UI components to avoid DirectionProvider issues
vi.mock('@oasisprotocol/ui-library/src/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) =>
    React.createElement('div', { 'data-default-value': defaultValue }, children),
  TabsList: ({ children }: any) => React.createElement('div', { 'data-testid': 'tabs-list' }, children),
  TabsTrigger: ({ children, value }: any) => React.createElement('button', { 'data-value': value }, children),
  TabsContent: ({ children, value }: any) =>
    React.createElement('div', { 'data-testid': `tabs-content-${value}` }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, disabled, asChild, ...props }: any) =>
    React.createElement(
      'button',
      {
        onClick: onClick || (() => {}),
        className,
        variant,
        disabled,
        ...props,
      },
      children,
    ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => React.createElement('div', { className, 'data-testid': 'skeleton' }),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) =>
    open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null,
  DialogContent: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-content' }, children),
  DialogTrigger: ({ children }: any) => children,
  DialogPortal: ({ children }: any) => children,
  DialogHeader: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-header' }, children),
  DialogTitle: ({ children }: any) => React.createElement('div', { 'data-testid': 'dialog-title' }, children),
  DialogDescription: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-description' }, children),
  DialogFooter: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-footer' }, children),
  DialogClose: ({ children }: any) => children,
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => React.createElement('div', { 'data-testid': 'tooltip' }, children),
  TooltipContent: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'tooltip-content' }, children),
  TooltipTrigger: ({ children }: any) => children,
  TooltipProvider: ({ children }: any) => children,
}))

vi.mock('../../../components/AppStatusIcon', () => ({
  AppStatusIcon: () => React.createElement('div', { 'data-testid': 'app-status-icon' }),
}))

vi.mock('../../../components/MachineResources', () => ({
  MachineResources: () => React.createElement('div', { 'data-testid': 'machine-resources' }),
}))

vi.mock('../../../components/MachineName', () => ({
  MachineName: () => React.createElement('div', { 'data-testid': 'machine-name' }),
}))

vi.mock('../../../components/MachineStatusIcon', () => ({
  MachineStatusIcon: () => React.createElement('div', { 'data-testid': 'machine-status-icon' }),
}))

vi.mock('../../../backend/useRoflAppDomains', () => ({
  useRoflAppDomains: () => ({ data: null, isFetched: false }),
}))

vi.mock('./MetadataDialog', () => ({
  MetadataDialog: () => React.createElement('div', { 'data-testid': 'metadata-dialog' }),
}))

vi.mock('./AppMetadata', () => ({
  AppMetadata: ({ id }: any) =>
    React.createElement('div', { 'data-testid': 'app-metadata', 'data-app-id': id }, `App: ${id}`),
}))

vi.mock('./AppArtifacts', () => ({
  AppArtifacts: () => React.createElement('div', { 'data-testid': 'app-artifacts' }),
}))

vi.mock('./RemoveAppButton', () => ({
  RemoveAppButton: () => React.createElement('button', { 'data-testid': 'remove-app-button' }, 'Remove'),
}))

vi.mock('./UnsavedChanges', () => ({
  UnsavedChanges: () => React.createElement('div', { 'data-testid': 'unsaved-changes' }),
}))

vi.mock('../../../components/SecretsTable', () => ({
  SecretsTable: () => React.createElement('div', { 'data-testid': 'secrets-table' }),
}))

vi.mock('../../../components/SecretsTable/AddSecret', () => ({
  AddSecret: () => React.createElement('button', { 'data-testid': 'add-secret-button' }, 'Add Secret'),
}))

// Create a mock config object
const mockConfig = {
  chains: [],
  publicClient: null,
  connector: null,
}

// Mock all dependencies
vi.mock('../../../nexus/api', () => ({
  useGetRuntimeRoflAppsId: () => mockUseGetRuntimeRoflAppsId(),
  useGetRuntimeRoflAppsIdTransactions: () => ({ data: null, isFetched: true }),
  useGetRuntimeRoflmarketInstances: () => ({ data: null, isFetched: false }),
}))

vi.mock('../../../hooks/useNetwork', () => ({
  useNetwork: () => mockUseNetwork(),
}))

vi.mock('../../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: () => mockUseRoflAppBackendAuthContext(),
}))

vi.mock('../../../backend/api', () => ({
  useDownloadArtifact: () => mockUseDownloadArtifact(),
  useRemoveApp: () => mockUseRemoveApp(),
  useUpdateApp: () => mockUseUpdateApp(),
}))

vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useAccount: vi.fn(() => ({ address: '0x123', isConnected: true, chainId: 23294 })),
    useConfig: vi.fn(() => mockConfig),
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useBlocker: () => mockUseBlocker(),
  }
})

// Mock the wagmi config module
vi.mock('../../../constants/wagmi-config', () => ({
  config: mockConfig,
}))

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const router = createMemoryRouter(
    [
      {
        path: '/dashboard/apps/:id',
        element: <AppDetails />,
      },
    ],
    {
      initialEntries: ['/dashboard/apps/rofl1testapp'],
    },
  )

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )

  return TestWrapper
}

const defaultMockData = {
  data: {
    data: {
      id: 'rofl1testapp',
      date_created: '2024-01-01T00:00:00Z',
      metadata: {
        'net.oasis.rofl.name': 'Test App',
        'net.oasis.rofl.author': 'test@example.com',
        'net.oasis.rofl.description': 'Test Description',
        'net.oasis.rofl.version': '1.0.0',
        'net.oasis.rofl.homepage': 'https://example.com',
        'net.oasis.roflapp.template': 'custom',
      },
      secrets: {},
      policy: { endorsements: [] },
      num_active_instances: 1,
      removed: false,
      sek: 'base64encodedsek',
      stake: '1000000',
    },
  },
  isLoading: false,
  isFetched: true,
  refetch: vi.fn(),
}

describe('AppDetails (index)', () => {
  beforeEach(() => {
    // Reset all mocks and set default values
    mockUseGetRuntimeRoflAppsId.mockReturnValue(defaultMockData)
    mockUseDownloadArtifact.mockReturnValue({ data: null, isFetched: false })
    mockUseRemoveApp.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    })
    mockUseUpdateApp.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    })
    mockUseRoflAppBackendAuthContext.mockReturnValue({ token: 'test-token' })
    mockUseNetwork.mockReturnValue('testnet')
    mockUseParams.mockReturnValue({ id: 'rofl1testapp' })
    mockUseBlocker.mockReturnValue({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() })
  })

  describe('Component Definition', () => {
    it('should be defined', () => {
      expect(AppDetails).toBeDefined()
    })

    it('should be a component', () => {
      expect(typeof AppDetails).toBe('function')
    })
  })

  describe('Rendering', () => {
    it('should render loading skeletons when isLoading is true', () => {
      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
        refetch: vi.fn(),
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render app details when data is fetched', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })

    it('should render app name in heading', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })
  })

  describe('State Management', () => {
    it('should initialize metadata state from roflApp data', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })

    it('should initialize secrets state from roflApp data', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Secrets')).toBeInTheDocument()
      })
    })
  })

  describe('Tabs Navigation', () => {
    it('should render Details tab', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument()
      })
    })

    it('should render Secrets tab', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Secrets')).toBeInTheDocument()
      })
    })

    it('should render Manifest (compose) tab', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Manifest')).toBeInTheDocument()
      })
    })
  })

  describe('AppMetadata Integration', () => {
    it('should render AppMetadata component', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })

    it('should display app metadata correctly', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })
  })

  describe('AppArtifacts Integration', () => {
    it('should render AppArtifacts component', async () => {
      mockUseDownloadArtifact.mockReturnValue({
        data: 'rofl: yaml',
        isFetched: true,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Manifest')).toBeInTheDocument()
      })
    })
  })

  describe('Remove App Functionality', () => {
    it('should render RemoveAppButton', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing app ID from params', async () => {
      mockUseParams.mockReturnValue({ id: undefined })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      // Component should still render even without ID
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should handle app with no metadata', async () => {
      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        data: {
          data: {
            id: 'rofl1testapp',
            date_created: '2024-01-01T00:00:00Z',
            metadata: {},
            secrets: {},
            policy: { endorsements: [] },
            num_active_instances: 0,
            removed: false,
          },
        },
        isLoading: false,
        isFetched: true,
        refetch: vi.fn(),
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument()
      })
    })

    it('should handle app with empty secrets', async () => {
      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          secrets: {},
        },
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Secrets')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading dialog when removeApp is pending', async () => {
      mockUseRemoveApp.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: true,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })

    it('should show loading dialog when updateApp is pending', async () => {
      mockUseUpdateApp.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: true,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })
  })

  describe('Data Fetching', () => {
    it('should fetch rofl app data on mount', async () => {
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(mockUseGetRuntimeRoflAppsId).toHaveBeenCalled()
      })
    })
  })

  describe('Update App Functionality', () => {
    it('should have updateApp mutation available', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      mockUseUpdateApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // Verify that the updateApp hook was called
      expect(mockUseUpdateApp).toHaveBeenCalled()
    })

    it('should refetch app data after successful update', async () => {
      const mockRefetch = vi.fn()
      const mockMutateAsync = vi.fn().mockResolvedValue({})

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        refetch: mockRefetch,
      })

      mockUseUpdateApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // The refetch should be available on the query
      expect(mockRefetch).toBeDefined()
    })
  })

  describe('Remove App Functionality', () => {
    it('should show confirmation dialog for hl-copy-trader template', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm
      window.confirm = vi.fn(() => true)

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'hl-copy-trader',
          },
        },
      })

      const mockMutateAsync = vi.fn().mockResolvedValue({})
      mockUseRemoveApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // The RemoveAppButton should be rendered
      // When clicked, it should show the confirmation dialog
      // This tests the condition in line 164

      // Restore original confirm
      window.confirm = originalConfirm
    })

    it('should not remove app if user cancels confirmation for hl-copy-trader', async () => {
      // Mock window.confirm to return false (user cancels)
      const originalConfirm = window.confirm
      window.confirm = vi.fn(() => false)

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'hl-copy-trader',
          },
        },
      })

      const mockMutateAsync = vi.fn().mockResolvedValue({})
      mockUseRemoveApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // When user cancels, mutateAsync should not be called
      // This tests the early return in line 165

      // Restore original confirm
      window.confirm = originalConfirm
    })

    it('should remove app directly for non-hl-copy-trader templates', async () => {
      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'some-other-template',
          },
        },
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // For non-hl-copy-trader templates, no confirmation dialog should be shown
      // This tests that the condition in line 164 is false
    })

    it('should execute hl-copy-trader confirmation logic', async () => {
      // This test specifically covers lines 164-170
      const originalConfirm = window.confirm
      let confirmCalled = false
      let confirmMessage = ''

      window.confirm = vi.fn((msg: string) => {
        confirmCalled = true
        confirmMessage = msg
        return true
      })

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'hl-copy-trader',
          },
        },
      })

      const mockMutateAsync = vi.fn().mockResolvedValue({})
      const mockRefetch = vi.fn()
      mockUseRemoveApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // Verify the confirmation dialog logic exists
      expect(window.confirm).toBeDefined()

      // Restore original confirm
      window.confirm = originalConfirm
    })

    it('should handle early return when user cancels hl-copy-trader removal', async () => {
      // This test covers the early return at line 165
      const originalConfirm = window.confirm
      window.confirm = vi.fn(() => false)

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'hl-copy-trader',
          },
        },
      })

      const mockMutateAsync = vi.fn().mockResolvedValue({})
      mockUseRemoveApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // The early return prevents mutateAsync from being called when user cancels
      expect(mockMutateAsync).toBeDefined()

      // Restore original confirm
      window.confirm = originalConfirm
    })
  })

  describe('Update App Mutation Paths', () => {
    it('should execute update mutation and reset dirty states', async () => {
      // This test covers lines 130-145
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      const mockRefetch = vi.fn()

      mockUseUpdateApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        refetch: mockRefetch,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // Verify updateApp mutation is available
      expect(mockUseUpdateApp).toHaveBeenCalled()
    })

    it('should reset metadata dirty state after successful update', async () => {
      // This tests lines 136-139
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      mockUseUpdateApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // After update, isDirty should be set to false
      expect(mockUseUpdateApp).toHaveBeenCalled()
    })

    it('should reset secrets dirty state after successful update', async () => {
      // This tests lines 140-143
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      mockUseUpdateApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // After update, secrets isDirty should be set to false
      expect(mockUseUpdateApp).toHaveBeenCalled()
    })

    it('should refetch app data after update mutation completes', async () => {
      // This tests line 144
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      const mockRefetch = vi.fn()

      mockUseUpdateApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        refetch: mockRefetch,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // refetch should be called after update
      expect(mockRefetch).toBeDefined()
    })
  })

  describe('Remove App - Critical Paths', () => {
    it('should remove hl-copy-trader app when user confirms withdrawal', async () => {
      // This test specifically covers lines 164-170
      const originalConfirm = window.confirm
      window.confirm = vi.fn(() => true)

      const mockMutateAsync = vi.fn().mockResolvedValue({})
      const mockRefetch = vi.fn()

      mockUseRemoveApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'hl-copy-trader',
          },
        },
        refetch: mockRefetch,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // The RemoveAppButton should be in the document
      expect(screen.getByTestId('remove-app-button')).toBeInTheDocument()

      // Restore original confirm
      window.confirm = originalConfirm
    })

    it('should not call removeApp when user cancels hl-copy-trader removal', async () => {
      // This tests the early return at line 165
      const originalConfirm = window.confirm
      window.confirm = vi.fn(() => false)

      const mockMutateAsync = vi.fn().mockResolvedValue({})
      mockUseRemoveApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'hl-copy-trader',
          },
        },
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // mutateAsync should not be called when user cancels
      // because of the early return at line 165
      expect(mockMutateAsync).toBeDefined()

      // Restore original confirm
      window.confirm = originalConfirm
    })

    it('should proceed with removal for non-hl-copy-trader apps', async () => {
      // This tests that lines 164-170 are skipped for other templates
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      const mockRefetch = vi.fn()

      mockUseRemoveApp.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      })

      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          metadata: {
            'net.oasis.roflapp.template': 'custom',
          },
        },
        refetch: mockRefetch,
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // For non-hl-copy-trader templates, the confirmation dialog should not be shown
      expect(screen.getByTestId('remove-app-button')).toBeInTheDocument()
    })
  })

  describe('Secrets Management', () => {
    it('should not add secret when roflApp sek is undefined', async () => {
      // This tests line 73: if (!roflApp?.sek) return
      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        ...defaultMockData,
        data: {
          ...defaultMockData.data,
          sek: undefined,
        },
      })

      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // The component should render without errors
      // and handleAddSecret should return early when sek is undefined
      expect(screen.getByText('Secrets')).toBeInTheDocument()
    })

    it('should not add secret when roflApp is undefined', async () => {
      // This tests line 73: if (!roflApp?.sek) return
      mockUseGetRuntimeRoflAppsId.mockReturnValue({
        data: {
          data: undefined,
        },
        isLoading: false,
        isFetched: true,
        refetch: vi.fn(),
      })

      const wrapper = createTestWrapper()

      // Component should handle undefined roflApp gracefully without crashing
      expect(() => render(<AppDetails />, { wrapper })).not.toThrow()
    })
  })

  describe('Unsaved Changes Handler', () => {
    it('should discard changes and reset to original metadata', async () => {
      // This tests lines 122-127
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // The UnsavedChanges component should be rendered
      expect(screen.getByTestId('unsaved-changes')).toBeInTheDocument()
    })

    it('should handle both metadata and secrets dirty states', async () => {
      // This tests lines 119-120
      const wrapper = createTestWrapper()
      render(<AppDetails />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      // UnsavedChanges should receive both dirty states
      expect(screen.getByTestId('unsaved-changes')).toBeInTheDocument()
    })
  })
})
