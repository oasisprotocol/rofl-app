import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoflPaymasterContextProvider } from './Provider'
import { useRoflPaymasterContext } from './hooks'
import type { Address, Chain } from 'viem'
import { sapphire, sapphireTestnet } from 'viem/chains'

// Mock the contract functions
vi.mock('../../contracts/crossChainPaymaster', () => ({
  calculateRoseAmount: vi.fn(),
  isPaymentProcessed: vi.fn(),
}))

vi.mock('../../contracts/paymasterVault', () => ({
  deposit: vi.fn(),
}))

// Mock the constants - use factory function to access chain IDs
const mockConfig = vi.hoisted(() => ({
  ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG: {
    23294: { contractAddress: '0x123' as Address },
    23295: { contractAddress: '0x456' as Address },
  },
  ROFL_PAYMASTER_TOKEN_CONFIG: {
    23294: { paymasterContractAddress: '0x789' as Address },
    23295: { paymasterContractAddress: '0xabc' as Address },
  },
}))

vi.mock('../../constants/rofl-paymaster-config', () => ({
  ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG: mockConfig.ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG,
  ROFL_PAYMASTER_TOKEN_CONFIG: mockConfig.ROFL_PAYMASTER_TOKEN_CONFIG,
}))

import { calculateRoseAmount, isPaymentProcessed } from '../../contracts/crossChainPaymaster'
import { deposit } from '../../contracts/paymasterVault'
import { RoflAppPaymasterProvider } from '../contexts/RoflPaymaster/Provider'

const mockCalculateRoseAmount = vi.mocked(calculateRoseAmount)
const mockIsPaymentProcessed = vi.mocked(isPaymentProcessed)
const mockDeposit = vi.mocked(deposit)

