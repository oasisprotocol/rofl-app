import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import * as React from 'react'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock axios globally for consistent mocking across tests
// Note: Individual test files can override this mock by using vi.mocked(axios.get)
// The mock functions are shared across tests to allow for flexible mocking
const mockAxiosGet = vi.fn(() =>
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} }),
)
const mockAxiosPost = vi.fn(() =>
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} }),
)
const mockAxiosPut = vi.fn(() =>
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} }),
)
const mockAxiosDelete = vi.fn(() =>
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} }),
)
const mockAxiosPatch = vi.fn(() =>
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} }),
)

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios')

  return {
    ...actual,
    default: Object.assign(
      vi.fn(() => ({
        get: mockAxiosGet,
        post: mockAxiosPost,
        put: mockAxiosPut,
        delete: mockAxiosDelete,
        patch: mockAxiosPatch,
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
      })),
      {
        get: mockAxiosGet,
        post: mockAxiosPost,
        put: mockAxiosPut,
        delete: mockAxiosDelete,
        patch: mockAxiosPatch,
        create: vi.fn(() => ({
          get: mockAxiosGet,
          post: mockAxiosPost,
          put: mockAxiosPut,
          delete: mockAxiosDelete,
          patch: mockAxiosPatch,
          interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() },
          },
        })),
      },
    ),
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut,
    delete: mockAxiosDelete,
    patch: mockAxiosPatch,
    create: vi.fn(() => ({
      get: mockAxiosGet,
      post: mockAxiosPost,
      put: mockAxiosPut,
      delete: mockAxiosDelete,
      patch: mockAxiosPatch,
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
  }
})

// Export mock functions for use in tests
;(global as any).__mockAxiosGet = mockAxiosGet
;(global as any).__mockAxiosPost = mockAxiosPost
;(global as any).__mockAxiosPut = mockAxiosPut
;(global as any).__mockAxiosDelete = mockAxiosDelete
;(global as any).__mockAxiosPatch = mockAxiosPatch

// Mock wagmi globally for consistent mocking across tests
vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) =>
    // @ts-ignore
    React.createElement(React.Fragment, null, children),
  useAccount: vi.fn(() => ({
    isConnected: true,
    chainId: 23294,
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    connector: undefined,
  })),
  useConfig: vi.fn(() => ({
    chains: [],
  })),
  useSendTransaction: vi.fn(() => ({
    sendTransactionAsync: vi.fn(),
    data: undefined,
    isPending: false,
    error: null,
  })),
  useSimulateContract: vi.fn(),
  useDisconnect: vi.fn(() => ({
    disconnect: vi.fn(),
  })),
  useReadContract: vi.fn(),
  useWriteContract: vi.fn(),
  useWaitForTransactionReceipt: vi.fn(),
  useSwitchChain: vi.fn(),
  useChainId: vi.fn(() => 23294), // Add useChainId mock
  useSignMessage: vi.fn(() => ({
    signMessageAsync: vi.fn().mockResolvedValue('0xabc123'),
    data: undefined,
    isPending: false,
    error: null,
  })),
}))

// Mock RainbowKit globally
vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: any) =>
    // @ts-ignore
    React.createElement(React.Fragment, null, children),
  RainbowKitAuthenticationProvider: ({ children }: any) =>
    // @ts-ignore
    React.createElement(React.Fragment, null, children),
  createAuthenticationAdapter: vi.fn((config: any) => config),
  darkTheme: vi.fn(() => ({})),
  useChainModal: vi.fn(() => ({
    chainModalOpen: false,
    openChainModal: vi.fn(),
  })),
  useConnectModal: vi.fn(() => ({
    connectModalOpen: false,
    openConnectModal: vi.fn(),
  })),
  getDefaultConfig: vi.fn((config: any) => ({
    chains: config.chains || [],
    appName: config.appName || '',
    projectId: config.projectId || '',
    ssr: config.ssr ?? false,
    batch: config.batch,
  })),
  ConnectButton: {
    Custom: ({ children }: any) =>
      // @ts-ignore
      React.createElement(React.Fragment, null, children),
  },
}))

// Mock viem globally
vi.mock('viem/siwe', () => ({
  createSiweMessage: vi.fn((config: any) => ({ ...config, message: 'SIWE message' })),
}))

vi.mock('viem/chains', () => ({
  sapphire: {
    id: 23294,
    name: 'Sapphire',
    nativeCurrency: { name: 'ROSE', symbol: 'ROSE', decimals: 18 },
  },
  sapphireTestnet: {
    id: 23295,
    name: 'Sapphire Testnet',
    nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 },
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  mainnet: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null, key: 'default' })),
    useBlocker: vi.fn(() => ({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() })),
    Navigate: ({ to }: any) => `Navigate to ${to}`,
    // Keep the actual Router components to provide context
    BrowserRouter: actual.BrowserRouter,
    MemoryRouter: actual.MemoryRouter,
    HashRouter: actual.HashRouter,
    Routes: actual.Routes,
    Route: actual.Route,
    Link: actual.Link,
  }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage with full implementation
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    reset: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  }
}

const localStorageMock = createLocalStorageMock()
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
})

