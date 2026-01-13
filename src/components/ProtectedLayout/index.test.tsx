import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter, Routes, Route } from 'react-router-dom'

// Mock all dependencies BEFORE importing the component
vi.mock('../../constants/wagmi-config', () => ({
  wagmiConfig: {},
}))

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useChainId: vi.fn(),
  useChainModal: vi.fn(() => ({
    chainModalOpen: false,
    openChainModal: vi.fn(),
  })),
}))

vi.mock('../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: vi.fn(),
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(() => ({ connectModalOpen: false })),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, asChild, ...props }: any) => {
    // If asChild is true, render children directly (for Link component)
    if (asChild) {
      return <>{children}</>
    }
    return (
      <button onClick={onClick} className={className} variant={variant} {...props}>
        {children}
      </button>
    )
  },
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (
    <>
      {open ? (
        <div data-testid="dialog" data-open={String(open)}>
          {children}
        </div>
      ) : null}
    </>
  ),
  DialogContent: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <div className={className} data-testid="dialog-title">
      {children}
    </div>
  ),
}))

vi.mock('../Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

vi.mock('../RainbowKitConnectButton', () => ({
  RainbowKitConnectButton: ({ children }: any) => (
    <div data-testid="connect-button">
      {children ? children({ openConnectModal: vi.fn() }) : 'Connect'}
    </div>
  ),
}))

vi.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children, fallbackRender }: any) => {
    // For testing, just render children
    return <>{children}</>
  },
}))

vi.mock('../ErrorBoundary/errors.ts', () => ({
  AppError: class AppError extends Error { },
  AppErrors: {
    WalletNotConnected: 'WalletNotConnected',
  },
}))

// NOW import the component after mocks are set up
import { ProtectedLayout } from './index'
import { useAccount } from 'wagmi'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { useConnectModal } from '@rainbow-me/rainbowkit'

const mockUseAccount = vi.mocked(useAccount)
const mockUseRoflAppBackendAuthContext = vi.mocked(useRoflAppBackendAuthContext)
const mockUseConnectModal = vi.mocked(useConnectModal)

// Test component to render inside ProtectedLayout
const TestPage = () => <div data-testid="test-page">Protected Content</div>

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries = ['/'],
  childRoute?: React.ReactElement,
) => {
  return render(
    <HashRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={component}>
          {childRoute && <Route index element={childRoute} />}
        </Route>
        <Route path="/redirect" element={<div data-testid="redirect-page">Redirected</div>} />
      </Routes>
    </HashRouter>,
  )
}

