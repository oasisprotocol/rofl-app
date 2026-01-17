import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import * as React from 'react'

// Mock all dependencies BEFORE importing the component
vi.mock('../constants/wagmi-config', () => ({
  wagmiConfig: {},
}))

// Mock the Layout component which wraps BootstrapStep content
vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ children, headerContent, footerContent }: any) =>
    React.createElement(React.Fragment, null, headerContent, children, footerContent),
}))

// Mock Header and Footer components since they're not the focus of this test
vi.mock('../../components/Layout/Header', () => ({
  Header: () => React.createElement('header', { 'data-testid': 'header' }, 'Header'),
}))

vi.mock('../../components/Layout/Footer', () => ({
  Footer: () => React.createElement('footer', { 'data-testid': 'footer' }, 'Footer'),
}))

// Mock the hook to return our mock value
vi.mock('../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: () => ({
    token: 'mock-token',
    isAuthenticated: true,
    status: 'authenticated',
  }),
}))

vi.mock('../../backend/api', () => ({
  useCreateAndDeployApp: () => ({
    progress: {
      steps: ['creating', 'building', 'updating', 'deploying'],
      currentStep: 'creating',
      stepEstimatedDurations: {
        creating: 5000,
        building: 10000,
      },
      stepLabels: {
        creating: 'Creating',
        building: 'Building',
        updating: 'Updating',
        deploying: 'Deploying',
      },
    },
    mutate: vi.fn(),
  }),
}))

vi.mock('../../hooks/useNetwork', () => ({
  useNetwork: () => 'mainnet',
}))

vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useAccount: vi.fn(() => ({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      chainId: 1,
      connector: undefined,
    })),
    useDisconnect: vi.fn(() => ({
      disconnect: vi.fn(),
    })),
  }
})

vi.mock('../../components/RainbowKitConnectButton', () => ({
  RainbowKitConnectButton: () => null,
}))

vi.mock('../../components/BuildBadge', () => ({
  BuildBadge: () => null,
}))

// NOW import the component after mocks are set up
import { BootstrapStep, BootstrapState } from './BootstrapStep'
import type { AppData } from './types'

// Mock global constants before importing components that use them
declare global {
  const APP_VERSION: string
  const BUILD_COMMIT: string
  const BUILD_DATETIME: number
  const GITHUB_REPOSITORY_URL: string
}

global.APP_VERSION = '1.2.3'
global.BUILD_COMMIT = 'abcdef1234567890'
global.BUILD_DATETIME = 1704067200000 // 2024-01-01 00:00:00 UTC
global.GITHUB_REPOSITORY_URL = 'https://github.com/oasisprotocol/rofl-app/'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<HashRouter>{component}</HashRouter>)
}

const mockTemplate = {
  name: 'Test Template',
  description: 'A test template',
  id: 'test-template',
  initialValues: {
    metadata: {
      name: 'Test App',
      author: 'test@example.com',
      description: 'Test description',
      version: '1.0.0',
      homepage: 'https://example.com',
    },
    build: {},
  },
  yaml: {
    compose: 'version: "3.8"',
    rofl: {},
  },
}

const mockAppData: AppData = {
  templateId: 'test-template',
  metadata: {
    name: 'Test App',
    author: 'test@example.com',
    description: 'Test description',
    version: '1.0.0',
    homepage: 'https://example.com',
  },
  inputs: {},
  network: 'mainnet',
  build: {},
}

describe('BootstrapStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('BootstrapState enum', () => {
    it('has correct Pending value', () => {
      expect(BootstrapState.Pending).toBe('pending')
    })

    it('has correct Success value', () => {
      expect(BootstrapState.Success).toBe('success')
    })

    it('has correct Error value', () => {
      expect(BootstrapState.Error).toBe('error')
    })

    it('has all three states defined', () => {
      expect(Object.keys(BootstrapState).length).toBe(3)
    })
  })

  describe('Component', () => {
    it('exports BootstrapStep component', () => {
      expect(BootstrapStep).toBeDefined()
      expect(typeof BootstrapStep).toBe('function')
    })

    it('renders without crashing when all props are provided', () => {
      renderWithRouter(<BootstrapStep appData={mockAppData} template={mockTemplate} />)

      // Should render the Steps component which displays step labels
      expect(screen.getByText('Creating')).toBeInTheDocument()
      expect(screen.getByText('Building')).toBeInTheDocument()
      expect(screen.getByText('Updating')).toBeInTheDocument()
      expect(screen.getByText('Deploying')).toBeInTheDocument()
    })

    it('renders without appData', () => {
      renderWithRouter(<BootstrapStep template={mockTemplate} />)

      // Should still render the layout even without appData
      expect(screen.getByText('Creating')).toBeInTheDocument()
    })

    it('renders without template', () => {
      renderWithRouter(<BootstrapStep appData={mockAppData} />)

      // Should still render the layout even without template
      expect(screen.getByText('Creating')).toBeInTheDocument()
    })

    it('renders with minimal props', () => {
      renderWithRouter(<BootstrapStep />)

      // Should render the layout
      expect(screen.getByText('Creating')).toBeInTheDocument()
    })

    it('displays the current step text', () => {
      renderWithRouter(<BootstrapStep appData={mockAppData} template={mockTemplate} />)

      // Should show the creating step text
      expect(screen.getByText('Creating app...')).toBeInTheDocument()
    })

    it('includes Header and Footer components', () => {
      renderWithRouter(<BootstrapStep appData={mockAppData} template={mockTemplate} />)

      // Header should be present (mocked)
      expect(screen.getByTestId('header')).toBeInTheDocument()

      // Footer should be present (mocked)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders video loader when in pending state', () => {
      renderWithRouter(<BootstrapStep appData={mockAppData} template={mockTemplate} />)

      // Video element should be present for the loading animation
      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
    })

    it('passes correct progress to Steps component', () => {
      renderWithRouter(<BootstrapStep appData={mockAppData} template={mockTemplate} />)

      // Steps should display all step labels
      expect(screen.getByText('Creating')).toBeInTheDocument()
      expect(screen.getByText('Building')).toBeInTheDocument()
      expect(screen.getByText('Updating')).toBeInTheDocument()
      expect(screen.getByText('Deploying')).toBeInTheDocument()
    })
  })
})
