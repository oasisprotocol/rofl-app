import { FC, PropsWithChildren, useState } from 'react'
import { RoflPaymasterContext, RoflPaymasterProviderContext, RoflPaymasterProviderState } from './Context'
import { calculateRoseAmount, isPaymentProcessed } from '../../contracts/crossChainPaymaster.ts'
import type { Address, Chain } from 'viem'
import {
  ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG,
  ROFL_PAYMASTER_TOKEN_CONFIG,
} from '../../constants/rofl-paymaster-config.ts'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { deposit } from '../../contracts/paymasterVault.ts'

const roflPaymasterProviderInitialState: RoflPaymasterProviderState = {
  token: null,
}

export const RoflPaymasterContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state] = useState<RoflPaymasterProviderState>({
    ...roflPaymasterProviderInitialState,
  })

  const getQuote = (tokenContractAddress: Address, amount: bigint, chain: Chain) => {
    if (chain.id !== sapphire.id && chain.id !== sapphireTestnet.id) {
      throw new Error('Invalid chain!')
    }

    return calculateRoseAmount(
      ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG[chain.id],
      tokenContractAddress,
      amount,
      chain.id,
    )
  }

  const createDeposit = (
    tokenContractAddress: Address,
    amount: bigint,
    recipient: Address,
    chainId: number,
  ) => {
    const roflPaymasterVaultContractAddress = ROFL_PAYMASTER_TOKEN_CONFIG[chainId].paymasterContractAddress

    return deposit(roflPaymasterVaultContractAddress, tokenContractAddress, amount, recipient, chainId)
  }

  const pollPayment = async (paymentId: string, chain: Chain) => {
    if (chain.id !== sapphire.id && chain.id !== sapphireTestnet.id) {
      throw new Error('Invalid chain!')
    }
    if (!paymentId) {
      throw new Error('PaymentId is required!')
    }

    let isCompleted = false
    let attempts = 0
    const maxAttempts = 60

    while (!isCompleted && attempts < maxAttempts) {
      try {
        const isProcessed = await isPaymentProcessed(
          ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG[chain.id],
          paymentId,
          chain.id,
        )

        if (isProcessed) {
          isCompleted = true
          return isProcessed
        }

        await new Promise(resolve => setTimeout(resolve, 4000))
        attempts++
      } catch (error) {
        console.error('Error checking payment processed:', error)
        await new Promise(resolve => setTimeout(resolve, 4000))
        attempts++
      }
    }

    if (!isCompleted && attempts >= maxAttempts) {
      console.warn('Payment processed polling timed out, but payment may still complete')
    }

    return null
  }

  const providerState: RoflPaymasterProviderContext = {
    state,
    getQuote,
    createDeposit,
    pollPayment,
  }

  return <RoflPaymasterContext.Provider value={providerState}>{children}</RoflPaymasterContext.Provider>
}
