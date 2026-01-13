import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from './index'

// Mock the child components and providers
vi.mock('../FathomAnalytics', () => ({
  FathomAnalytics: () => <div data-testid="fathom-analytics">FathomAnalytics</div>,
}))

vi.mock('sonner', () => ({
  Toaster: ({ className }: { className?: string }) => (
    <div data-testid="toaster" className={className}>
      Toaster
    </div>
  ),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/layout', () => ({
  Layout: ({ headerContent, footerContent, children }: any) => (
    <div data-testid="layout">
      {headerContent}
      {children}
      {footerContent}
    </div>
  ),
}))

vi.mock('../Layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

vi.mock('../Layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

vi.mock('../ErrorDisplay', () => ({
  ErrorDisplay: ({ error, className }: any) => (
    <div data-testid="error-display" className={className}>
      Error: {error?.message}
    </div>
  ),
}))

vi.mock('../../contexts/RoflAppBackendAuth/Provider', () => ({
  RoflAppBackendAuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
}))

vi.mock('../RainbowKitProviderWithAuth', () => ({
  RainbowKitProviderWithAuth: ({ children }: any) => <div data-testid="rainbowkit-provider">{children}</div>,
}))

let shouldTriggerError = false

vi.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ fallbackRender, children }: any) => {
    if (shouldTriggerError && fallbackRender) {
      return (
        <div data-testid="error-boundary">
          <div data-testid="fallback-render">{fallbackRender({ error: new Error('Test error') })}</div>
        </div>
      )
    }
    return (
      <div data-testid="error-boundary">
        {children}
        {fallbackRender && <div data-testid="fallback-render">Fallback</div>}
      </div>
    )
  },
}))

describe('RootLayout', () => {
  it('should render all required components and providers', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [{ index: true, element: <div>Test Page</div> }],
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('rainbowkit-provider')).toBeInTheDocument()
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    expect(screen.getByTestId('fathom-analytics')).toBeInTheDocument()
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('should render Toaster with correct className', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [{ index: true, element: <div>Test Page</div> }],
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)

    const toaster = screen.getByTestId('toaster')
    expect(toaster).toHaveClass('toaster')
  })

  it('should render Outlet for nested routes', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [
            { index: true, element: <div data-testid="home-page">Home</div> },
            { path: 'test', element: <div data-testid="test-page">Test</div> },
          ],
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)
    expect(screen.getByTestId('home-page')).toBeInTheDocument()

    const router2 = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [
            { index: true, element: <div data-testid="home-page">Home</div> },
            { path: 'test', element: <div data-testid="test-page">Test</div> },
          ],
        },
      ],
      { initialEntries: ['/test'] },
    )

    render(<RouterProvider router={router2} />)
    expect(screen.getByTestId('test-page')).toBeInTheDocument()
  })

  it('should have proper provider nesting order', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [{ index: true, element: <div>Test Page</div> }],
        },
      ],
      { initialEntries: ['/'] },
    )

    const { container: _container } = render(<RouterProvider router={router} />)

    const authProvider = screen.getByTestId('auth-provider')
    const rainbowkitProvider = screen.getByTestId('rainbowkit-provider')
    const errorBoundary = screen.getByTestId('error-boundary')

    expect(authProvider).toContainElement(rainbowkitProvider)
    expect(rainbowkitProvider).toContainElement(errorBoundary)
  })

  it('should render fallback components in error boundary', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [{ index: true, element: <div>Test Page</div> }],
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)

    // The ErrorBoundary should have a fallbackRender function
    const errorBoundary = screen.getByTestId('error-boundary')
    expect(errorBoundary).toBeInTheDocument()
  })

  it('should render error fallback with Header, Footer, and ErrorDisplay', () => {
    shouldTriggerError = true

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [{ index: true, element: <div>Test Page</div> }],
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('error-display')).toBeInTheDocument()
    expect(screen.getByTestId('layout')).toBeInTheDocument()

    shouldTriggerError = false
  })
})
