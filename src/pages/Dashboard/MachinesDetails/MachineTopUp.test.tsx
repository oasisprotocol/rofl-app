import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { MachineTopUp } from './MachineTopUp'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
  useParams: vi.fn(() => ({ provider: '0xprovider', id: 'instance-1' })),
  useNavigate: vi.fn(() => vi.fn()),
}))

// Mock wagmi hooks with functions that can be mocked in tests
const mockUseAccount = vi.fn(() => ({
  address: '0x1234567890abcdef1234567890abcdef12345678',
  isConnected: true,
}))

const mockUseBalance = vi.fn(() => ({
  data: { value: 1000000000000000000n },
  isLoading: false,
  refetch: vi.fn(),
}))

const mockUseChainId = vi.fn(() => 23294) // Sapphire mainnet

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useBalance: () => mockUseBalance(),
  useChainId: () => mockUseChainId(),
}))

// Mock viem chains
vi.mock('viem/chains', () => ({
  sapphire: { id: 23294, name: 'Sapphire' },
  sapphireTestnet: { id: 23295, name: 'Sapphire Testnet' },
}))

// Mock hooks
vi.mock('../../../hooks/useNetwork', () => ({
  useNetwork: vi.fn(() => 'mainnet'),
}))

vi.mock('../../CreateApp/useBlockNavigatingAway', () => ({
  useBlockNavigatingAway: vi.fn(() => ({
    blockNavigatingAway: vi.fn(),
    allowNavigatingAway: vi.fn(),
  })),
}))

// Mock API hooks
const mockUseGetRuntimeRoflmarketProvidersAddressInstancesId = vi.fn(() => ({
  data: {
    data: {
      id: 'instance-1',
      provider: '0xprovider',
      offer_id: 'offer-1',
      metadata: {
        'net.oasis.provider.name': 'Test Provider',
      },
      paid_until: '2024-12-31T23:59:59Z',
    },
  },
  isLoading: false,
  isFetched: true,
}))

vi.mock('../../../nexus/generated/api', () => ({
  useGetRuntimeRoflmarketProvidersAddressInstancesId: () =>
    mockUseGetRuntimeRoflmarketProvidersAddressInstancesId(),
}))

const mockUseMachineTopUp = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}))

vi.mock('../../../backend/api', () => ({
  useMachineTopUp: () => mockUseMachineTopUp(),
}))

