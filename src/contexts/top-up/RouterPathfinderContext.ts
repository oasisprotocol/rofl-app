import { createContext } from 'react'
import type { QuoteResponse, StatusResponse, TransactionResponseBody } from '../../backend/top-up'

export interface RouterPathfinderProviderContext {
  getQuote: (params: {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    fromTokenChainId: string
    toTokenChainId: string
    slippageTolerance?: number
    destFuel?: number
    partnerId?: number
  }) => Promise<QuoteResponse>
  getTransaction: (
    params: {
      senderAddress: string
      receiverAddress: string
      refundAddress?: string
    } & QuoteResponse,
  ) => Promise<TransactionResponseBody>
  executeTransaction: (quote: QuoteResponse) => Promise<string>
  getStatus: (params: { srcTxHash: string }) => Promise<StatusResponse>
  pollStatus: (params: { srcTxHash: string }) => Promise<StatusResponse | null>
}

export const RouterPathfinderContext = createContext<RouterPathfinderProviderContext>(
  {} as RouterPathfinderProviderContext,
)
