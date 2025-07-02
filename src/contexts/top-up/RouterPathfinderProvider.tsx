import { useCallback } from 'react'
import type { FC, PropsWithChildren } from 'react'
import { RouterPathfinderContext } from './RouterPathfinderContext'
import type { RouterPathfinderProviderContext } from './RouterPathfinderContext'
import { useAccount, useSendTransaction } from 'wagmi'
import type { QuoteResponse, TransactionRequestBody } from '../../backend/top-up'
import { Api } from '../../backend/top-up'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { wagmiConfig } from '../../constants/wagmi-config'
import { ROUTER_PATHFINDER_API_URL } from '../../constants/top-up-config.ts'

const pathfinderApi = new Api({
  baseUrl: ROUTER_PATHFINDER_API_URL,
})

export const RouterPathfinderContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { address: userAddress } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()

  const getQuote = useCallback(
    async (params: {
      fromTokenAddress: string
      toTokenAddress: string
      amount: string
      fromTokenChainId: string
      toTokenChainId: string
      slippageTolerance?: number
      destFuel?: number
      partnerId?: number
    }) => {
      const defaultParams = {
        slippageTolerance: 2,
        destFuel: 0,
        partnerId: Number(import.meta.env.VITE_NITRO_PARTNER_ID),
      }

      const mergedParams = { ...defaultParams, ...params }

      try {
        const response = await pathfinderApi.quote.quote(mergedParams)
        return response.data
      } catch (error) {
        console.error('Error fetching quote:', error)
        throw error
      }
    },
    [],
  )

  const getTransaction = useCallback(
    async (
      params: {
        senderAddress: string
        receiverAddress: string
        refundAddress?: string
      } & QuoteResponse,
    ) => {
      try {
        const response = await pathfinderApi.transaction.transaction(params as TransactionRequestBody)
        return response.data
      } catch (error) {
        console.error('Error fetching transaction:', error)
        throw error
      }
    },
    [],
  )

  const getStatus = useCallback(async (params: { srcTxHash: string }) => {
    try {
      const response = await pathfinderApi.status.status({ ...params })
      return response.data
    } catch (error) {
      console.error('Error fetching transaction:', error)
      throw error
    }
  }, [])

  const pollStatus = useCallback(
    async ({ srcTxHash }: { srcTxHash: string }) => {
      let isCompleted = false
      let attempts = 0
      const maxAttempts = 60

      while (!isCompleted && attempts < maxAttempts) {
        try {
          const status = await getStatus({ srcTxHash })

          if (status.status === 'completed') {
            isCompleted = true
            return status
          } else if (status.status === 'failed') {
            throw new Error('Topup transaction failed during processing')
          }

          await new Promise(resolve => setTimeout(resolve, 10000))
          attempts++
        } catch (statusError) {
          console.error('Error checking transaction status:', statusError)
          await new Promise(resolve => setTimeout(resolve, 10000))
          attempts++
        }
      }

      if (!isCompleted && attempts >= maxAttempts) {
        console.warn('Transaction status polling timed out, but transaction may still complete')
      }

      return null
    },
    [getStatus],
  )

  const executeTransaction = async (quote: QuoteResponse) => {
    const tx = await getTransaction({
      ...quote,
      senderAddress: userAddress as string,
      receiverAddress: userAddress as string,
    })

    const hash = await sendTransactionAsync({
      ...tx.txn,
    })

    await waitForTransactionReceipt(wagmiConfig, {
      hash,
    })

    return hash
  }

  const providerState: RouterPathfinderProviderContext = {
    getQuote,
    getTransaction,
    getStatus,
    pollStatus,
    executeTransaction,
  }

  return <RouterPathfinderContext.Provider value={providerState}>{children}</RouterPathfinderContext.Provider>
}