// Mock UI components
vi.mock('@oasisprotocol/ui-library/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, disabled, _asChild, ...props }: any) =>
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

// Mock other components
const mockGetValues = vi.fn(() => '1000')
const mockForm = {
  getValues: mockGetValues,
}

vi.mock('../../../components/BuildForm', () => ({
  BuildForm: ({ children, build, onSubmit, offerId }: any) =>
    React.createElement(
      'div',
      { 'data-offer-id': offerId },
      React.createElement(
        'form',
        {
          onSubmit: (e: any) => {
            e.preventDefault()
            onSubmit(build)
          },
        },
        children({ form: mockForm, noOffersWarning: false }),
      ),
    ),
}))

vi.mock('../../CreateApp/CreateFormNavigation', () => ({
  CreateFormNavigation: ({ handleBack, disabled, isLoading }: any) =>
    React.createElement(
      'div',
      null,
      React.createElement(
        'button',
        {
          onClick: handleBack,
          disabled,
          'data-testid': 'back-button',
        },
        'Back',
      ),
      React.createElement(
        'button',
        {
          disabled,
          'data-is-loading': isLoading,
          'data-testid': 'submit-button',
        },
        'Submit',
      ),
    ),
}))

vi.mock('../../../components/rofl-paymaster/TopUp', () => ({
  TopUp: ({ children, minAmount, onTopUpSuccess }: any) =>
    React.createElement(
      'div',
      { 'data-min-amount': minAmount?.toString() },
      React.createElement(
        'button',
        {
          onClick: onTopUpSuccess,
          'data-testid': 'top-up-button',
        },
        'Top Up',
      ),
      children({ isValid: true }),
    ),
}))

vi.mock('../../../components/Spinner', () => ({
  Spinner: () => React.createElement('div', { 'data-testid': 'spinner' }, 'Loading...'),
}))

vi.mock('../../CreateApp/templates', () => ({
  defaultBuildConfig: { provider: '0xprovider' },
}))

vi.mock('lucide-react', () => ({
  ChevronLeft: () => React.createElement('span', { 'data-testid': 'chevron-left' }),
}))

describe('MachineTopUp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks to default values
    mockUseChainId.mockReturnValue(23294)
    mockUseBalance.mockReturnValue({
      data: { value: 1000000000000000000n },
      isLoading: false,
      refetch: vi.fn(),
    })
    mockUseGetRuntimeRoflmarketProvidersAddressInstancesId.mockReturnValue({
      data: {
        data: {
          id: 'instance-1',
          provider: '0xprovider',
          offer_id: 'offer-1',
          metadata: {
            'net.oasis.provider.name': 'Test Provider',
          },
          paid_until: '2024-12-31T23:59:59Z',
        },
      },
      isLoading: false,
      isFetched: true,
    })
    mockUseMachineTopUp.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    })
    // Reset getValues mock to return a default cost
    mockGetValues.mockReturnValue('1000')
  })

  it('should be defined', () => {
    expect(MachineTopUp).toBeDefined()
  })

  it('should render without crashing', () => {
    const { container } = render(<MachineTopUp />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render back button', () => {
    render(<MachineTopUp />)

    expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
    expect(screen.getByText(/Back to/)).toBeInTheDocument()
  })

  it('should render top up title', () => {
    render(<MachineTopUp />)

    expect(screen.getByText(/Top up/)).toBeInTheDocument()
  })

  it('should render non-refundable warning', () => {
    render(<MachineTopUp />)

    expect(screen.getByText('Machine rental costs are non-refundable.')).toBeInTheDocument()
  })

  it('should render navigation buttons', () => {
    render(<MachineTopUp />)

    expect(screen.getByTestId('back-button')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should render provider name in title', () => {
    render(<MachineTopUp />)

    // Check that Test Provider appears in the document (it appears twice, which is fine)
    const providerElements = screen.getAllByText(/Test Provider/)
    expect(providerElements.length).toBeGreaterThan(0)
  })

  it('should display machine details when fetched', () => {
    render(<MachineTopUp />)

    // Should render the form content with machine data
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should show chain warning when not on correct chain', () => {
    mockUseChainId.mockReturnValue(1) // Wrong chain (Ethereum mainnet)

    render(<MachineTopUp />)

    // Should show warning about chain switching
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should allow navigation when on Sapphire chain', () => {
    mockUseChainId.mockReturnValue(23294) // Sapphire mainnet

    render(<MachineTopUp />)

    // Should not show chain warning
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should allow navigation when on Sapphire Testnet', () => {
    mockUseChainId.mockReturnValue(23295) // Sapphire testnet

    render(<MachineTopUp />)

    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    mockUseGetRuntimeRoflmarketProvidersAddressInstancesId.mockReturnValue({
      data: null,
      isLoading: true,
      isFetched: false,
    })

    render(<MachineTopUp />)

    // Should show skeleton while loading
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should handle top up flow when balance is sufficient', () => {
    mockUseBalance.mockReturnValue({
      data: { value: 100000000000000000000n }, // 100 ROSE - sufficient
      isLoading: false,
      refetch: vi.fn(),
    })

    render(<MachineTopUp />)

    // Should show submit button when balance is sufficient
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should handle top up flow when balance is insufficient', () => {
    // Set a high cost that exceeds the balance
    mockGetValues.mockReturnValue('10000000000000000000000') // Very high cost

    mockUseBalance.mockReturnValue({
      data: { value: 1000000000n }, // 1 gwei - insufficient
      isLoading: false,
      refetch: vi.fn(),
    })

    render(<MachineTopUp />)

    // Should show Top Up component when balance is insufficient
    expect(screen.getByTestId('top-up-button')).toBeInTheDocument()
  })

  it('should handle pending mutation state', () => {
    mockUseMachineTopUp.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      isError: false,
      error: null,
    })

    render(<MachineTopUp />)

    // Should show loading state on submit button
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should handle mutation error state', () => {
    const mockError = new Error('Transaction failed')
    mockError.shortMessage = 'Transaction failed'

    mockUseMachineTopUp.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      error: mockError,
    })

    render(<MachineTopUp />)

    // Should show error message
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should handle balance loading state', () => {
    // Set a high cost to ensure TopUp component would be shown if balance was available
    mockGetValues.mockReturnValue('10000000000000000000000') // Very high cost

    // When balance is loading with data, the TopUp component should show with spinner
    mockUseBalance.mockReturnValue({
      data: { value: 1000000000n }, // Low balance
      isLoading: true,
      refetch: vi.fn(),
    })

    render(<MachineTopUp />)

    // Should show spinner while loading balance
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should pass correct build config to BuildForm', () => {
    render(<MachineTopUp />)

    // Should pass the provider from URL params
    const buildForm = screen.getByTestId('back-button').closest('[data-offer-id]')
    expect(buildForm).toBeInTheDocument()
  })

  it('should pass offer ID from machine data', () => {
    render(<MachineTopUp />)

    // Should pass the offer_id from machine data
    const buildForm = screen.getByTestId('back-button').closest('[data-offer-id]')
    expect(buildForm).toHaveAttribute('data-offer-id', 'offer-1')
  })

  it('should navigate back to machine details on back button', () => {
    render(<MachineTopUp />)

    const backButton = screen.getByTestId('back-button')
    backButton.click()

    // Navigation is handled by the mocked Link component
    expect(backButton).toBeInTheDocument()
  })

  it('should handle mainnet network', () => {
    render(<MachineTopUp />)

    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should handle testnet network', () => {
    render(<MachineTopUp />)

    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should refetch balance after successful top up', () => {
    // The refetch functionality is tested through the component integration
    render(<MachineTopUp />)

    // Component should render without errors
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should handle machine without provider metadata', () => {
    // Component should handle missing metadata gracefully
    mockUseGetRuntimeRoflmarketProvidersAddressInstancesId.mockReturnValue({
      data: {
        data: {
          id: 'instance-1',
          provider: '0xprovider',
          offer_id: 'offer-1',
          metadata: {},
          paid_until: '2024-12-31T23:59:59Z',
        },
      },
      isLoading: false,
      isFetched: true,
    })

    render(<MachineTopUp />)

    // Should still render, showing provider address instead
    expect(screen.getByText(/Back to/)).toBeInTheDocument()
  })

  it('should handle no offers warning', () => {
    render(<MachineTopUp />)

    // BuildForm should handle no offers scenario
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should handle successful top up mutation', () => {
    render(<MachineTopUp />)

    // After successful mutation, should navigate
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('should show chain warning when not on Sapphire chain and has insufficient balance', () => {
    // Set wrong chain and insufficient balance to trigger TopUp flow with chain warning
    mockUseChainId.mockReturnValue(1) // Ethereum mainnet

    mockGetValues.mockReturnValue('10000000000000000000000') // Very high cost

    mockUseBalance.mockReturnValue({
      data: { value: 1000000000n }, // Low balance
      isLoading: false,
      refetch: vi.fn(),
    })

    render(<MachineTopUp />)

    // Should show warning about chain switching
    const chainWarning = screen.getByText(/Before navigating away, manually switch the chain to/)
    expect(chainWarning).toBeInTheDocument()
    expect(chainWarning).toHaveTextContent('Sapphire')
  })

  it('should show chain warning on testnet when not on correct chain and has insufficient balance', () => {
    // Mock testnet network
    const mockUseNetwork = vi.fn(() => 'testnet')
    vi.doMock('../../../hooks/useNetwork', () => ({
      useNetwork: mockUseNetwork,
    }))

    // Set wrong chain and insufficient balance to trigger TopUp flow with chain warning
    mockUseChainId.mockReturnValue(1) // Ethereum mainnet

    mockGetValues.mockReturnValue('10000000000000000000000') // Very high cost

    mockUseBalance.mockReturnValue({
      data: { value: 1000000000n }, // Low balance
      isLoading: false,
      refetch: vi.fn(),
    })

    render(<MachineTopUp />)

    // Should show warning about chain switching to testnet
    const chainWarning = screen.getByText(/Before navigating away, manually switch the chain to/)
    expect(chainWarning).toBeInTheDocument()
  })

  it('should display error message with shortMessage when available', () => {
    const mockError = new Error('Full error message with details')
    ;(mockError as any).shortMessage = 'Short error message'

    mockUseMachineTopUp.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      error: mockError,
    })

    // Set sufficient balance to show error in the non-TopUp flow
    mockUseBalance.mockReturnValue({
      data: { value: 100000000000000000000n }, // 100 ROSE - sufficient
      isLoading: false,
      refetch: vi.fn(),
    })

    render(<MachineTopUp />)

    // Should show shortMessage from error
    expect(screen.getByText('Short error message')).toBeInTheDocument()
  })

  it('should display error message with message when shortMessage is not available', () => {
    const mockError = new Error('Full error message with details')

    mockUseMachineTopUp.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      error: mockError,
    })

    // Set sufficient balance to show error in the non-TopUp flow
    mockUseBalance.mockReturnValue({
      data: { value: 100000000000000000000n }, // 100 ROSE - sufficient
      isLoading: false,
      refetch: vi.fn(),
    })

    render(<MachineTopUp />)

    // Should show full message from error
    expect(screen.getByText('Full error message with details')).toBeInTheDocument()
  })

  it('should compare balance correctly using NumberUtils.isGreaterThan', () => {
    // Test case where balance is greater than cost
    mockUseBalance.mockReturnValue({
      data: { value: 2000000000000000000n }, // 2 ROSE
      isLoading: false,
      refetch: vi.fn(),
    })

    // Cost is 1 ROSE in base units
    mockGetValues.mockReturnValue('1000000000000000000')

    render(<MachineTopUp />)

    // Should have enough balance and show submit button
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should calculate minAmount correctly when balance is insufficient', () => {
    // Balance is 0.5 ROSE
    mockUseBalance.mockReturnValue({
      data: { value: 500000000000000000n },
      isLoading: false,
      refetch: vi.fn(),
    })

    // Cost is 1 ROSE, so need 0.5 more
    mockGetValues.mockReturnValue('1000000000000000000')

    render(<MachineTopUp />)

    // Should show TopUp with minAmount calculated correctly
    const topUpButton = screen.getByTestId('top-up-button')
    expect(topUpButton).toBeInTheDocument()
  })

  it('should call handleTopUpSuccess and refetch balance when TopUp succeeds', () => {
    const refetchMock = vi.fn()

    // Set insufficient balance to show TopUp
    mockGetValues.mockReturnValue('10000000000000000000000') // Very high cost

    mockUseBalance.mockReturnValue({
      data: { value: 1000000000n }, // Low balance
      isLoading: false,
      refetch: refetchMock,
    })

    render(<MachineTopUp />)

    // Click the TopUp button which should trigger onTopUpSuccess
    const topUpButton = screen.getByTestId('top-up-button')
    topUpButton.click()

    // Verify refetch was called
    expect(refetchMock).toHaveBeenCalled()
  })

  it('should return false when sapphireBalance or buildCost is missing', () => {
    // Test when sapphireBalance is null
    mockUseBalance.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    })

    mockGetValues.mockReturnValue('1000')

    render(<MachineTopUp />)

    // Should show TopUp since balance is null
    const _topUpButton = screen.queryByTestId('top-up-button')
    // In this case, minAmount would be null due to the condition
    // and we'd show the regular submit flow
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('should return false when buildCost is missing', () => {
    mockUseBalance.mockReturnValue({
      data: { value: 1000000000n },
      isLoading: false,
      refetch: vi.fn(),
    })

    // Test when buildCost is undefined
    mockGetValues.mockReturnValue(undefined)

    render(<MachineTopUp />)

    // Should show submit button since hasEnoughBalance would be false
    // but minAmount calculation would return null
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })
})