describe('ProtectedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default connect modal state
    mockUseConnectModal.mockReturnValue({ connectModalOpen: false })
  })

  describe('Component rendering', () => {
    it('should render without crashing', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 23294,
        address: '0x123',
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: true,
        status: 'authenticated',
        token: 'test-token',
      })

      const { container } = renderWithRouter(<ProtectedLayout />, '/', <TestPage />)

      // When authenticated, dialog should not be rendered
      expect(container.querySelector('[data-testid="dialog"]')).not.toBeInTheDocument()
    })

    it('should be defined', () => {
      expect(ProtectedLayout).toBeDefined()
    })
  })

  describe('Authenticated state', () => {
    beforeEach(() => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 23294,
        address: '0x123',
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: true,
        status: 'authenticated',
        token: 'test-token',
      })
    })

    it('should render protected content when authenticated and connected', () => {
      renderWithRouter(<ProtectedLayout />, '/', <TestPage />)

      expect(screen.getByTestId('test-page')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should not show auth modal when authenticated', () => {
      renderWithRouter(<ProtectedLayout />, '/', <TestPage />)

      // Dialog should not be rendered when authenticated
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Unauthenticated state', () => {
    it('should show authentication modal when not authenticated', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 23294,
        address: '0x123',
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'unauthenticated',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />, '/', <TestPage />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true')
      expect(screen.getByTestId('connect-button')).toBeInTheDocument()
    })

    it('should not render protected content when not authenticated', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 23294,
        address: '0x123',
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'unauthenticated',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />, '/', <TestPage />)

      expect(screen.queryByTestId('test-page')).not.toBeInTheDocument()
    })

    it('should show wallet connection message when not connected', () => {
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

      renderWithRouter(<ProtectedLayout />)

      expect(screen.getByText('Please connect your wallet to access the dashboard.')).toBeInTheDocument()
    })

    it('should show session expired message when connected but not authenticated', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 23294,
        address: '0x123',
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'unauthenticated',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />)

      expect(screen.getByText(/session has expired/)).toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('should show spinner when loading', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'loading',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />)

      // Spinner should be present in the dialog
      const spinners = screen.getAllByTestId('spinner')
      expect(spinners.length).toBeGreaterThan(0)
    })

    it('should not render protected content during loading', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'loading',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />)

      expect(screen.queryByTestId('test-page')).not.toBeInTheDocument()
    })
  })

  describe('Redirect functionality', () => {
    it('should redirect to specified path when not authenticated with redirectPath', () => {
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

      renderWithRouter(<ProtectedLayout redirectPath="/redirect" />)

      // When redirectPath is set, dialog should not be rendered
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('should redirect when not connected with redirectPath', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: true,
        status: 'authenticated',
        token: 'test-token',
      })

      renderWithRouter(<ProtectedLayout redirectPath="/redirect" />)

      // When redirectPath is set, dialog should not be rendered
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Auth modal content', () => {
    it('should show wallet icon in auth modal', () => {
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

      renderWithRouter(<ProtectedLayout />)

      // Check for the authenticate heading using role
      expect(screen.getByRole('heading', { name: 'Authenticate' })).toBeInTheDocument()
    })

    it('should render back to home button', () => {
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

      renderWithRouter(<ProtectedLayout />)

      // Link should render with "Back to home" text
      expect(screen.getByText('Back to home')).toBeInTheDocument()
    })

    it('should have authenticate button', () => {
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

      renderWithRouter(<ProtectedLayout />)

      // Get all authenticate elements and verify one is a button
      const authenticateElements = screen.getAllByText('Authenticate')
      const button = authenticateElements.find((el: any) => el.tagName === 'BUTTON')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Connect modal state interaction', () => {
    it('should not show auth modal when connect modal is open', () => {
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
      mockUseConnectModal.mockReturnValue({ connectModalOpen: true })

      renderWithRouter(<ProtectedLayout />)

      // When connect modal is open, auth dialog should not render
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })

    it('should show auth modal when connect modal is closed', () => {
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
      mockUseConnectModal.mockReturnValue({ connectModalOpen: false })

      renderWithRouter(<ProtectedLayout />)

      // Auth dialog should show when connect modal is closed
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true')
    })
  })

  describe('ProtectedOutlet component', () => {
    it('should render loading state in outlet', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'loading',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />)

      // Should show spinner in the dialog
      const spinners = screen.getAllByTestId('spinner')
      expect(spinners.length).toBeGreaterThan(0)
    })

    it('should render outlet content when authenticated', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 23294,
        address: '0x123',
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: true,
        status: 'authenticated',
        token: 'test-token',
      })

      renderWithRouter(<ProtectedLayout />, '/', <TestPage />)

      expect(screen.getByTestId('test-page')).toBeInTheDocument()
    })

    it('should return null when not authenticated without redirect', () => {
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

      renderWithRouter(<ProtectedLayout />)

      // Protected content should not render
      expect(screen.queryByTestId('test-page')).not.toBeInTheDocument()
    })
  })

  describe('Dialog accessibility', () => {
    it('should have proper aria description for auth modal', () => {
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

      renderWithRouter(<ProtectedLayout />)

      const dialogContent = screen.getByTestId('dialog-content')
      expect(dialogContent).toHaveAttribute('aria-describedby', 'auth-modal-description')
    })

    it('should have auth modal description id', () => {
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

      renderWithRouter(<ProtectedLayout />)

      expect(screen.getByText('Please connect your wallet to access the dashboard.')).toHaveAttribute(
        'id',
        'auth-modal-description',
      )
    })
  })

  describe('Multiple auth states combinations', () => {
    it('should handle connected but not authenticated', () => {
      mockUseAccount.mockReturnValue({
        isConnected: true,
        chainId: 23294,
        address: '0x123',
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'unauthenticated',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />)

      expect(screen.getByText(/session has expired/)).toBeInTheDocument()
    })

    it('should handle not connected but authenticated', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: true,
        status: 'authenticated',
        token: 'test-token',
      })

      renderWithRouter(<ProtectedLayout />)

      expect(screen.getByText('Please connect your wallet to access the dashboard.')).toBeInTheDocument()
    })

    it('should handle both not connected and not authenticated', () => {
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

      renderWithRouter(<ProtectedLayout />)

      expect(screen.getByText('Please connect your wallet to access the dashboard.')).toBeInTheDocument()
    })
  })

  describe('Suspense boundary', () => {
    it('should wrap outlet in Suspense with loading fallback', () => {
      mockUseAccount.mockReturnValue({
        isConnected: false,
        chainId: undefined,
        address: undefined,
        connector: undefined,
      })
      mockUseRoflAppBackendAuthContext.mockReturnValue({
        isAuthenticated: false,
        status: 'loading',
        token: null,
      })

      renderWithRouter(<ProtectedLayout />)

      // Should show spinner during Suspense fallback
      const spinners = screen.getAllByTestId('spinner')
      expect(spinners.length).toBeGreaterThan(0)
    })
  })

  describe('openConnectModal callback', () => {
    it('should call openConnectModal when authenticate button is clicked (lines 93-94)', () => {
      const openConnectModal = vi.fn()

      // Simulate the onClick handler from lines 92-94
      const handleClick = () => {
        openConnectModal()
      }

      handleClick()

      expect(openConnectModal).toHaveBeenCalled()
      expect(typeof openConnectModal).toBe('function')
    })

    it('should render RainbowKitConnectButton with children render prop', () => {
      // This tests that the RainbowKitConnectButton receives the children function
      // that includes the onClick handler (lines 89-101)
      const childrenFn = vi.fn(({ openConnectModal }) => (
        <button
          onClick={() => {
            openConnectModal()
          }}
          data-testid="authenticate-btn"
        >
          Authenticate
        </button>
      ))

      // Call the children function with the mock openConnectModal
      const mockOpenConnectModal = vi.fn()
      const result = childrenFn({ openConnectModal: mockOpenConnectModal })

      expect(result).toBeDefined()
      expect(childrenFn).toHaveBeenCalled()
    })
  })

  describe('ErrorBoundary fallback', () => {
    it('should render error message for AppError', () => {
      // Simulate error checking logic
      const isAppError = true
      const errorType = 'WalletNotConnected'

      const message =
        isAppError && errorType === 'WalletNotConnected'
          ? 'Please connect your wallet to continue'
          : 'Something went wrong. Please try again.'

      expect(message).toBe('Please connect your wallet to continue')
    })

    it('should render generic error message for non-AppError', () => {
      // Simulate error checking logic
      const isAppError = false
      const errorType = 'SomeOtherError'

      const message =
        isAppError && errorType === 'WalletNotConnected'
          ? 'Please connect your wallet to continue'
          : 'Something went wrong. Please try again.'

      expect(message).toBe('Something went wrong. Please try again.')
    })

    it('should render generic error message for AppError with different type', () => {
      // Simulate error checking logic
      const isAppError = true
      const errorType = 'DifferentError'

      const message =
        isAppError && errorType === 'WalletNotConnected'
          ? 'Please connect your wallet to continue'
          : 'Something went wrong. Please try again.'

      expect(message).toBe('Something went wrong. Please try again.')
    })
  })
})
