import { Address } from 'viem'
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
  getBalance,
  switchChain,
} from 'wagmi/actions'
import type { GetBalanceReturnType } from 'wagmi/actions'
import { wagmiConfig } from '../constants/wagmi-config'
import { getChainId } from 'wagmi/actions'
import ERC_20_ABI from './erc-20_ABI.json'
import { ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS } from '../constants/rofl-paymaster-config.ts'

export const getErc20Balance = async (
  tokenAddress: Address,
  userAddress: Address,
  chainId: number,
): Promise<GetBalanceReturnType> => {
  try {
    // Native token balance
    if (tokenAddress.toLowerCase() === ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS) {
      return await getBalance(wagmiConfig, {
        address: userAddress,
        chainId,
      })
    }

    return await getBalance(wagmiConfig, {
      address: userAddress,
      token: tokenAddress,
      chainId,
    })
  } catch (error) {
    console.error(`Failed to get balance for token ${tokenAddress}:`, error)
    throw error
  }
}

// Fetch the current allowance and update if needed
export const checkAndSetErc20Allowance = async (
  tokenAddress: Address,
  approvalAddress: Address,
  amount: bigint,
  userAddress: Address,
  allowanceAmount = amount,
): Promise<void> => {
  // Transactions with the native token don't need approval
  if (tokenAddress.toLowerCase() === ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS) {
    return
  }

  const allowance = (await readContract(wagmiConfig, {
    address: tokenAddress,
    abi: ERC_20_ABI,
    functionName: 'allowance',
    args: [userAddress, approvalAddress],
  })) as bigint

  if (allowance < amount) {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: tokenAddress,
        abi: ERC_20_ABI,
        functionName: 'approve',
        args: [approvalAddress, allowanceAmount],
      })

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      })

      console.log(`Transaction mined successfully: ${hash}`)
    } catch (error) {
      console.error(`Transaction failed with error: ${error}`)
      throw error
    }
  }
}

interface ChainSwitchOptions {
  targetChainId: number
  address: string | undefined
}

interface ChainSwitchResult {
  success: boolean
  error?: string
}

export const switchToChain = async ({
  targetChainId,
  address,
}: ChainSwitchOptions): Promise<ChainSwitchResult> => {
  if (!address) {
    throw new Error('Wallet not connected')
  }

  try {
    const actualCurrentChainId = await getChainId(wagmiConfig)

    if (actualCurrentChainId === targetChainId) {
      return { success: true }
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Chain switch timeout')), 3000),
    )

    await Promise.race([switchChain(wagmiConfig, { chainId: targetChainId }), timeoutPromise])

    await new Promise(resolve => setTimeout(resolve, 7000))
    return { success: true }
  } catch (switchError) {
    if (switchError instanceof Error && switchError.message.includes('Unsupported Chain')) {
      console.warn("Got 'Unsupported Chain' error, likely succeeded, but throwing anyway.")
      return { success: false }
    }
  }

  const errorMessage = `Failed to switch to chain (Chain ID: ${targetChainId}).`
  return { success: false, error: errorMessage }
}
