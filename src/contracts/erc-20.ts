import type { Address } from 'viem'
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
  getBalance,
  switchChain,
} from 'wagmi/actions'
import type { GetBalanceReturnType } from 'wagmi/actions'
import { wagmiConfig } from '../constants/wagmi-config'
import { NATIVE_TOKEN_ADDRESS } from '../constants/top-up-config.ts'
import { getChainId } from 'wagmi/actions'

const erc20_abi = [
  {
    name: 'approve',
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'allowance',
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

export const getErc20Balance = async (
  tokenAddress: Address,
  userAddress: Address,
  chainId: number,
): Promise<GetBalanceReturnType> => {
  try {
    // Native token balance
    if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS) {
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
): Promise<void> => {
  // Transactions with the native token don't need approval
  if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS) {
    return
  }

  const allowance = (await readContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20_abi,
    functionName: 'allowance',
    args: [userAddress, approvalAddress],
  })) as bigint

  if (allowance < amount) {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20_abi,
        functionName: 'approve',
        args: [approvalAddress, amount],
      })

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      })

      console.log(`Transaction mined successfully: ${hash}`)
    } catch (error) {
      console.log(`Transaction failed with error: ${error}`)
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

  const switchTimeout = 3000

  try {
    const actualCurrentChainId = await getChainId(wagmiConfig)

    if (actualCurrentChainId === targetChainId) {
      return { success: true }
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Chain switch timeout')), switchTimeout),
    )

    await Promise.race([switchChain(wagmiConfig, { chainId: targetChainId }), timeoutPromise])

    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
  } catch (switchError) {
    if (switchError instanceof Error && switchError.message.includes('Unsupported Chain')) {
      console.log("Got 'Unsupported Chain' error, but continuing as switch likely succeeded")
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    }
  }

  const errorMessage = `Failed to switch to chain (Chain ID: ${targetChainId}).`
  return { success: false, error: errorMessage }
}
