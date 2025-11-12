import { Address, decodeEventLog, encodeAbiParameters, keccak256 } from 'viem'
import { writeContract } from 'wagmi/actions'
import { wagmiConfig } from '../constants/wagmi-config'
import PaymasterVault_ABI from './PaymasterVault_ABI.json'
import { waitForTransactionReceipt } from '@wagmi/core'
import { ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT } from '../constants/rofl-paymaster-config.ts'

export const deposit = async (
  roflPaymasterVaultContractAddress: Address,
  tokenContractAddress: Address,
  amount: bigint,
  recipient: Address,
  chainId: number,
): Promise<{ paymentId: string | null }> => {
  const hash = await writeContract(wagmiConfig, {
    address: roflPaymasterVaultContractAddress,
    abi: PaymasterVault_ABI,
    functionName: 'deposit',
    args: [tokenContractAddress, amount, recipient],
    chainId,
    gas: ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT,
  })

  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash,
    chainId,
  })

  let paymentLogIndex: number | null = null

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i]

    if (log.address.toLowerCase() !== roflPaymasterVaultContractAddress.toLowerCase()) {
      continue
    }

    if (!log.topics || log.topics.length === 0) {
      continue
    }

    try {
      const decodedPaymentInitiated = decodeEventLog({
        abi: PaymasterVault_ABI,
        eventName: 'PaymentInitiated',
        data: log.data,
        topics: log.topics,
      })

      if (decodedPaymentInitiated.eventName === 'PaymentInitiated') {
        paymentLogIndex = i
      }
    } catch {
      return { paymentId: null }
    }
  }

  let paymentId: string | null = null
  if (paymentLogIndex !== null && receipt.transactionIndex !== null) {
    paymentId = keccak256(
      encodeAbiParameters(
        [
          { type: 'uint256', name: 'chainId' },
          { type: 'address', name: 'vaultAddress' },
          { type: 'uint256', name: 'blockNumber' },
          { type: 'uint256', name: 'transactionIndex' },
          { type: 'uint256', name: 'logIndex' },
        ],
        [
          BigInt(chainId),
          roflPaymasterVaultContractAddress,
          receipt.blockNumber,
          BigInt(receipt.transactionIndex),
          BigInt(paymentLogIndex),
        ],
      ),
    )
  }

  return { paymentId }
}
