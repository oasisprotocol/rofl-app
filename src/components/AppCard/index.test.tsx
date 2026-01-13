import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { AppCard } from './index'
import { MemoryRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'

// Mock ui-library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => React.createElement('div', { 'data-testid': 'tooltip' }, children),
  TooltipContent: ({ children }: any) => React.createElement('div', {}, children),
  TooltipProvider: ({ children }: any) => React.createElement('div', {}, children),
  TooltipTrigger: ({ children }: any) => React.createElement('div', {}, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, asChild, className, ...props }: any) => {
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, { className })
    }
    return React.createElement('button', { className, ...props }, children)
  },
}))

vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useAccount: vi.fn(() => ({ address: '0x123' })),
  }
})

// Mock ViewWithOnlyLogsPermission
vi.mock('./ViewWithOnlyLogsPermission', () => ({
  ViewWithOnlyLogsPermission: () =>
    React.createElement('div', { 'data-testid': 'view-logs-button' }, 'View Logs'),
}))

// Mock Badge
vi.mock('@oasisprotocol/ui-library/src/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) =>
    React.createElement('span', { className, 'data-variant': variant }, children),
}))

const mockApp = {
  id: 'test-app-id-123456789012345678901234567890123456789012345678901234567890',
  date_created: '2024-01-01T00:00:00Z',
  metadata: {
    'net.oasis.rofl.name': 'Test App',
    'net.oasis.rofl.description': 'A test application',
    'net.oasis.rofl.version': '1.0.0',
  },
  num_active_instances: 1,
  removed: false,
}

const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>

describe('AppCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render app name from metadata', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('should render trimmed app id when name is not in metadata', () => {
    const appWithoutName = { ...mockApp, metadata: {} }
    render(<AppCard app={appWithoutName} network="mainnet" type="explore" />, { wrapper })

    // Should show trimmed ID (the trimLongString function trims to 20 chars with ellipsis)
    const heading = screen.getByRole('heading')
    expect(heading.textContent).toMatch(/test-a/)
    expect(heading.textContent).toMatch(/567890/)
  })

  it('should render version badge for dashboard type', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    expect(screen.getByText('1.0.0')).toBeInTheDocument()
  })

  it('should render description for explore type', () => {
    render(<AppCard app={mockApp} network="mainnet" type="explore" />, { wrapper })

    expect(screen.getByText('A test application')).toBeInTheDocument()
  })

  it('should render explorer link', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    const explorerLink = screen.getByText('Explorer')
    expect(explorerLink).toBeInTheDocument()
    expect(explorerLink.closest('a')).toHaveAttribute(
      'href',
      'https://explorer.oasis.io/mainnet/sapphire/rofl/app/test-app-id-123456789012345678901234567890123456789012345678901234567890',
    )
  })

  it('should render view details button for dashboard type', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    expect(screen.getByText('View details')).toBeInTheDocument()
  })

  it('should render view logs button for explore type when address is present', () => {
    render(<AppCard app={mockApp} network="mainnet" type="explore" />, { wrapper })

    expect(screen.getByTestId('view-logs-button')).toBeInTheDocument()
  })

  it('should not render view logs button for explore type when no address', async () => {
    const wagmi = await import('wagmi')
    vi.spyOn(wagmi, 'useAccount').mockReturnValue({ address: undefined } as any)

    render(<AppCard app={mockApp} network="mainnet" type="explore" />, { wrapper })

    expect(screen.queryByTestId('view-logs-button')).not.toBeInTheDocument()
  })

  it('should use correct network for explorer link - testnet', () => {
    render(<AppCard app={mockApp} network="testnet" type="dashboard" />, { wrapper })

    const explorerLink = screen.getByText('Explorer')
    expect(explorerLink.closest('a')).toHaveAttribute(
      'href',
      'https://explorer.oasis.io/testnet/sapphire/rofl/app/test-app-id-123456789012345678901234567890123456789012345678901234567890',
    )
  })

  it('should render relative time for dashboard type', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    // Should show relative time like "about 1 year ago"
    expect(screen.getByText(/ago/)).toBeInTheDocument()
  })

  it('should render full app id in dashboard view', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    expect(screen.getByText(mockApp.id)).toBeInTheDocument()
  })

  it('should link to app details in dashboard view', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    const nameLink = screen.getByText('Test App').closest('a')
    expect(nameLink).toHaveAttribute(
      'href',
      '/dashboard/apps/test-app-id-123456789012345678901234567890123456789012345678901234567890',
    )
  })

  it('should not link to app details in explore view', () => {
    render(<AppCard app={mockApp} network="mainnet" type="explore" />, { wrapper })

    const nameElement = screen.getByText('Test App')
    expect(nameElement.closest('a')).toBeNull()
  })

  it('should not render version badge when version is not in metadata', () => {
    const appWithoutVersion = {
      ...mockApp,
      metadata: { 'net.oasis.rofl.name': 'Test App' },
    }
    render(<AppCard app={appWithoutVersion} network="mainnet" type="dashboard" />, { wrapper })

    expect(screen.queryByText('1.0.0')).not.toBeInTheDocument()
  })

  it('should not render description in dashboard view', () => {
    render(<AppCard app={mockApp} network="mainnet" type="dashboard" />, { wrapper })

    expect(screen.queryByText('A test application')).not.toBeInTheDocument()
  })
})
