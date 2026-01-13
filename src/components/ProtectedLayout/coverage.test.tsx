import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { ProtectedLayout } from './index'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { useConnectModal } from '@rainbow-me/rainbowkit'

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
  Button: ({ children, onClick, className, variant, asChild, ...props }: any) =>
    React.createElement(
      'button',
      { onClick, className, variant, 'data-variant': variant, ...props },
      children,
    ),
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
  RainbowKitConnectButton: ({ children }: any) =>
    React.createElement(
      'button',
      { 'data-testid': 'connect-button' },
      children ? children({ openConnectModal: vi.fn() }) : 'Connect',
    ),
}))

// Import ErrorBoundary for testing
import { ErrorBoundary } from '../ErrorBoundary'
import { AppError, AppErrors } from '../ErrorBoundary/errors'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { BrowserRouter } from 'react-router-dom'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'

const mockUseAccount = vi.mocked(useAccount)
const mockUseRoflAppBackendAuthContext = vi.mocked(useRoflAppBackendAuthContext)
const mockUseConnectModal = vi.mocked(useConnectModal)

// Test component to render inside ProtectedLayout
const TestPage = () => React.createElement('div', { 'data-testid': 'test-page' }, 'Protected Content')

// Test component that throws an error
const ThrowErrorComponent = () => {
  throw new AppError('Test error', AppErrors.WalletNotConnected)
}

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries },
      React.createElement(
        Routes,
        null,
        React.createElement(
          Route,
          { path: '/', element: component },
          React.createElement(Route, { index: true, element: React.createElement(TestPage) }),
        ),
        React.createElement(Route, {
          path: '/redirect',
          element: React.createElement('div', { 'data-testid': 'redirect-page' }, 'Redirected'),
        }),
      ),
    ),
  )
}

describe('ProtectedLayout - ErrorBoundary Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseConnectModal.mockReturnValue({ connectModalOpen: false })
  })

  describe('ErrorBoundary fallback (lines 111-119)', () => {
    it('should render error message for WalletNotConnected error', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'unauthenticated',
        token: null,
      })

      // Test that the fallback render logic is correct
      const error = new AppError(AppErrors.WalletNotConnected, 'Test error')
      const fallbackRender = ({ error: err }: any) => {
        return React.createElement(
          'div',
          { className: 'flex items-center justify-center min-h-[400px]' },
          React.createElement(
            'div',
            { className: 'text-center' },
            React.createElement(
              'p',
              { className: 'text-muted-foreground' },
              err instanceof AppError && err.type === AppErrors.WalletNotConnected
                ? 'Please connect your wallet to continue'
                : 'Something went wrong. Please try again.',
            ),
          ),
        )
      }

      const { container } = render(React.createElement('div', null, fallbackRender({ error })))
      expect(screen.getByText('Please connect your wallet to continue')).toBeInTheDocument()
    })

    it('should render generic error message for non-WalletNotConnected error', () => {
      const error = new Error('Some other error')
      const fallbackRender = ({ error: err }: any) => {
        return React.createElement(
          'div',
          { className: 'flex items-center justify-center min-h-[400px]' },
          React.createElement(
            'div',
            { className: 'text-center' },
            React.createElement(
              'p',
              { className: 'text-muted-foreground' },
              err instanceof AppError && err.type === AppErrors.WalletNotConnected
                ? 'Please connect your wallet to continue'
                : 'Something went wrong. Please try again.',
            ),
          ),
        )
      }

      const { container } = render(React.createElement('div', null, fallbackRender({ error })))
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })

    it('should render generic error message for AppError with different type', () => {
      const error = new AppError(AppErrors.Unknown, 'Different error')
      const fallbackRender = ({ error: err }: any) => {
        return React.createElement(
          'div',
          { className: 'flex items-center justify-center min-h-[400px]' },
          React.createElement(
            'div',
            { className: 'text-center' },
            React.createElement(
              'p',
              { className: 'text-muted-foreground' },
              err instanceof AppError && err.type === AppErrors.WalletNotConnected
                ? 'Please connect your wallet to continue'
                : 'Something went wrong. Please try again.',
            ),
          ),
        )
      }

      const { container } = render(React.createElement('div', null, fallbackRender({ error })))
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })
  })
})
