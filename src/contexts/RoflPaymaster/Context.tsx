import { createContext } from 'react'
import type { Address, Chain } from 'viem'

export interface RoflPaymasterProviderState {
  readonly token: string | null
}

export interface RoflPaymasterProviderContext {
  readonly state: RoflPaymasterProviderState
  getQuote(tokenContractAddress: Address, amount: bigint, chain: Chain): Promise<bigint>
  createDeposit(
    tokenContractAddress: Address,
    amount: bigint,
    recipient: Address,
    chainId: number,
  ): Promise<{ paymentId: string | null }>
  pollPayment(paymentId: string | null, chain: Chain): Promise<boolean | null>
}

export const RoflPaymasterContext = createContext<RoflPaymasterProviderContext>(
  {} as RoflPaymasterProviderContext,
)