// Clear localStorage after each test
afterEach(() => {
  localStorageMock.reset()
})

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve(): void {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
})

// Mock Fathom Analytics
vi.mock('fathom-client', () => ({
  trackEvent: vi.fn(),
  trackPageview: vi.fn(),
}))

// Mock hooks
vi.mock('../../hooks/useTicker', () => ({
  useTicker: vi.fn(() => 'ROSE'),
}))

vi.mock('../../hooks/useNetwork', () => ({
  useNetwork: vi.fn(() => 'mainnet'),
}))

// Mock RoflAppBackendAuth context globally
vi.mock('../../contexts/RoflAppBackendAuth/hooks', () => ({
  useRoflAppBackendAuthContext: vi.fn(() => ({
    token: 'mock-test-token',
    isAuthenticated: true,
    status: 'authenticated' as const,
  })),
}))

vi.mock('../../contexts/RoflAppBackendAuth/Context', () => ({
  RoflAppBackendAuthContext: React.createContext({
    token: 'mock-test-token',
    isAuthenticated: true,
    status: 'authenticated' as const,
  }),
}))

// Mock ui-library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/card', () => ({
  Card: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { className, 'data-testid': 'card' }, children),
  CardContent: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { className, 'data-testid': 'card-content' }, children),
  CardFooter: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { className, 'data-testid': 'card-footer' }, children),
  CardHeader: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { className, 'data-testid': 'card-header' }, children),
  CardTitle: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('h3', { className, 'data-testid': 'card-title' }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, className, variant, size, asChild, ...props }: any) => {
    if (asChild) {
      // When asChild is true, render as div to pass onClick, avoid nested buttons
      // @ts-ignore
      return React.createElement(
        'div',
        {
          className: `${className || ''} ${variant || ''} ${size || ''}`.trim(),
          'data-testid': variant === 'outline' ? 'outline-button' : 'button',
          role: 'button',
          ...props,
        },
        children,
      )
    }
    // @ts-ignore
    return React.createElement(
      'button',
      {
        className: `${className || ''} ${variant || ''} ${size || ''}`.trim(),
        'data-testid': variant === 'outline' ? 'outline-button' : 'button',
        ...props,
      },
      children,
    )
  },
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/sheet', () => ({
  Sheet: ({ children, open, _onOpenChange }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'sheet', 'data-open': open }, children),
  SheetContent: ({ children }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'sheet-content' }, children),
  SheetHeader: ({ children }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'sheet-header' }, children),
  SheetTitle: ({ children }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'sheet-title' }, children),
  SheetTrigger: ({ children }: any) => children,
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/input', () => ({
  Input: ({ className, ...props }: any) =>
    // @ts-ignore
    React.createElement('input', { className, ...props }),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/textarea', () => ({
  Textarea: ({ className, ...props }: any) =>
    // @ts-ignore
    React.createElement('textarea', { className, ...props }),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/label', () => ({
  Label: ({ children, className, ...props }: any) =>
    // @ts-ignore
    React.createElement('label', { className, ...props }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/table', () => ({
  Table: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('table', { className }, children),
  TableHeader: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('thead', { className }, children),
  TableBody: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('tbody', { className }, children),
  TableRow: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('tr', { className }, children),
  TableHead: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('th', { className }, children),
  TableCell: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('td', { className }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/dialog', () => ({
  Dialog: ({ children, open, _onOpenChange }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dialog', 'data-open': open }, children),
  DialogContent: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dialog-content', className }, children),
  DialogDescription: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dialog-description', className }, children),
  DialogFooter: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dialog-footer', className }, children),
  DialogHeader: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dialog-header', className }, children),
  DialogTitle: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dialog-title', className }, children),
  DialogTrigger: ({ children, asChild }: any) =>
    // @ts-ignore
    asChild ? children : React.createElement('button', null, children),
  DialogClose: ({ children, _className, ..._props }: any) =>
    // @ts-ignore
    children,
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dropdown-menu' }, children),
  DropdownMenuTrigger: ({ children, className, asChild, ...props }: any) => {
    if (asChild) {
      return React.Children.only(children)
    }
    // @ts-ignore
    return React.createElement('button', { className, ...props }, children)
  },
  DropdownMenuContent: ({ children, className }: any) =>
    // @ts-ignore
    React.createElement('div', { 'data-testid': 'dropdown-content', className }, children),
  DropdownMenuItem: ({ children, className, onClick, ...props }: any) =>
    // @ts-ignore
    React.createElement('button', { className, onClick, ...props }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock Separator component
vi.mock('@oasisprotocol/ui-library/src/components/ui/separator', () => ({
  Separator: ({ className, ...props }: any) =>
    // @ts-ignore
    React.createElement('hr', { className, ...props }),
}))

// Mock Skeleton component
vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) =>
    // @ts-ignore
    React.createElement('div', { className, ...props }),
}))

