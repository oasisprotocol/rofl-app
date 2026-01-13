import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeContract } from 'wagmi/actions'
import { waitForTransactionReceipt } from '@wagmi/core'
import { keccak256, encodeAbiParameters, decodeEventLog } from 'viem'

// Mock wagmi actions
vi.mock('wagmi/actions', () => ({
  writeContract: vi.fn(),
}))

// Mock @wagmi/core
vi.mock('@wagmi/core', () => ({
  waitForTransactionReceipt: vi.fn(),
}))

// Mock wagmi config
vi.mock('../constants/wagmi-config', () => ({
  wagmiConfig: {},
}))

// Mock paymaster config
vi.mock('../constants/rofl-paymaster-config.ts', () => ({
  ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT: 500000n,
}))

// Mock viem functions
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')
  return {
    ...actual,
    keccak256: vi.fn(),
    encodeAbiParameters: vi.fn(),
    decodeEventLog: vi.fn(),
  }
})

import { deposit } from './paymasterVault'

const mockWriteContract = vi.mocked(writeContract)
const mockWaitForTransactionReceipt = vi.mocked(waitForTransactionReceipt)
const mockKeccak256 = vi.mocked(keccak256)
const mockEncodeAbiParameters = vi.mocked(encodeAbiParameters)
const mockDecodeEventLog = vi.mocked(decodeEventLog)

