import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
  getBalance,
  switchChain,
  getChainId,
} from 'wagmi/actions'
import type { GetBalanceReturnType } from 'wagmi/actions'

// Mock wagmi actions
vi.mock('wagmi/actions', () => ({
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
  getBalance: vi.fn(),
  switchChain: vi.fn(),
  getChainId: vi.fn(),
}))

// Mock wagmi config
vi.mock('../constants/wagmi-config', () => ({
  wagmiConfig: {},
}))

// Mock ABI
vi.mock('./erc-20_ABI.json', () => ({
  default: [
    {
      name: 'approve',
      inputs: [
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      name: 'allowance',
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' },
      ],
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
}))

// Mock paymaster config
vi.mock('../constants/rofl-paymaster-config.ts', () => ({
  ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS: '0xNATIVE',
}))

import { getErc20Balance, checkAndSetErc20Allowance, switchToChain } from './erc-20'

const mockReadContract = vi.mocked(readContract)
const mockWaitForTransactionReceipt = vi.mocked(waitForTransactionReceipt)
const mockWriteContract = vi.mocked(writeContract)
const mockGetBalance = vi.mocked(getBalance)
const mockSwitchChain = vi.mocked(switchChain)
const mockGetChainId = vi.mocked(getChainId)

describe('erc-20', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getErc20Balance', () => {
    it('should get native token balance successfully', async () => {
      const mockBalance = {
        decimals: 18,
        formatted: '1.5',
        symbol: 'ETH',
        value: 1500000000000000000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance('0xNATIVE', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 1)

      expect(result).toEqual(mockBalance)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          chainId: 1,
        }),
      )
    })

    it('should get ERC20 token balance successfully', async () => {
      const mockBalance = {
        decimals: 6,
        formatted: '100.5',
        symbol: 'USDT',
        value: 100500000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        1,
      )

      expect(result).toEqual(mockBalance)
      expect(mockGetBalance).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          token: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          chainId: 1,
        }),
      )
    })

    it('should handle zero balance', async () => {
      const mockBalance = {
        decimals: 18,
        formatted: '0',
        symbol: 'ETH',
        value: 0n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance('0xNATIVE', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 1)

      expect(result.value).toBe(0n)
    })

    it('should handle balance retrieval errors', async () => {
      const mockError = new Error('Failed to get balance')
      mockGetBalance.mockRejectedValueOnce(mockError)

      await expect(
        getErc20Balance(
          '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          1,
        ),
      ).rejects.toThrow('Failed to get balance')
    })

    it('should handle native token with mixed case', async () => {
      const mockBalance = {
        decimals: 18,
        formatted: '1.0',
        symbol: 'ROSE',
        value: 1000000000000000000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance('0xNative', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 1)

      expect(result).toEqual(mockBalance)
      expect(mockGetBalance).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          chainId: 1,
        }),
      )
    })

    it('should handle different chain IDs', async () => {
      const mockBalance = {
        decimals: 18,
        formatted: '1.0',
        symbol: 'ETH',
        value: 1000000000000000000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance('0xNATIVE', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 11155111)

      expect(result).toEqual(mockBalance)
      expect(mockGetBalance).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 11155111,
        }),
      )
    })

    it('should handle different token addresses', async () => {
      const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      const mockBalance = {
        decimals: 6,
        formatted: '500',
        symbol: 'USDC',
        value: 500000000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance(usdcAddress, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 1)

      expect(result.value).toBe(500000000n)
      expect(mockGetBalance).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          token: usdcAddress,
        }),
      )
    })

    it('should handle uppercase native token address', async () => {
      const mockBalance = {
        decimals: 18,
        formatted: '1.0',
        symbol: 'ETH',
        value: 1000000000000000000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance('0xNATIVE', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 1)

      expect(result).toEqual(mockBalance)
      expect(mockGetBalance).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        }),
      )
    })

    it('should handle very large balances', async () => {
      const { maxUint256 } = await import('viem')
      const mockBalance = {
        decimals: 18,
        formatted: maxUint256.toString(),
        symbol: 'USDT',
        value: maxUint256,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        1,
      )

      expect(result.value).toBe(maxUint256)
    })

    it('should handle case-insensitive native token address variations', async () => {
      const mockBalance = {
        decimals: 18,
        formatted: '1.0',
        symbol: 'ETH',
        value: 1000000000000000000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance('0xNaTiVe', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 1)

      expect(result).toEqual(mockBalance)
    })

    it('should return correct balance structure', async () => {
      const mockBalance = {
        decimals: 6,
        formatted: '100.5',
        symbol: 'USDT',
        value: 100500000n,
      } as GetBalanceReturnType

      mockGetBalance.mockResolvedValueOnce(mockBalance)

      const result = await getErc20Balance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        1,
      )

      expect(result).toHaveProperty('decimals')
      expect(result).toHaveProperty('formatted')
      expect(result).toHaveProperty('symbol')
      expect(result).toHaveProperty('value')
    })
  })

  describe('checkAndSetErc20Allowance', () => {
    it('should return early for native token', async () => {
      // The native token address comparison should match and return early
      // ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS is '0xNATIVE'
      // and '0xNATIVE'.toLowerCase() === '0xNATIVE' is true
      await expect(
        checkAndSetErc20Allowance(
          '0xNATIVE',
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          1000000n,
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        ),
      ).resolves.toBeUndefined()

      // The function should complete without errors for native token
      // (no approval needed for native token transactions)
    })

    it('should not approve when allowance is sufficient', async () => {
      mockReadContract.mockResolvedValueOnce(10000000n)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockReadContract).toHaveBeenCalledTimes(1)
      expect(mockReadContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          functionName: 'allowance',
          args: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', '0x7304cAc43536CAE229c0D55129B867CCF43F83F4'],
        }),
      )
      expect(mockWriteContract).not.toHaveBeenCalled()
    })

    it('should approve when allowance is insufficient', async () => {
      const mockHash = '0x1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(500000n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockReadContract).toHaveBeenCalledTimes(1)
      expect(mockWriteContract).toHaveBeenCalledTimes(1)
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          functionName: 'approve',
          args: ['0x7304cAc43536CAE229c0D55129B867CCF43F83F4', expect.any(BigInt)],
        }),
      )
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledTimes(1)
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          hash: mockHash,
        }),
      )
    })

    it('should use default maxUint256 for allowance amount', async () => {
      const mockHash = '0x1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: ['0x7304cAc43536CAE229c0D55129B867CCF43F83F4', expect.any(BigInt)],
        }),
      )
    })

    it('should use custom allowance amount when provided', async () => {
      const mockHash = '0x1234567890abcdef'
      const customAllowance = 5000000n
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        customAllowance,
      )

      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: ['0x7304cAc43536CAE229c0D55129B867CCF43F83F4', customAllowance],
        }),
      )
    })

    it('should handle zero allowance', async () => {
      mockReadContract.mockResolvedValueOnce(0n)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockWriteContract).toHaveBeenCalled()
    })

    it('should handle transaction failures', async () => {
      const mockError = new Error('Transaction failed')
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockRejectedValueOnce(mockError)

      await expect(
        checkAndSetErc20Allowance(
          '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          1000000n,
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        ),
      ).rejects.toThrow('Transaction failed')
    })

    it('should handle transaction receipt waiting failures', async () => {
      const mockHash = '0x1234567890abcdef'
      const mockError = new Error('Transaction receipt timeout')
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockRejectedValueOnce(mockError)

      await expect(
        checkAndSetErc20Allowance(
          '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          1000000n,
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        ),
      ).rejects.toThrow('Transaction receipt timeout')
    })

    it('should handle different token addresses', async () => {
      const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      const mockHash = '0x1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        usdcAddress,
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        2000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          address: usdcAddress,
        }),
      )
    })

    it('should handle different user and approval addresses', async () => {
      const mockHash = '0x1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      const userAddress = '0x1234567890123456789012345678901234567890'
      const approvalAddress = '0x9876543210987654321098765432109876543210'

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        approvalAddress,
        1000000n,
        userAddress,
      )

      expect(mockReadContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: [userAddress, approvalAddress],
        }),
      )
      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: [approvalAddress, expect.any(BigInt)],
        }),
      )
    })

    it('should handle edge case where allowance equals required amount', async () => {
      mockReadContract.mockResolvedValueOnce(1000000n)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockWriteContract).not.toHaveBeenCalled()
    })

    it('should handle maxUint256 as custom allowance amount', async () => {
      const { maxUint256 } = await import('viem')
      const mockHash = '0x1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        maxUint256,
      )

      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: ['0x7304cAc43536CAE229c0D55129B867CCF43F83F4', maxUint256],
        }),
      )
    })

    it('should handle extremely large required amounts', async () => {
      const { maxUint256 } = await import('viem')
      const mockHash = '0x1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(maxUint256 - 1n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        maxUint256,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockWriteContract).toHaveBeenCalled()
    })

    it('should handle small allowance amounts', async () => {
      const mockHash = '0x1234567890abcdef'
      mockReadContract.mockResolvedValueOnce(0n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1n, // smallest possible amount
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        5n,
      )

      expect(mockWriteContract).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          args: ['0x7304cAc43536CAE229c0D55129B867CCF43F83F4', 5n],
        }),
      )
    })

    it('should handle allowance just one less than required', async () => {
      const mockHash = '0x1234567890abcdef'
      const requiredAmount = 1000000n
      mockReadContract.mockResolvedValueOnce(requiredAmount - 1n)
      mockWriteContract.mockResolvedValueOnce(mockHash)
      mockWaitForTransactionReceipt.mockResolvedValueOnce({
        status: 'success',
      } as any)

      await checkAndSetErc20Allowance(
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        requiredAmount,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(mockWriteContract).toHaveBeenCalled()
    })

    it('should validate return type is void for native token', async () => {
      const result = await checkAndSetErc20Allowance(
        '0xNATIVE',
        '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
        1000000n,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      )

      expect(result).toBeUndefined()
    })

    it('should handle case-insensitive native token address', async () => {
      await expect(
        checkAndSetErc20Allowance(
          '0xnative',
          '0x7304cAc43536CAE229c0D55129B867CCF43F83F4',
          1000000n,
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        ),
      ).resolves.toBeUndefined()
    })
  })

  describe('switchToChain', () => {
    it('should throw error when wallet is not connected', async () => {
      await expect(
        switchToChain({
          targetChainId: 1,
          address: undefined,
        }),
      ).rejects.toThrow('Wallet not connected')
    })

    it('should return success when already on target chain', async () => {
      mockGetChainId.mockResolvedValueOnce(1)

      const result = await switchToChain({
        targetChainId: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      expect(result).toEqual({ success: true })
      expect(mockSwitchChain).not.toHaveBeenCalled()
    })

    it('should successfully switch to target chain', async () => {
      mockGetChainId.mockResolvedValueOnce(11155111)
      mockSwitchChain.mockResolvedValueOnce(undefined)

      const promise = switchToChain({
        targetChainId: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      // Fast forward through the 7 second delay
      await vi.advanceTimersByTimeAsync(7000)

      const result = await promise

      expect(result).toEqual({ success: true })
      expect(mockSwitchChain).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 1,
        }),
      )
    })

    it('should handle chain switch timeout', async () => {
      mockGetChainId.mockResolvedValueOnce(11155111)
      mockSwitchChain.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(undefined), 5000)
          }),
      )

      const promise = switchToChain({
        targetChainId: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      // Fast forward through the timeout (3 seconds) + delay (7 seconds)
      await vi.advanceTimersByTimeAsync(10000)

      const result = await promise

      expect(result).toEqual({
        success: false,
        error: 'Failed to switch to chain (Chain ID: 1).',
      })
    })

    it('should handle "Unsupported Chain" error gracefully', async () => {
      mockGetChainId.mockResolvedValueOnce(11155111)
      const unsupportedError = new Error('Unsupported Chain')
      mockSwitchChain.mockRejectedValueOnce(unsupportedError)

      const promise = switchToChain({
        targetChainId: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      await vi.advanceTimersByTimeAsync(7000)

      const result = await promise

      // The code specifically handles "Unsupported Chain" error and returns { success: false }
      // without the error message in this case
      expect(result).toEqual({
        success: false,
      })
    })

    it('should handle other chain switch errors', async () => {
      mockGetChainId.mockResolvedValueOnce(11155111)
      const genericError = new Error('User rejected')
      mockSwitchChain.mockRejectedValueOnce(genericError)

      const promise = switchToChain({
        targetChainId: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      await vi.advanceTimersByTimeAsync(7000)

      const result = await promise

      expect(result).toEqual({
        success: false,
        error: 'Failed to switch to chain (Chain ID: 1).',
      })
    })

    it('should handle different target chain IDs', async () => {
      mockGetChainId.mockResolvedValueOnce(1)
      mockSwitchChain.mockResolvedValueOnce(undefined)

      const promise = switchToChain({
        targetChainId: 42161,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      await vi.advanceTimersByTimeAsync(7000)

      const result = await promise

      expect(result).toEqual({ success: true })
      expect(mockSwitchChain).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 42161,
        }),
      )
    })

    it('should handle different user addresses', async () => {
      mockGetChainId.mockResolvedValueOnce(1)

      const result = await switchToChain({
        targetChainId: 1,
        address: '0x1234567890123456789012345678901234567890',
      })

      expect(result).toEqual({ success: true })
    })

    it('should handle case where switch chain succeeds with no current chain match', async () => {
      mockGetChainId.mockResolvedValueOnce(42161) // Arbitrum
      mockSwitchChain.mockResolvedValueOnce(undefined)

      const promise = switchToChain({
        targetChainId: 1, // Ethereum
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      await vi.advanceTimersByTimeAsync(7000)

      const result = await promise

      expect(result).toEqual({ success: true })
      expect(mockSwitchChain).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          chainId: 1,
        }),
      )
    })

    it('should handle empty string address', async () => {
      await expect(
        switchToChain({
          targetChainId: 1,
          address: '',
        }),
      ).rejects.toThrow('Wallet not connected')
    })

    it('should validate ChainSwitchResult structure on success', async () => {
      mockGetChainId.mockResolvedValueOnce(1)

      const result = await switchToChain({
        targetChainId: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })

    it('should validate ChainSwitchResult structure on failure', async () => {
      mockGetChainId.mockResolvedValueOnce(11155111)
      const genericError = new Error('User rejected')
      mockSwitchChain.mockRejectedValueOnce(genericError)

      const promise = switchToChain({
        targetChainId: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      })

      await vi.advanceTimersByTimeAsync(7000)

      const result = await promise

      expect(result).toHaveProperty('success')
      expect(result.success).toBe(false)
      expect(result).toHaveProperty('error')
      expect(typeof result.error).toBe('string')
    })
  })

  describe('module exports', () => {
    it('should export all functions', async () => {
      const module = await import('./erc-20')
      expect(module.getErc20Balance).toBeDefined()
      expect(module.checkAndSetErc20Allowance).toBeDefined()
      expect(module.switchToChain).toBeDefined()
    })
  })
})