// Mock Worker for Monaco
global.Worker = class Worker {
  constructor() {}
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
} as any

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => {
  let currentEditor: any = null
  let currentMonaco: any = null
  let currentOnChange: any = null

  const MonacoEditorMock = vi.fn(({ value, onChange, beforeMount, onMount, options, loading }: any) => {
    currentOnChange = onChange

    // Call beforeMount if provided
    if (beforeMount) {
      beforeMount({
        editor: {
          defineTheme: vi.fn(),
        },
      })
    }

    // Create mock editor and monaco instances
    const mockEditor = {
      getModel: vi.fn(() => ({
        getLineMaxColumn: vi.fn(() => 100),
      })),
    }

    const mockMonaco = {
      editor: {
        setModelMarkers: vi.fn(),
      },
      MarkerSeverity: {
        Error: 8,
      },
    }

    currentEditor = mockEditor
    currentMonaco = mockMonaco

    // Call onMount if provided (this sets the refs in the component)
    if (onMount) {
      onMount(mockEditor, mockMonaco)
    }

    // Simulate onChange - trigger the onChange callback with the value
    const handleChange = (e: any) => {
      onChange?.(e.target.value)
    }

    return loading
      ? loading
      : React.createElement('textarea', {
          'data-testid': 'monaco-editor',
          value: value,
          onChange: handleChange,
          readOnly: options?.readOnly,
          placeholder: options?.placeholder,
        })
  })

  // Export helper functions for testing
  ;(MonacoEditorMock as any).__triggerChange = (newValue: string) => {
    if (currentOnChange) {
      currentOnChange(newValue)
    }
  }
  ;(MonacoEditorMock as any).__getCurrentEditor = () => currentEditor
  ;(MonacoEditorMock as any).__getCurrentMonaco = () => currentMonaco

  return {
    default: MonacoEditorMock,
    loader: {
      config: vi.fn(),
    },
    __esModule: true,
  }
})

// Mock monaco-editor
vi.mock('monaco-editor', () => ({
  editor: {
    defineTheme: vi.fn(),
    setModelMarkers: vi.fn(),
  },
  MarkerSeverity: {
    Error: 8,
    Info: 1,
    Warning: 4,
  },
}))

// Mock environment variables
process.env.VITE_ROFL_APP_BACKEND = 'http://localhost:3000'

// Declare global constants for build-time variables
;(global as any).GITHUB_REPOSITORY_URL = 'https://github.com/oasisprotocol/rofl-app/'
;(global as any).APP_VERSION = '1.0.0'
;(global as any).BUILD_COMMIT = 'abc123def456'
;(global as any).BUILD_DATETIME = Date.now()

// Store original location for BuildBadge tests
const _originalLocation: Location | null = null

// Helper to get and set original location
global.__originalLocation = window.location

afterEach(() => {
  // Restore location after each test if it was modified
  if (global.__originalLocation && window.location !== global.__originalLocation) {
    // @ts-ignore
    window.location = global.__originalLocation
  }
})

// Suppress expected console output from error handling tests
// These are intentional error logs from tests that verify error handling behavior
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

const suppressedPatterns = [
  'Error checking payment processed',
  'Authentication error:',
  'Fetch logs error:',
  'Transaction failed with error:',
  'Failed to get balance for token',
  'Failed to parse rofl-template.yaml',
  'Error would be thrown here',
  // React warnings that are expected in tests
  'ErrorBoundary:',
  'Not implemented: HTMLFormElement.prototype.requestSubmit',
  // TanStack Query warnings from intentional undefined data tests
  'Query data cannot be undefined',
  // React act() warnings that may still leak through lazy loading
  'A suspended resource finished loading inside a test',
  'was not wrapped in act',
  // React key prop warnings from mocks/tests
  'is not a prop. Trying to access it will result in',
  'Encountered two children with the same key',
  // Expected test log messages
  "Got 'Unsupported Chain' error",
  'Unsupported Chain',
  // Polling timeout warnings
  'Polling timeout',
  'pollPayment',
  'Payment processed polling timed out',
  // ERC-20 contract logs
  'Allowance',
  'allowance',
  'Approving',
  // Deployment/Update errors
  'Deployment error:',
  'Update error:',
  // Transaction logs from tests
  'Transaction mined successfully',
  'update metadata/secrets?',
  // Backend API debug logs
  'App',
  'create app:',
  'appId',
  'Build?',
  'Build results:',
  'restart machines?',
  'stop machines?',
  'Got app id',
  // Object output patterns
  'id: Uint8Array',
  'admin: Uint8Array',
  'policy:',
  'metadata:',
  'sek: Uint8Array',
  'secrets:',
  'enclaves:',
  'endorsements:',
  // Uint8Array patterns from console output
  'Uint8Array(',
]

const shouldSuppress = (args: unknown[]): boolean => {
  const message = args.map(arg => String(arg)).join(' ')
  return suppressedPatterns.some(pattern => message.includes(pattern))
}

console.error = (...args: unknown[]) => {
  if (!shouldSuppress(args)) {
    originalConsoleError.apply(console, args)
  }
}

console.warn = (...args: unknown[]) => {
  if (!shouldSuppress(args)) {
    originalConsoleWarn.apply(console, args)
  }
}

console.log = (...args: unknown[]) => {
  if (!shouldSuppress(args)) {
    originalConsoleLog.apply(console, args)
  }
}