describe('paymasterVault', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deposit', () => {
    const mockVaultAddress = '0xa26733606bf8e0bD8d77Bddb707F05d7708EfBf7' as const
    const mockTokenAddress = '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0' as const
    const mockRecipient = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const
    const mockAmount = 1000000n
    const mockChainId = 11155111
    const mockHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as const
    const mockBlockNumber = 12345n
    const mockTransactionIndex = 0
    const mockLogIndex = 0
    const mockPaymentId = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as const

    const createMockReceipt = (includePaymentEvent: boolean = true) => ({
      blockNumber: mockBlockNumber,
      transactionIndex: mockTransactionIndex,
      logs: includePaymentEvent
        ? [
            {
              address: mockVaultAddress,
              topics: [
                '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
                '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
                '0x0000000000000000000000009876543210987654321098765432109876543210',
              ],
              data: '0x',
            },
          ]
        : [
            {
              address: '0x0000000000000000000000000000000000000001',
              topics: [],
              data: '0x',
            },
          ],
    })

    it('should deposit tokens and return payment ID successfully', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: mockPaymentId })
      expect(mockWriteContract).toHaveBeenCalledTimes(1)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: mockVaultAddress,
          functionName: 'deposit',
          args: [mockTokenAddress, mockAmount, mockRecipient],
          chainId: mockChainId,
          gas: 500000n,
        }),
      )
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledTimes(1)
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          hash: mockHash,
          chainId: mockChainId,
        }),
      )
    })

    it('should handle different vault addresses', async () => {
      const customVault = '0x9876543210987654321098765432109876543210' as const
      const customReceipt = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: customVault,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(customReceipt as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(customVault, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: customVault,
        }),
      )
    })

    it('should handle different token addresses', async () => {
      const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, usdcAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: [usdcAddress, mockAmount, mockRecipient],
        }),
      )
    })

    it('should handle different amounts', async () => {
      const largeAmount = BigInt('1000000000000000000') // 1e18
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(
        mockVaultAddress,
        mockTokenAddress,
        largeAmount,
        mockRecipient,
        mockChainId,
      )

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: [mockTokenAddress, largeAmount, mockRecipient],
        }),
      )
    })

    it('should handle zero amount', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, 0n, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
    })

    it('should handle different recipient addresses', async () => {
      const customRecipient = '0x1234567890123456789012345678901234567890' as const
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(
        mockVaultAddress,
        mockTokenAddress,
        mockAmount,
        customRecipient,
        mockChainId,
      )

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: [mockTokenAddress, mockAmount, customRecipient],
        }),
      )
    })

    it('should handle different chain IDs', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, 1)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 1,
        }),
      )
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 1,
        }),
      )
    })

    it('should return null payment ID when PaymentInitiated event is not found', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt(false) as any)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
      expect(mockDecodeEventLog).not.toHaveBeenCalled()
    })

    it('should skip logs from different contract addresses', async () => {
      const receiptWithMixedLogs = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: '0x0000000000000000000000000000000000000001',
            topics: [],
            data: '0x',
          },
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receiptWithMixedLogs as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
    })

    it('should skip logs without topics', async () => {
      const receiptWithNoTopics = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receiptWithNoTopics as any)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
    })

    it('should handle decodeEventLog errors gracefully', async () => {
      const receipt = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receipt as any)
      mockDecodeEventLog.mockImplementationOnce(() => {
        throw new Error('Cannot decode event')
      })

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
    })

    it('should handle case-insensitive address comparison', async () => {
      const receiptWithUppercaseAddress = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress.toUpperCase() as const,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receiptWithUppercaseAddress as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
    })

    it('should handle events that are not PaymentInitiated', async () => {
      const receipt = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receipt as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'OtherEvent',
      } as any)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
    })

    it('should handle different block numbers', async () => {
      const customBlockNumber = 54321n
      const receipt = {
        blockNumber: customBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receipt as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockEncodeAbiParameters).toHaveBeenCalledWith(
        [
          { type: 'uint256', name: 'chainId' },
          { type: 'address', name: 'vaultAddress' },
          { type: 'uint256', name: 'blockNumber' },
          { type: 'uint256', name: 'transactionIndex' },
          { type: 'uint256', name: 'logIndex' },
        ],
        [
          BigInt(mockChainId),
          mockVaultAddress,
          customBlockNumber,
          BigInt(mockTransactionIndex),
          BigInt(mockLogIndex),
        ],
      )
    })

    it('should handle different transaction indices', async () => {
      const customTxIndex = 2
      const receipt = {
        blockNumber: mockBlockNumber,
        transactionIndex: customTxIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receipt as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockEncodeAbiParameters).toHaveBeenCalledWith(
        [
          { type: 'uint256', name: 'chainId' },
          { type: 'address', name: 'vaultAddress' },
          { type: 'uint256', name: 'blockNumber' },
          { type: 'uint256', name: 'transactionIndex' },
          { type: 'uint256', name: 'logIndex' },
        ],
        [BigInt(mockChainId), mockVaultAddress, mockBlockNumber, BigInt(customTxIndex), BigInt(mockLogIndex)],
      )
    })

    it('should handle different log indices', async () => {
      const receiptWithMultipleLogs = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [],
            data: '0x',
          },
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receiptWithMultipleLogs as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockEncodeAbiParameters).toHaveBeenCalledWith(
        [
          { type: 'uint256', name: 'chainId' },
          { type: 'address', name: 'vaultAddress' },
          { type: 'uint256', name: 'blockNumber' },
          { type: 'uint256', name: 'transactionIndex' },
          { type: 'uint256', name: 'logIndex' },
        ],
        [
          BigInt(mockChainId),
          mockVaultAddress,
          mockBlockNumber,
          BigInt(mockTransactionIndex),
          BigInt(1), // log index should be 1 (second log)
        ],
      )
    })

    it('should handle writeContract errors', async () => {
      const mockError = new Error('Transaction failed')
      mockWriteContract.mockRejectedValueOnce(mockError)

      await expect(
        deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId),
      ).rejects.toThrow('Transaction failed')
    })

    it('should handle waitForTransactionReceipt errors', async () => {
      const mockError = new Error('Receipt timeout')
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockRejectedValueOnce(mockError)

      await expect(
        deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId),
      ).rejects.toThrow('Receipt timeout')
    })

    it('should encode payment ID parameters correctly', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(mockEncodeAbiParameters).toHaveBeenCalledWith(
        [
          { type: 'uint256', name: 'chainId' },
          { type: 'address', name: 'vaultAddress' },
          { type: 'uint256', name: 'blockNumber' },
          { type: 'uint256', name: 'transactionIndex' },
          { type: 'uint256', name: 'logIndex' },
        ],
        [
          BigInt(mockChainId),
          mockVaultAddress,
          mockBlockNumber,
          BigInt(mockTransactionIndex),
          BigInt(mockLogIndex),
        ],
      )
    })

    it('should handle null transaction index in receipt', async () => {
      const receiptWithNullTxIndex = {
        ...createMockReceipt(),
        transactionIndex: null,
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receiptWithNullTxIndex as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
      expect(mockEncodeAbiParameters).not.toHaveBeenCalled()
    })

    it('should search all logs for PaymentInitiated event', async () => {
      const receiptWithManyLogs = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [],
            data: '0x',
          },
          {
            address: mockVaultAddress,
            topics: [
              '0xbad1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockDecodeEventLog.mockRejectedValueOnce(new Error('Not PaymentInitiated'))
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receiptWithManyLogs as any)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
      // The first log has no topics, so decodeEventLog is not called for it
      // The second log has topics but doesn't decode to PaymentInitiated
      expect(mockDecodeEventLog).toHaveBeenCalledTimes(1)
    })

    it('should handle maximum possible amount', async () => {
      const { maxUint256 } = await import('viem')
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, maxUint256, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: [mockTokenAddress, maxUint256, mockRecipient],
        }),
      )
    })

    it('should handle minimum possible amount (1 wei)', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, 1n, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
    })

    it('should handle gas limit configuration', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          gas: 500000n,
        }),
      )
    })

    it('should validate deposit return type structure', async () => {
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toHaveProperty('paymentId')
      expect(typeof result.paymentId === 'string' || result.paymentId === null).toBe(true)
    })

    it('should handle mixed case vault address in logs', async () => {
      const receipt = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: '0xA26733606BF8E0BD8D77Bddb707F05D7708EFBf7' as const, // Mixed case
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receipt as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
    })

    it('should handle empty logs array', async () => {
      const receiptWithEmptyLogs = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receiptWithEmptyLogs as any)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
    })

    it('should handle extremely large transaction index', async () => {
      const largeTxIndex = 255
      const receipt = {
        blockNumber: mockBlockNumber,
        transactionIndex: largeTxIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
              '0x000000000000000000000000aa8e23fb1079ea71e0a56f48a2a51851d8433d0',
              '0x0000000000000000000000009876543210987654321098765432109876543210',
            ],
            data: '0x',
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receipt as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result.paymentId).toBe(mockPaymentId)
      expect(mockEncodeAbiParameters).toHaveBeenCalledWith(
        expect.any(Array),
        expect.arrayContaining([BigInt(largeTxIndex)]),
      )
    })

    it('should handle logs with data but no matching event', async () => {
      const receipt = {
        blockNumber: mockBlockNumber,
        transactionIndex: mockTransactionIndex,
        logs: [
          {
            address: mockVaultAddress,
            topics: [
              '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              '0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb',
            ],
            data: '0x1234567890abcdef', // Some data that doesn't decode to PaymentInitiated
          },
        ],
      }
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(receipt as any)
      mockDecodeEventLog.mockImplementationOnce(() => {
        throw new Error('Invalid event')
      })

      const result = await deposit(mockVaultAddress, mockTokenAddress, mockAmount, mockRecipient, mockChainId)

      expect(result).toEqual({ paymentId: null })
    })

    it('should handle paymentId hash generation consistency', async () => {
      // First deposit call
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      // Second deposit call
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce(createMockReceipt() as any)
      mockDecodeEventLog.mockReturnValueOnce({
        eventName: 'PaymentInitiated',
      } as any)
      mockEncodeAbiParameters.mockReturnValueOnce('0xencodeddata' as any)
      mockKeccak256.mockReturnValueOnce(mockPaymentId)

      const result1 = await deposit(
        mockVaultAddress,
        mockTokenAddress,
        mockAmount,
        mockRecipient,
        mockChainId,
      )
      const result2 = await deposit(
        mockVaultAddress,
        mockTokenAddress,
        mockAmount,
        mockRecipient,
        mockChainId,
      )

      expect(result1.paymentId).toBe(result2.paymentId)
      expect(mockKeccak256).toHaveBeenCalledTimes(2)
    })
  })

  describe('module exports', () => {
    it('should export all functions', async () => {
      const module = await import('./paymasterVault')
      expect(module.deposit).toBeDefined()
    })
  })
})
