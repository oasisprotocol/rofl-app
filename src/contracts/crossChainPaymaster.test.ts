import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readContract } from 'wagmi/actions'

// Mock wagmi actions
vi.mock('wagmi/actions', () => ({
  readContract: vi.fn(),
}))

// Mock wagmi config
vi.mock('../constants/wagmi-config', () => ({
  wagmiConfig: {},
}))

// Mock ABI
vi.mock('./CrossChainPaymaster_ABI.json', () => ({
  default: [
    {
      inputs: [
        { internalType: 'address', name: 'token', type: 'address' },
        { internalType: 'uint256', name: 'tokenAmount', type: 'uint256' },
      ],
      name: 'calculateRoseAmount',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bytes32', name: 'paymentId', type: 'bytes32' }],
      name: 'isPaymentProcessed',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
}))

import { calculateRoseAmount, isPaymentProcessed } from './crossChainPaymaster'

const mockReadContract = vi.mocked(readContract)

describe('crossChainPaymaster', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateRoseAmount', () => {
    it('should calculate ROSE amount successfully', async () => {
      const mockAmount = 1000000n
      const mockRoseAmount = 500000n
      mockReadContract.mockResolvedValueOnce(mockRoseAmount)

      const result = await calculateRoseAmount(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        mockAmount,
        11155111,
      )

      expect(result).toBe(mockRoseAmount)
      expect(mockReadContract).toHaveBeenCalledTimes(1)
      expect(mockReadContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          abi: expect.any(Array),
          functionName: 'calculateRoseAmount',
          args: ['0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', mockAmount],
          chainId: 11155111,
        }),
      )
    })

    it('should handle zero amount', async () => {
      const mockRoseAmount = 0n
      mockReadContract.mockResolvedValueOnce(mockRoseAmount)

      const result = await calculateRoseAmount(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        0n,
        11155111,
      )

      expect(result).toBe(0n)
    })

    it('should handle large amounts', async () => {
      const mockAmount = BigInt('1000000000000000000') // 1e18
      const mockRoseAmount = BigInt('500000000000000000')
      mockReadContract.mockResolvedValueOnce(mockRoseAmount)

      const result = await calculateRoseAmount(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        mockAmount,
        11155111,
      )

      expect(result).toBe(mockRoseAmount)
    })

    it('should handle different chain IDs', async () => {
      const mockRoseAmount = 1000n
      mockReadContract.mockResolvedValueOnce(mockRoseAmount)

      const result = await calculateRoseAmount(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        500000n,
        1, // Ethereum mainnet
      )

      expect(result).toBe(mockRoseAmount)
      expect(mockReadContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 1,
        }),
      )
    })

    it('should handle contract read errors', async () => {
      const mockError = new Error('Contract read failed')
      mockReadContract.mockRejectedValueOnce(mockError)

      await expect(
        calculateRoseAmount(
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          1000000n,
          11155111,
        ),
      ).rejects.toThrow('Contract read failed')
    })

    it('should handle different token addresses', async () => {
      const mockRoseAmount = 750000n
      mockReadContract.mockResolvedValueOnce(mockRoseAmount)

      const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      const result = await calculateRoseAmount(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        usdcAddress,
        2000000n,
        11155111,
      )

      expect(result).toBe(mockRoseAmount)
      expect(mockReadContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: [usdcAddress, 2000000n],
        }),
      )
    })

    it('should return bigint type', async () => {
      const mockRoseAmount = 123456789n
      mockReadContract.mockResolvedValueOnce(mockRoseAmount)

      const result = await calculateRoseAmount(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        1000000n,
        11155111,
      )

      expect(typeof result).toBe('bigint')
      expect(result).toBe(mockRoseAmount)
    })
  })

  describe('isPaymentProcessed', () => {
    it('should return true when payment is processed', async () => {
      const paymentId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(true)

      const result = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        paymentId,
        11155111,
      )

      expect(result).toBe(true)
      expect(mockReadContract).toHaveBeenCalledTimes(1)
      expect(mockReadContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          abi: expect.any(Array),
          functionName: 'isPaymentProcessed',
          args: [paymentId],
          chainId: 11155111,
        }),
      )
    })

    it('should return false when payment is not processed', async () => {
      const paymentId = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      mockReadContract.mockResolvedValueOnce(false)

      const result = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        paymentId,
        11155111,
      )

      expect(result).toBe(false)
    })

    it('should handle different payment IDs', async () => {
      const paymentId1 = '0x0000000000000000000000000000000000000000000000000000000000000001'
      const paymentId2 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

      mockReadContract.mockResolvedValueOnce(true).mockResolvedValueOnce(false)

      const result1 = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        paymentId1,
        11155111,
      )
      const result2 = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        paymentId2,
        11155111,
      )

      expect(result1).toBe(true)
      expect(result2).toBe(false)
    })

    it('should handle different chain IDs', async () => {
      const paymentId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(true)

      const result = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        paymentId,
        1, // Ethereum mainnet
      )

      expect(result).toBe(true)
      expect(mockReadContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 1,
        }),
      )
    })

    it('should handle contract read errors', async () => {
      const mockError = new Error('Payment check failed')
      mockReadContract.mockRejectedValueOnce(mockError)

      await expect(
        isPaymentProcessed(
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          11155111,
        ),
      ).rejects.toThrow('Payment check failed')
    })

    it('should return boolean type', async () => {
      const paymentId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(true)

      const result = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        paymentId,
        11155111,
      )

      expect(typeof result).toBe('boolean')
    })

    it('should handle zero payment ID', async () => {
      const zeroPaymentId = '0x0000000000000000000000000000000000000000000000000000000000000000'
      mockReadContract.mockResolvedValueOnce(false)

      const result = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        zeroPaymentId,
        11155111,
      )

      expect(result).toBe(false)
    })

    it('should handle case-insensitive contract addresses in calculateRoseAmount', async () => {
      const mockRoseAmount = 1000n
      mockReadContract.mockResolvedValueOnce(mockRoseAmount)

      const result = await calculateRoseAmount(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4'.toLowerCase() as any,
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        500000n,
        11155111,
      )

      expect(result).toBe(mockRoseAmount)
    })

    it('should handle mixed case payment IDs', async () => {
      const mixedCasePaymentId = '0xAbCdEf1234567890aBcDeF1234567890aBcDeF1234567890aBcDeF1234567890'
      mockReadContract.mockResolvedValueOnce(true)

      const result = await isPaymentProcessed(
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        mixedCasePaymentId,
        11155111,
      )

      expect(result).toBe(true)
    })

    it('should handle multiple concurrent calls', async () => {
      mockReadContract
        .mockResolvedValueOnce(1000n)
        .mockResolvedValueOnce(2000n)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)

      const [result1, result2] = await Promise.all([
        calculateRoseAmount(
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          500000n,
          11155111,
        ),
        calculateRoseAmount(
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          1000000n,
          11155111,
        ),
      ])

      expect(result1).toBe(1000n)
      expect(result2).toBe(2000n)
    })
  })

  describe('module exports', () => {
    it('should export all functions', async () => {
      const module = await import('./crossChainPaymaster')
      expect(module.calculateRoseAmount).toBeDefined()
      expect(module.isPaymentProcessed).toBeDefined()
    })
  })
})
