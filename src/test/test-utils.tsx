import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../constants/wagmi-config'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { RoflAppBackendAuthProvider } from '../contexts/RoflAppBackendAuth/Provider'
import { RoflPaymasterProvider } from '../contexts/RoflPaymaster/Provider'

// Test providers wrapper
interface TestProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
  useMemoryRouter?: boolean
  routerEntries?: string[]
  initialIndex?: number
}

const TestProviders = ({
  children,
  queryClient,
  useMemoryRouter,
  routerEntries = ['/'],
  initialIndex,
}: TestProvidersProps) => {
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
      logger: {
        log: console.log,
        warn: console.warn,
        error: () => {}, // Suppress error logging in tests
      },
    })

  const Router = useMemoryRouter ? MemoryRouter : BrowserRouter
  const routerProps = useMemoryRouter ? { initialEntries: routerEntries, initialIndex } : {}

  const content = (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={testQueryClient}>
        <Router {...routerProps}>
          <RoflAppBackendAuthProvider>
            <RoflPaymasterProvider>{children}</RoflPaymasterProvider>
          </RoflAppBackendAuthProvider>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  )

  return content
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  queryClient?: QueryClient
  useMemoryRouter?: boolean
  routerEntries?: string[]
  initialIndex?: number
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route,
    queryClient,
    useMemoryRouter,
    routerEntries,
    initialIndex,
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  if (route && !useMemoryRouter) {
    window.history.pushState({}, 'Test page', route)
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TestProviders
        queryClient={queryClient}
        useMemoryRouter={useMemoryRouter}
        routerEntries={routerEntries}
        initialIndex={initialIndex}
      >
        {children}
      </TestProviders>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }

// Helper to create a mock QueryClient
export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  })
}
