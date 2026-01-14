import { useCallback, useState } from 'react'
import { useAccount, useBalance, type BaseError } from 'wagmi'
import { checkAndSetErc20Allowance, switchToChain } from '../contracts/erc-20'
import { Address } from 'viem'
import {
  ROFL_PAYMASTER_DESTINATION_CHAIN,
  ROFL_PAYMASTER_TOKEN_CONFIG,
} from '../constants/rofl-paymaster-config.ts'
import { useRoflPaymasterContext } from '../contexts/RoflPaymaster/hooks'

export type PaymasterStepStatus = 'pending' | 'processing' | 'completed' | 'error'

export type ProgressStep = {
  id: number
  label: string
  description: string
  expectedTimeInSeconds?: number
}

export type ProgressStepWithAction = ProgressStep & {
  action: () => Promise<void>
}

export type StartTopUpParams = {
  amount: bigint
  sourceChainId: number
}

export type GetQuoteParams = {
  amount: bigint
}

interface RoflPaymasterTokenConfig {
  contractAddress: Address
  symbol: string
  decimals: number
  name: string
}

export type UsePaymasterTopUpFlowReturn = {
  isLoading: boolean
  initialLoading: boolean
  error: string
  quote: bigint | null

  currentStep: ProgressStep | ProgressStepWithAction | null
  stepStatuses: Partial<Record<number, PaymasterStepStatus>>

  getQuote: (p: GetQuoteParams) => Promise<bigint | null>
  startTopUp: (p: StartTopUpParams) => Promise<{ paymentId: string | null }>
  reset: () => void
}

export function usePaymaster(
  targetToken: RoflPaymasterTokenConfig | null,
  progressSteps: ProgressStep[] = [],
  additionalSteps: ProgressStepWithAction[] = [],
): UsePaymasterTopUpFlowReturn {
  const { address } = useAccount()
  const { refetch: refetchSapphireNativeBalance } = useBalance({
    address,
    chainId: ROFL_PAYMASTER_DESTINATION_CHAIN.id,
    query: { enabled: !!address },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [quote, setQuote] = useState<bigint | null>(null)

  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [stepStatuses, setStepStatuses] = useState<Partial<Record<number, PaymasterStepStatus>>>({})

  const updateStep = useCallback((step: number, status: PaymasterStepStatus) => {
    setCurrentStep(step)
    setStepStatuses(prev => ({ ...prev, [step]: status }))
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError('')
    setQuote(null)
    setCurrentStep(null)
    setStepStatuses({})
  }, [])

  const { getQuote: getQuoteCtx, createDeposit, pollPayment } = useRoflPaymasterContext()

  const getQuote = useCallback(
    async ({ amount }: GetQuoteParams) => {
      setError('')
      setQuote(null)

      if (!address) throw new Error('Wallet not connected')

      setIsLoading(true)
      try {
        const q = await getQuoteCtx(targetToken!.contractAddress, amount, ROFL_PAYMASTER_DESTINATION_CHAIN)
        setQuote(q)
        return q
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to fetch quote'
        setError(msg)
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [address, getQuoteCtx, targetToken],
  )

  const waitForSapphireNativeBalanceIncrease = useCallback(
    async ({
      baseline,
      timeoutMs,
      intervalMs,
      minIncrease,
    }: {
      baseline: bigint
      timeoutMs: number
      intervalMs: number
      minIncrease: bigint
    }) => {
      const startedAt = Date.now()
      while (Date.now() - startedAt < timeoutMs) {
        const res = await refetchSapphireNativeBalance()
        const current = res.data?.value

        if (typeof current === 'bigint' && current >= baseline + minIncrease) return current

        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }

      throw new Error('Payment likely processed, but Sapphire native balance did not increase in time')
    },
    [refetchSapphireNativeBalance],
  )

  const startTopUp = useCallback(
    async ({ amount, sourceChainId }: StartTopUpParams) => {
      setError('')

      if (!address) throw new Error('Wallet not connected')
      if (!targetToken) throw new Error('Target token not selected')

      const sourceChainConfig = ROFL_PAYMASTER_TOKEN_CONFIG[sourceChainId]

      setIsLoading(true)
      setCurrentStep(1)
      try {
        // Snapshot baseline Sapphire native balance
        let baselineSapphireNative = 0n
        try {
          const res = await refetchSapphireNativeBalance()
          baselineSapphireNative = res.data?.value ?? 0n
        } catch (e) {
          console.warn('Failed to fetch baseline balance', e)
        }

        // Step 1: switch to source
        updateStep(1, 'processing')
        await switchToChain({ targetChainId: sourceChainId, address })
        updateStep(1, 'completed')

        // Step 2: allowance
        updateStep(2, 'processing')
        await checkAndSetErc20Allowance(
          targetToken.contractAddress,
          sourceChainConfig.paymasterContractAddress,
          amount,
          address,
        )
        updateStep(2, 'completed')

        // Step 3: create a deposit
        updateStep(3, 'processing')
        const { paymentId } = await createDeposit(targetToken.contractAddress, amount, address, sourceChainId)
        updateStep(3, 'completed')

        // Step 4: poll
        updateStep(4, 'processing')
        await pollPayment(paymentId!, ROFL_PAYMASTER_DESTINATION_CHAIN)

        try {
          await waitForSapphireNativeBalanceIncrease({
            baseline: baselineSapphireNative,
            timeoutMs: 3 * 60_000,
            intervalMs: 4_000,
            minIncrease: 1n,
          })
        } catch (e) {
          console.warn('Balance check failed or timed out', e)
        }

        updateStep(4, 'completed')

        // Step 5: switch to destination
        updateStep(5, 'processing')
        await switchToChain({
          targetChainId: ROFL_PAYMASTER_DESTINATION_CHAIN.id,
          address,
        })
        updateStep(5, 'completed')

        // Additional steps
        for (let i = 0; i < additionalSteps.length; i++) {
          updateStep(i + 6, 'processing')
          await additionalSteps[i].action()
          updateStep(i + 6, 'completed')
        }

        setCurrentStep(null)
        return { paymentId }
      } catch (e) {
        const msg = e instanceof Error ? (e as BaseError).shortMessage || e.message : 'Top up failed'
        setError(msg)

        if (currentStep) {
          setStepStatuses(prev => ({ ...prev, [currentStep]: 'error' }))
        }

        setCurrentStep(null)
        throw e
      } finally {
        setIsLoading(false)
        setCurrentStep(null)

        await switchToChain({
          targetChainId: ROFL_PAYMASTER_DESTINATION_CHAIN.id,
          address,
        })
      }
    },
    [
      address,
      createDeposit,
      currentStep,
      pollPayment,
      updateStep,
      targetToken,
      additionalSteps,
      refetchSapphireNativeBalance,
      waitForSapphireNativeBalanceIncrease,
    ],
  )

  return {
    isLoading,
    error,
    quote,
    currentStep: currentStep
      ? currentStep <= progressSteps.length
        ? progressSteps[currentStep - 1]
        : additionalSteps[currentStep - 1 - progressSteps.length]
      : null,
    stepStatuses,
    getQuote,
    startTopUp,
    reset,
    initialLoading: false,
  }
}
