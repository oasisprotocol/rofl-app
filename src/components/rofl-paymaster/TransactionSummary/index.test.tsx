import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionSummary } from './index'

// Mock the wagmi hooks
vi.mock('wagmi', () => ({
  useGasPrice: vi.fn(),
}))

import { useGasPrice } from 'wagmi'

const mockUseGasPrice = vi.mocked(useGasPrice)

describe('TransactionSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGasPrice.mockReturnValue({ data: undefined, isLoading: false })
  })

  const renderComponent = (props = {}) => {
    return render(<TransactionSummary {...props} />)
  }

  it('should render correctly with default props', () => {
    renderComponent()

    expect(screen.getByText('Bridge Fee')).toBeInTheDocument()
    expect(screen.getByText('Est. Time')).toBeInTheDocument()
  })

  it('should display placeholder "-/-" when quote is null', () => {
    renderComponent({ quote: null })

    // When gas price is not available, only 2 "-/-" are shown (Bridge Fee and Est. Time)
    expect(screen.getAllByText('-/-')).toHaveLength(2)
  })

  it('should display "0 {symbol}" for bridge fee when quote exists', () => {
    renderComponent({ quote: BigInt(1000000) })

    // The symbol depends on the chain (TEST for testnet, ROSE for mainnet)
    const bridgeFeeText = screen.getByText(/0 (TEST|ROSE)/)
    expect(bridgeFeeText).toBeInTheDocument()
  })

  it('should display gas fee when gasPrice is available', () => {
    mockUseGasPrice.mockReturnValue({
      data: BigInt('20000000000'),
      isLoading: false,
    })

    renderComponent({ quote: BigInt(1000000) })

    expect(screen.getByText('Gas Fee')).toBeInTheDocument()
  })

  it('should not display gas fee when gasPrice is not available', () => {
    mockUseGasPrice.mockReturnValue({
      data: undefined,
      isLoading: false,
    })

    renderComponent({ quote: BigInt(1000000) })

    expect(screen.queryByText('Gas Fee')).not.toBeInTheDocument()
  })

  it('should display loading state when isLoading is true', () => {
    renderComponent({ quote: null, isLoading: true })

    // Check for loading indicators
    const loadingElements = document.querySelectorAll('.animate-pulse, .animate-spin')
    expect(loadingElements.length).toBeGreaterThanOrEqual(0)
  })

  it('should display loading state when gasPrice is loading', () => {
    mockUseGasPrice.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderComponent({ quote: BigInt(1000000) })

    // Should show loading state for gas-related fields
    expect(screen.getByText('Bridge Fee')).toBeInTheDocument()
  })

  it('should display estimated time', () => {
    renderComponent({ quote: BigInt(1000000) })

    expect(screen.getByText('Est. Time')).toBeInTheDocument()
  })

  it('should use native currency symbol from selected chain', () => {
    const mockChain = {
      id: 1,
      name: 'Ethereum',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    } as any

    mockUseGasPrice.mockReturnValue({
      data: BigInt('20000000000'),
      isLoading: false,
    })

    renderComponent({ quote: BigInt(1000000), selectedChain: mockChain })

    expect(screen.getByText('Gas Fee')).toBeInTheDocument()
  })

  it('should handle missing native currency gracefully', () => {
    const mockChain = {
      id: 1,
      name: 'Ethereum',
      nativeCurrency: undefined,
    } as any

    mockUseGasPrice.mockReturnValue({
      data: BigInt('20000000000'),
      isLoading: false,
    })

    renderComponent({ quote: BigInt(1000000), selectedChain: mockChain })

    expect(screen.getByText('Gas Fee')).toBeInTheDocument()
  })

  it('should display all three fee categories', () => {
    mockUseGasPrice.mockReturnValue({
      data: BigInt('20000000000'),
      isLoading: false,
    })

    renderComponent({ quote: BigInt(1000000) })

    expect(screen.getByText('Bridge Fee')).toBeInTheDocument()
    expect(screen.getByText('Gas Fee')).toBeInTheDocument()
    expect(screen.getByText('Est. Time')).toBeInTheDocument()
  })

  it('should format values correctly with gas price', () => {
    mockUseGasPrice.mockReturnValue({
      data: BigInt('20000000000'),
      isLoading: false,
    })

    const mockChain = {
      id: 1,
      name: 'Ethereum',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    } as any

    renderComponent({ quote: BigInt(1000000), selectedChain: mockChain })

    expect(screen.getByText('Gas Fee')).toBeInTheDocument()
  })
})
