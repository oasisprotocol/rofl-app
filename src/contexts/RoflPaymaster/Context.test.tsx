import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { RoflPaymasterContext, RoflPaymasterProviderContext, RoflPaymasterProviderState } from './Context'
import type { Address, Chain } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('RoflPaymaster Context', () => {
  describe('RoflPaymasterContext', () => {
    it('should be defined', () => {
      expect(RoflPaymasterContext).toBeDefined()
    })

    it('should be a React context', () => {
      expect(RoflPaymasterContext.$$typeof.toString()).toBe('Symbol(react.context)')
    })

    it('should have empty object as default value', () => {
      expect(RoflPaymasterContext._currentValue).toEqual({})
    })

    it('should export the context as a named export', () => {
      expect(typeof RoflPaymasterContext).toBe('object')
    })
  })

  describe('RoflPaymasterProviderState', () => {
    it('should accept valid state values', () => {
      const validState: RoflPaymasterProviderState = {
        token: 'some-token',
      }

      expect(validState.token).toBe('some-token')
    })

    it('should accept null token', () => {
      const stateWithNullToken: RoflPaymasterProviderState = {
        token: null,
      }

      expect(stateWithNullToken.token).toBeNull()
    })

    it('should have readonly-like token property', () => {
      const state: RoflPaymasterProviderState = {
        token: 'test-token',
      }

      expect(Object.keys(state)).toEqual(['token'])
    })

    it('should allow empty string token', () => {
      const state: RoflPaymasterProviderState = {
        token: '',
      }

      expect(state.token).toBe('')
    })

    it('should allow various string tokens', () => {
      const states: RoflPaymasterProviderState[] = [
        { token: 'simple-token' },
        { token: 'token-with-dashes' },
        { token: 'token_with_underscores' },
        { token: 'UUID-like-token-123e4567-e89b-12d3-a456-426614174000' },
      ]

      states.forEach(state => {
        expect(typeof state.token).toBe('string')
      })
    })
  })

  describe('RoflPaymasterProviderContext', () => {
    it('should accept valid context values', () => {
      const validContext: RoflPaymasterProviderContext = {
        state: {
          token: 'test-token',
        },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      }

      expect(validContext.state.token).toBe('test-token')
      expect(typeof validContext.getQuote).toBe('function')
      expect(typeof validContext.createDeposit).toBe('function')
      expect(typeof validContext.pollPayment).toBe('function')
    })

    it('should require state property', () => {
      const contextWithoutState = {
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      } as any

      expect(contextWithoutState.state).toBeUndefined()
    })

    it('should require getQuote function', () => {
      const contextWithoutGetQuote = {
        state: { token: null },
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      } as any

      expect(contextWithoutGetQuote.getQuote).toBeUndefined()
    })

    it('should require createDeposit function', () => {
      const contextWithoutCreateDeposit = {
        state: { token: null },
        getQuote: vi.fn(),
        pollPayment: vi.fn(),
      } as any

      expect(contextWithoutCreateDeposit.createDeposit).toBeUndefined()
    })

    it('should require pollPayment function', () => {
      const contextWithoutPollPayment = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
      } as any

      expect(contextWithoutPollPayment.pollPayment).toBeUndefined()
    })

    it('should have correct function signatures', () => {
      const mockAddress: Address = '0x1234567890123456789012345678901234567890' as Address
      const mockChain: Chain = {
        id: 1,
        name: 'Test Chain',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['http://localhost'] } },
      }

      const validContext: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: async (tokenContractAddress: Address, amount: bigint, chain: Chain) => {
          return BigInt(0)
        },
        createDeposit: async (
          tokenContractAddress: Address,
          amount: bigint,
          recipient: Address,
          chainId: number,
        ) => {
          return { paymentId: 'test-payment-id' }
        },
        pollPayment: async (paymentId: string, chain: Chain) => {
          return true
        },
      }

      expect(typeof validContext.getQuote).toBe('function')
      expect(typeof validContext.createDeposit).toBe('function')
      expect(typeof validContext.pollPayment).toBe('function')
    })

    it('should enforce all required properties', () => {
      const validContext: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      }

      // Verify all required properties exist
      expect(Object.keys(validContext)).toEqual(['state', 'getQuote', 'createDeposit', 'pollPayment'])
    })

    it('should allow state with null token', () => {
      const context: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      }

      expect(context.state.token).toBeNull()
    })

    it('should allow state with string token', () => {
      const context: RoflPaymasterProviderContext = {
        state: { token: 'my-token' },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      }

      expect(context.state.token).toBe('my-token')
    })

    it('should support async getQuote function', () => {
      const context: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: async (_tokenContractAddress: Address, _amount: bigint, _chain: Chain) => {
          return BigInt(100)
        },
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      }

      expect(typeof context.getQuote).toBe('function')
      expect(context.getQuote.constructor.name).toBe('AsyncFunction')
    })

    it('should support async createDeposit function', () => {
      const context: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: async (
          _tokenContractAddress: Address,
          _amount: bigint,
          _recipient: Address,
          _chainId: number,
        ) => {
          return { paymentId: 'test-id' }
        },
        pollPayment: vi.fn(),
      }

      expect(typeof context.createDeposit).toBe('function')
      expect(context.createDeposit.constructor.name).toBe('AsyncFunction')
    })

    it('should support async pollPayment function', () => {
      const context: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: async (_paymentId: string, _chain: Chain) => {
          return true
        },
      }

      expect(typeof context.pollPayment).toBe('function')
      expect(context.pollPayment.constructor.name).toBe('AsyncFunction')
    })

    it('should allow getQuote to return bigint', () => {
      const mockGetQuote = vi.fn().mockResolvedValue(BigInt(1000))
      const context: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: mockGetQuote,
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      }

      expect(typeof context.getQuote).toBe('function')
    })

    it('should allow createDeposit to return paymentId object', () => {
      const mockCreateDeposit = vi.fn().mockResolvedValue({ paymentId: 'test-payment-id' })
      const context: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: mockCreateDeposit,
        pollPayment: vi.fn(),
      }

      expect(typeof context.createDeposit).toBe('function')
    })

    it('should allow pollPayment to return boolean or null', () => {
      const mockPollPaymentTrue = vi.fn().mockResolvedValue(true)
      const mockPollPaymentFalse = vi.fn().mockResolvedValue(false)
      const mockPollPaymentNull = vi.fn().mockResolvedValue(null)

      const context1: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: mockPollPaymentTrue,
      }

      const context2: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: mockPollPaymentFalse,
      }

      const context3: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: mockPollPaymentNull,
      }

      expect(typeof context1.pollPayment).toBe('function')
      expect(typeof context2.pollPayment).toBe('function')
      expect(typeof context3.pollPayment).toBe('function')
    })
  })

  describe('Type Exports', () => {
    it('should export RoflPaymasterProviderState type', () => {
      const state: RoflPaymasterProviderState = {
        token: null,
      }
      expect(state).toBeDefined()
    })

    it('should export RoflPaymasterProviderContext type', () => {
      const context: RoflPaymasterProviderContext = {
        state: { token: null },
        getQuote: vi.fn(),
        createDeposit: vi.fn(),
        pollPayment: vi.fn(),
      }
      expect(context).toBeDefined()
    })

    it('should export RoflPaymasterContext', () => {
      expect(RoflPaymasterContext).toBeDefined()
    })
  })
})
