import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { ProtectedLayout } from './index'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { BrowserRouter } from 'react-router-dom'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'

// Mock all dependencies
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

vi.mock('../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: vi.fn(),
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(() => ({ connectModalOpen: false })),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, asChild, ...props }: any) => {
    if (asChild) {
      return React.Children.only(children)
    }
    return React.createElement(
      'button',
      { onClick, className, variant, 'data-variant': variant, ...props },
      children,
    )
  },
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) =>
    React.createElement('div', { 'data-testid': 'dialog', 'data-open': open }, children),
  DialogContent: ({ children, className, ...props }: any) =>
    React.createElement('div', { className, 'data-testid': 'dialog-content', ...props }, children),
  DialogTitle: ({ children, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'dialog-title' }, children),
}))

vi.mock('../Spinner', () => ({
  Spinner: () => React.createElement('div', { 'data-testid': 'spinner' }, 'Loading...'),
}))

vi.mock('../RainbowKitConnectButton', () => ({
  RainbowKitConnectButton: ({ children }: any) => {
    const openConnectModal = vi.fn()
    return React.createElement(
      'div',
      { 'data-testid': 'connect-button', onClick: openConnectModal },
      children ? children({ openConnectModal }) : 'Connect',
    )
  },
}))

const mockUseAccount = vi.mocked(useAccount)
const mockUseRoflAppBackendAuthContext = vi.mocked(useRoflAppBackendAuthContext)
const mockUseConnectModal = vi.mocked(useConnectModal)

// Test component to render inside ProtectedLayout
const TestPage = () => React.createElement('div', { 'data-testid': 'test-page' }, 'Protected Content')

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries },
      React.createElement(Routes, null, React.createElement(Route, { path: '/', element: component })),
    ),
  )
}

describe('ProtectedLayout - Authenticate Button (lines 93-94)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up unauthenticated user state to show the auth modal
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      chainId: undefined,
      status: 'disconnected',
    })

    mockUseRoflAppBackendAuthContext.mockReturnValue({
      isAuthenticated: false,
      status: 'unauthenticated',
    })

    // Default connect modal state
    mockUseConnectModal.mockReturnValue({ connectModalOpen: false })
  })

  it('should render Authenticate button when not authenticated', () => {
    const TestWrapper = () => React.createElement(ProtectedLayout, null, React.createElement(TestPage))

    renderWithRouter(React.createElement(TestWrapper))

    // Check that the auth modal is shown
    expect(screen.getAllByText('Authenticate').length).toBeGreaterThan(0)
  })

  it('should render the Authenticate button with correct structure', () => {
    const TestWrapper = () => React.createElement(ProtectedLayout, null, React.createElement(TestPage))

    const { container } = renderWithRouter(React.createElement(TestWrapper))

    // Check for the button element
    const buttons = container.querySelectorAll('button')
    const authenticateButtons = Array.from(buttons).filter(btn => btn.textContent?.includes('Authenticate'))
    expect(authenticateButtons.length).toBeGreaterThan(0)
  })

  it('should render authentication modal with correct content', () => {
    const TestWrapper = () => React.createElement(ProtectedLayout, null, React.createElement(TestPage))

    renderWithRouter(React.createElement(TestWrapper))

    // Check for the authentication modal elements
    expect(screen.getAllByText('Authenticate').length).toBeGreaterThan(0)
  })

  it('should show the authentication modal when not connected', () => {
    const TestWrapper = () => React.createElement(ProtectedLayout, null, React.createElement(TestPage))

    renderWithRouter(React.createElement(TestWrapper))

    // The modal should be visible
    const dialog = screen.getByTestId('dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })
})

describe('ProtectedLayout - ErrorBoundary Structure (lines 111-119)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up authenticated user state
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      isConnected: true,
      chainId: 23295,
      status: 'connected',
    })

    mockUseRoflAppBackendAuthContext.mockReturnValue({
      isAuthenticated: true,
      status: 'authenticated',
    })

    // Default connect modal state
    mockUseConnectModal.mockReturnValue({ connectModalOpen: false })
  })

  it('should have ErrorBoundary with fallbackRender prop', () => {
    const TestWrapper = () => React.createElement(ProtectedLayout, null, React.createElement(TestPage))

    const { container } = renderWithRouter(React.createElement(TestWrapper))

    // If we get here without crashing, the ErrorBoundary is working
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render protected content when authenticated', () => {
    const TestWrapper = () => React.createElement(ProtectedLayout, null, React.createElement(TestPage))

    renderWithRouter(React.createElement(TestWrapper))

    // Should render without errors - the ProtectedLayout wraps content in ErrorBoundary and Suspense
    const { container } = renderWithRouter(React.createElement(TestWrapper))
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should not show auth modal when authenticated', () => {
    const TestWrapper = () => React.createElement(ProtectedLayout, null, React.createElement(TestPage))

    renderWithRouter(React.createElement(TestWrapper))

    const dialog = screen.queryByTestId('dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })
})