describe('RoflPaymasterContextProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children', () => {
    render(
      <RoflPaymasterContextProvider>
        <div>Test Child</div>
      </RoflPaymasterContextProvider>,
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should provide context with initial state', () => {
    const TestComponent = () => {
      const context = useRoflPaymasterContext()
      return <span data-testid="token">{context.state.token || 'null'}</span>
    }

    render(
      <RoflPaymasterContextProvider>
        <TestComponent />
      </RoflPaymasterContextProvider>,
    )

    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })

  it('should provide getQuote function', () => {
    const TestComponent = () => {
      const context = useRoflPaymasterContext()
      return <span data-testid="has-get-quote">{typeof context.getQuote}</span>
    }

    render(
      <RoflPaymasterContextProvider>
        <TestComponent />
      </RoflPaymasterContextProvider>,
    )

    expect(screen.getByTestId('has-get-quote')).toHaveTextContent('function')
  })

  it('should provide createDeposit function', () => {
    const TestComponent = () => {
      const context = useRoflPaymasterContext()
      return <span data-testid="has-create-deposit">{typeof context.createDeposit}</span>
    }

    render(
      <RoflPaymasterContextProvider>
        <TestComponent />
      </RoflPaymasterContextProvider>,
    )

    expect(screen.getByTestId('has-create-deposit')).toHaveTextContent('function')
  })

  it('should provide pollPayment function', () => {
    const TestComponent = () => {
      const context = useRoflPaymasterContext()
      return <span data-testid="has-poll-payment">{typeof context.pollPayment}</span>
    }

    render(
      <RoflPaymasterContextProvider>
        <TestComponent />
      </RoflPaymasterContextProvider>,
    )

    expect(screen.getByTestId('has-poll-payment')).toHaveTextContent('function')
  })

  describe('getQuote function', () => {
    it('should throw error for invalid chain', () => {
      mockCalculateRoseAmount.mockResolvedValue(BigInt(100))

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      // Test with a chain that's not sapphire or sapphireTestnet
      expect(() => {
        context.getQuote('0x123' as Address, BigInt(100), {
          id: 1,
          name: 'Ethereum',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        } as Chain)
      }).toThrow('Invalid chain!')
    })

    it('should call calculateRoseAmount for valid sapphire chain', async () => {
      mockCalculateRoseAmount.mockResolvedValue(BigInt(100))

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      const result = await context.getQuote('0x123' as Address, BigInt(100), sapphire)
      expect(result).toBe(BigInt(100))
      expect(mockCalculateRoseAmount).toHaveBeenCalled()
    })

    it('should call calculateRoseAmount for valid sapphire testnet chain', async () => {
      mockCalculateRoseAmount.mockResolvedValue(BigInt(200))

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      const result = await context.getQuote('0x123' as Address, BigInt(100), sapphireTestnet)
      expect(result).toBe(BigInt(200))
      expect(mockCalculateRoseAmount).toHaveBeenCalled()
    })
  })

  describe('createDeposit function', () => {
    it('should call deposit function with correct parameters', async () => {
      mockDeposit.mockResolvedValue({ paymentId: 'test-payment-id' })

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      const result = await context.createDeposit('0x123' as Address, BigInt(100), '0x456' as Address, 23294)
      expect(result).toEqual({ paymentId: 'test-payment-id' })
      expect(mockDeposit).toHaveBeenCalled()
    })
  })

  describe('pollPayment function', () => {
    it('should throw error for invalid chain', async () => {
      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      // Test with a chain that's not sapphire or sapphireTestnet - pollPayment is async
      await expect(
        context.pollPayment('payment-id', {
          id: 1,
          name: 'Ethereum',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        } as Chain),
      ).rejects.toThrow('Invalid chain!')
    })

    it('should throw error when paymentId is empty', async () => {
      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      await expect(context.pollPayment('', sapphire)).rejects.toThrow('PaymentId is required!')
    })

    it('should throw error when paymentId is null', async () => {
      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      await expect(context.pollPayment(null as any, sapphire)).rejects.toThrow('PaymentId is required!')
    })

    it('should throw error when paymentId is undefined', async () => {
      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      await expect(context.pollPayment(undefined as any, sapphire)).rejects.toThrow('PaymentId is required!')
    })

    it('should return true when payment is processed', async () => {
      mockIsPaymentProcessed.mockResolvedValue(true)

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      const result = await context.pollPayment('valid-payment-id', sapphire)
      expect(result).toBe(true)
      expect(mockIsPaymentProcessed).toHaveBeenCalled()
    })

    it('should return true when payment is processed on testnet', async () => {
      mockIsPaymentProcessed.mockResolvedValue(true)

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      const result = await context.pollPayment('valid-payment-id', sapphireTestnet)
      expect(result).toBe(true)
      expect(mockIsPaymentProcessed).toHaveBeenCalled()
    })

    it('should return null after max attempts when payment is not processed', async () => {
      mockIsPaymentProcessed.mockResolvedValue(false)

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      // Mock setTimeout to speed up the test
      vi.stubGlobal('setTimeout', (fn: () => void, _delay: number) => {
        fn()
        return 0 as any
      })

      const result = await context.pollPayment('pending-payment-id', sapphire)
      expect(result).toBe(null)

      vi.unstubAllGlobals()
    })

    it('should handle errors gracefully and continue polling', async () => {
      mockIsPaymentProcessed.mockRejectedValue(new Error('Network error'))

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      // Mock setTimeout to speed up the test
      vi.stubGlobal('setTimeout', (fn: () => void, _delay: number) => {
        fn()
        return 0 as any
      })

      const result = await context.pollPayment('error-payment-id', sapphire)
      expect(result).toBe(null)

      vi.unstubAllGlobals()
    })

    it('should handle intermittent errors during polling', async () => {
      let callCount = 0
      mockIsPaymentProcessed.mockImplementation(async () => {
        callCount++
        if (callCount < 3) {
          throw new Error('Temporary error')
        }
        return true
      })

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      // Mock setTimeout to speed up the test
      vi.stubGlobal('setTimeout', (fn: () => void, _delay: number) => {
        fn()
        return 0 as any
      })

      const result = await context.pollPayment('intermittent-payment-id', sapphire)
      expect(result).toBe(true)
      expect(callCount).toBe(3)

      vi.unstubAllGlobals()
    })

    it('should respect max attempts limit', async () => {
      mockIsPaymentProcessed.mockResolvedValue(false)

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      // Mock setTimeout to speed up the test
      vi.stubGlobal('setTimeout', (fn: () => void, _delay: number) => {
        fn()
        return 0 as any
      })

      const result = await context.pollPayment('max-attempts-payment-id', sapphire)
      expect(result).toBe(null)
      // Should be called 60 times (maxAttempts)
      expect(mockIsPaymentProcessed).toHaveBeenCalledTimes(60)

      vi.unstubAllGlobals()
    })

    it('should handle various paymentId formats', async () => {
      mockIsPaymentProcessed.mockResolvedValue(true)

      let context: any
      const TestComponent = () => {
        context = useRoflPaymasterContext()
        return null
      }

      render(
        <RoflPaymasterContextProvider>
          <TestComponent />
        </RoflPaymasterContextProvider>,
      )

      const paymentIds = [
        'simple-id',
        'UUID-like-123e4567-e89b-12d3-a456-426614174000',
        '0x1234567890abcdef',
        'with-dashes-and_underscores',
      ]

      for (const paymentId of paymentIds) {
        const result = await context.pollPayment(paymentId, sapphire)
        expect(result).toBe(true)
      }
    })
  })
})
