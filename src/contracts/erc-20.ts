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
  currentChainId: number
  address: string | undefined
}

interface ChainSwitchResult {
  success: boolean
  error?: string
}

export const switchToChain = async ({
  targetChainId,
  currentChainId,
  address,
}: ChainSwitchOptions): Promise<ChainSwitchResult> => {
  if (!address) {
    throw new Error('Wallet not connected')
  }

  if (currentChainId === targetChainId) {
    return { success: true }
  }

  try {
    await switchChain(wagmiConfig, { chainId: targetChainId })

    await new Promise(resolve => setTimeout(resolve, 1000))

    return { success: true }
  } catch (switchError) {
    console.error('Chain switch error:', switchError)

    if (switchError instanceof Error && switchError.message.includes('Unsupported Chain')) {
      console.log("Got 'Unsupported Chain' error, but continuing as switch likely succeeded")

      await new Promise(resolve => setTimeout(resolve, 3000))

      return { success: true }
    } else {
      const errorMessage = `Please switch to the source chain (Chain ID: ${targetChainId}) to continue`
      return { success: false, error: errorMessage }
    }
  }
}
