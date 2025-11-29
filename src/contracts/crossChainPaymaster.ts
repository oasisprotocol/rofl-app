import type { Address } from 'viem'
import { readContract } from 'wagmi/actions'
import { wagmiConfig } from '../constants/wagmi-config'
import CrossChainPaymaster_ABI from './CrossChainPaymaster_ABI.json'

export const calculateRoseAmount = async (
  crossChainPaymasterContractAddress: Address,
  tokenContractAddress: Address,
  amount: bigint,
  chainId: number,
): Promise<bigint> => {
  return (await readContract(wagmiConfig, {
    address: crossChainPaymasterContractAddress,
    abi: CrossChainPaymaster_ABI,
    functionName: 'calculateRoseAmount',
    args: [tokenContractAddress, amount],
    chainId,
  })) as bigint
}

export const isPaymentProcessed = async (
  crossChainPaymasterContractAddress: Address,
  paymentId: string,
  chainId: number,
): Promise<boolean> => {
  return (await readContract(wagmiConfig, {
    address: crossChainPaymasterContractAddress,
    abi: CrossChainPaymaster_ABI,
    functionName: 'isPaymentProcessed',
    args: [paymentId],
    chainId,
  })) as boolean
}
