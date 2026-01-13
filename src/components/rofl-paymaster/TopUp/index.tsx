import React, { type FC, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BigNumber } from 'bignumber.js'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Input } from '@oasisprotocol/ui-library/src/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { TokenLogo } from '../TokenLogo'
import type { GetBalanceReturnType } from 'wagmi/actions'
import { useAccount } from 'wagmi'
import { NumberUtils } from '../../../utils/number.utils'
import { FormatUtils } from '../../../utils/format.utils'
import { checkAndSetErc20Allowance, getErc20Balance, switchToChain } from '../../../contracts/erc-20'
import { FaucetInfo } from '../FaucetInfo'
import { ProgressStep, TopUpProgressDialog } from '../TopUpProgressDialog'
import { useNetwork } from '../../../hooks/useNetwork'
import { sapphireTestnet } from 'viem/chains'
import { useChainModal } from '@rainbow-me/rainbowkit'
import { Chain } from 'viem'
import classes from './index.module.css'
import {
  ROFL_PAYMASTER_DESTINATION_CHAIN,
  ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN,
  ROFL_PAYMASTER_ENABLED_CHAINS,
  ROFL_PAYMASTER_EXPECTED_TIME,
  ROFL_PAYMASTER_TOKEN_CONFIG,
} from '../../../constants/rofl-paymaster-config'
import { RoflPaymasterContextProvider } from '../../../contexts/RoflPaymaster/Provider'
import { useRoflPaymasterContext } from '../../../contexts/RoflPaymaster/hooks'
import { ChainNativeCurrency } from '../../../types/rofl-paymaster'
import { TransactionSummary } from '../TransactionSummary'
import { TopUpInitializationFailed } from '../TopUpInitializationFailed'

const { VITE_FEATURE_FLAG_PAYMASTER } = import.meta.env

const bridgeFormSchema = z.object({
  sourceChain: z
    .object({
      id: z.number().nullable(),
      name: z.string(),
    })
    .refine(val => Number.isSafeInteger(val.id) && val.id! > 0, {
      message: 'Source chain is required',
    }),
  sourceToken: z
    .object({
      contractAddress: z.string(),
      symbol: z.string(),
    })
    .refine(val => val.symbol !== '', {
      message: 'Source token is required',
    }),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => NumberUtils.isValidAmount(val), {
      message: 'Amount must be a valid positive number',
    }),
  destinationChain: z
    .object({
      id: z.number().nullable(),
      name: z.string(),
    })
    .refine(val => Number.isSafeInteger(val.id) && val.id! > 0, {
      message: 'Destination chain is required',
    }),
  destinationToken: z
    .object({
      contractAddress: z.string(),
      symbol: z.string(),
    })
    .refine(val => val.symbol !== '', {
      message: 'Destination token is required',
    }),
})

type BridgeFormData = z.infer<typeof bridgeFormSchema>

interface TokenWithBalance extends ChainNativeCurrency {
  balance: GetBalanceReturnType | null
  isLoadingBalance?: boolean
  contractAddress: `0x${string}`
}

interface TopUpProps {
  minAmount: BigNumber
  onValidChange?: (isValid: boolean) => void
  onTopUpSuccess?: () => void
  onTopUpError?: (error: Error) => void
  children?: (props: { isValid: boolean }) => ReactNode
}

const TopUpCmp: FC<TopUpProps> = ({ children, minAmount, onValidChange, onTopUpSuccess, onTopUpError }) => {
  const { address } = useAccount()
  const { openChainModal } = useChainModal()
  const { getQuote, createDeposit, pollPayment } = useRoflPaymasterContext()

  const [selectedChainTokens, setSelectedChainTokens] = useState<TokenWithBalance[] | null>(null)
  const [quote, setQuote] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [topUpError, setTopUpError] = useState('')

  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [stepStatuses, setStepStatuses] = useState<{
    [key: number]: 'pending' | 'processing' | 'completed' | 'error'
  }>({})

  const updateStepStatus = (stepId: number, status: 'pending' | 'processing' | 'completed' | 'error') => {
    setStepStatuses(prev => ({
      ...prev,
      [stepId]: status,
    }))
  }

  useEffect(() => {
    document.body.classList.add('topUp')
    return () => {
      document.body.classList.remove('topUp')
    }
  }, [])

  const form = useForm<BridgeFormData>({
    resolver: zodResolver(bridgeFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      sourceChain: { id: null, name: '' },
      sourceToken: { symbol: '', contractAddress: '' },
      amount: '',
      destinationChain: {
        id: ROFL_PAYMASTER_DESTINATION_CHAIN.id,
        name: ROFL_PAYMASTER_DESTINATION_CHAIN.name,
      },
      destinationToken: {
        symbol: ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.symbol,
        contractAddress: '0xNATIVE',
      },
    },
  })

  const {
    watch,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = form

  const watchedValues = watch()
  const isFormValid = !Object.keys(form.formState.errors).length

  useEffect(() => {
    if (!onValidChange) return
    onValidChange(isFormValid)
  }, [isFormValid, onValidChange])

  const currentMaxAmount = useMemo(() => {
    return selectedChainTokens?.find(
      (token): token is TokenWithBalance => token.symbol === watchedValues.sourceToken?.symbol,
    )?.balance
  }, [selectedChainTokens, watchedValues.sourceToken?.symbol])

  // Custom validation for amount based on balance using BigNumber comparison
  useEffect(() => {
    const amount = watchedValues.amount
    if (amount && currentMaxAmount) {
      if (NumberUtils.isGreaterThan(amount, currentMaxAmount.value.toString())) {
        setError('amount', {
          type: 'manual',
          message: `Amount cannot exceed balance (${currentMaxAmount.formatted})`,
        })
      } else {
        clearErrors('amount')
      }
    } else {
      clearErrors('amount')
    }
  }, [watchedValues.amount, currentMaxAmount, setError, clearErrors])

  // Custom validation for minimum amount
  useEffect(() => {
    // TODO: Remove, temporary validation removal for testing
    return

    if (quote) {
      if (NumberUtils.isLessThan(quote!.toString(), minAmount.toString())) {
        setError('destinationToken', {
          type: 'manual',
          message: `Amount cannot be less than minimum (${NumberUtils.formatTokenAmountWithSymbol(minAmount.toString())})`,
        })
      } else {
        clearErrors('destinationToken')
      }
    }
  }, [watchedValues.amount, quote, minAmount, setError, clearErrors])

  useEffect(() => {
    if (ROFL_PAYMASTER_DESTINATION_CHAIN && ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN) {
      setValue('destinationChain', {
        id: ROFL_PAYMASTER_DESTINATION_CHAIN.id,
        name: ROFL_PAYMASTER_DESTINATION_CHAIN.name,
      })
      setValue('destinationToken', {
        symbol: ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.symbol,
        contractAddress: '0xNATIVE',
      })
    }
  }, [setValue])

  useEffect(() => {
    const sourceChain = watchedValues.sourceChain
    if (!sourceChain?.id) {
      setSelectedChainTokens(null)
      setValue('sourceToken', { symbol: '', contractAddress: '' })
      return
    }

    const getTokensByChainId = async (chainId: number) => {
      try {
        const tokensByChainId = ROFL_PAYMASTER_TOKEN_CONFIG[chainId].TOKENS

        const tokensWithBalance: TokenWithBalance[] = tokensByChainId.map(token => ({
          ...token,
          balance: null,
          isLoadingBalance: true,
        }))

        setSelectedChainTokens(tokensWithBalance)

        for (let i = 0; i < tokensWithBalance.length; i++) {
          const token = tokensWithBalance[i]
          try {
            const balance = await getErc20Balance(token.contractAddress, address!, chainId)

            setSelectedChainTokens(
              prev =>
                prev?.map(t =>
                  t.contractAddress === token.contractAddress
                    ? { ...t, balance, isLoadingBalance: false }
                    : t,
                ) || null,
            )
          } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error)
          }
        }
      } catch (error) {
        console.error('Error fetching tokens:', error)
        setSelectedChainTokens(null)
      }
    }

    getTokensByChainId(sourceChain.id)
  }, [watchedValues.sourceChain, setValue, address])

  useEffect(() => {
    const { sourceChain, sourceToken, amount, destinationChain, destinationToken } = watchedValues

    setQuote(null)
    setTopUpError('')

    if (
      !sourceChain?.id ||
      !sourceToken?.symbol ||
      !amount ||
      !destinationChain?.id ||
      !destinationToken?.symbol
    ) {
      return
    }

    if (!NumberUtils.isValidAmount(amount)) {
      return
    }

    const fetchQuote = async () => {
      setIsLoading(true)
      try {
        const selectedSourceToken = selectedChainTokens?.find(token => token.symbol === sourceToken.symbol)

        if (!selectedSourceToken) {
          console.error('Source token not found')
          return
        }

        const expandedAmount = BigInt(NumberUtils.expandAmount(amount, selectedSourceToken.decimals))

        const quoteResponse = await getQuote(
          selectedSourceToken.contractAddress,
          expandedAmount,
          ROFL_PAYMASTER_DESTINATION_CHAIN,
        )

        setQuote(quoteResponse)
      } catch (error) {
        setQuote(null)
        setTopUpError((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchQuote, 1000)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedValues.sourceChain.id,
    watchedValues.sourceToken.symbol,
    watchedValues.amount,
    watchedValues.destinationChain.id,
    watchedValues.destinationToken.symbol,
    selectedChainTokens,
    getQuote,
  ])

  const handleChainSelect = (chain: Chain) => {
    setValue('sourceChain', { id: chain.id, name: chain.name })

    setSelectedChainTokens(null)
    setValue('sourceToken', { symbol: '', contractAddress: '' })
    setValue('amount', '0')
    setQuote(null)
  }

  const handleTokenSelect = (token: TokenWithBalance) => {
    setValue('sourceToken', { symbol: token.symbol, contractAddress: token.contractAddress })

    setValue('amount', '0')
    setQuote(null)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = FormatUtils.formatNumberInput(e.target.value)
    setValue('amount', formatted)
  }

  const handleMaxClick = () => {
    const selectedToken = selectedChainTokens?.find(
      token => token.symbol === watchedValues.sourceToken?.symbol,
    )
    if (selectedToken?.balance) {
      setValue('amount', selectedToken.balance.formatted)
    }
  }

  const onSubmit: SubmitHandler<BridgeFormData> = async (
    formData: BridgeFormData,
    e?: React.BaseSyntheticEvent,
  ) => {
    e?.preventDefault()

    if (!quote) return

    setIsLoading(true)
    setTopUpError('')

    const tokenWithBalance = selectedChainTokens!.find(({ contractAddress }) => contractAddress)!
    try {
      // Step 1: Chain validation and switching
      setCurrentStep(1)
      updateStepStatus(1, 'processing')
      const switchToSource = await switchToChain({
        targetChainId: formData.sourceChain.id!,
        address,
      })

      if (!switchToSource.success) {
        throw new Error(switchToSource.error)
      }
      updateStepStatus(1, 'completed')

      // Step 2: Token allowance approval
      setCurrentStep(2)
      updateStepStatus(2, 'processing')

      await checkAndSetErc20Allowance(
        formData.sourceToken.contractAddress as `0x${string}`,
        ROFL_PAYMASTER_TOKEN_CONFIG[formData.sourceChain.id!].paymasterContractAddress,
        BigInt(NumberUtils.expandAmount(formData.amount, tokenWithBalance.decimals)),
        address as `0x${string}`,
      )
      updateStepStatus(2, 'completed')

      // Step 3: Execute cross-chain transaction
      setCurrentStep(3)
      updateStepStatus(3, 'processing')

      const { paymentId } = await createDeposit(
        formData.sourceToken.contractAddress as `0x${string}`,
        BigInt(NumberUtils.expandAmount(formData.amount, tokenWithBalance.decimals)),
        address as `0x${string}`,
        formData.sourceChain.id!,
      )
      updateStepStatus(3, 'completed')

      // Step 4: Monitor payout completion
      setCurrentStep(4)
      updateStepStatus(4, 'processing')

      await pollPayment(paymentId, ROFL_PAYMASTER_DESTINATION_CHAIN)
      updateStepStatus(4, 'completed')

      // Step 5: Switch back to app chain
      setCurrentStep(5)
      updateStepStatus(5, 'processing')

      const switchToAppChain = await switchToChain({
        targetChainId: sapphireTestnet.id,
        address,
      })

      if (!switchToAppChain.success) {
        console.error(switchToAppChain.error)
        updateStepStatus(5, 'error')
        openChainModal?.()
      } else {
        updateStepStatus(5, 'completed')
      }

      setCurrentStep(null)
      onTopUpSuccess?.()
    } catch (error) {
      console.error('Topup transaction failed:', error)
      if (currentStep) {
        updateStepStatus(currentStep, 'error')
      }

      setTopUpError((error as Error).message)
      onTopUpError?.(error as Error)
      setCurrentStep(null)
    } finally {
      const switchToAppChainResult = await switchToChain({
        targetChainId: sapphireTestnet.id,
        address,
      })

      if (!switchToAppChainResult.success) {
        console.error(switchToAppChainResult.error)
        openChainModal?.()
      }

      setIsLoading(false)
    }
  }

  const lastValidProgressStepsRef = useRef<ProgressStep[] | null>(null)

  const progressSteps = useMemo(() => {
    if (!quote) {
      return lastValidProgressStepsRef.current || []
    }

    const steps = [
      {
        id: 1,
        label: 'Validating chain connection',
        description: 'Ensuring wallet is connected to correct blockchain network',
      },
      {
        id: 2,
        label: 'Approving token spend',
        description: 'Granting permission to smart contract for token transfer',
      },
      {
        id: 3,
        label: 'Executing bridge transaction',
        description: 'Initiating cross-chain token transfer',
      },
      {
        id: 4,
        label: 'Confirming completion',
        description: 'Monitoring transaction until tokens arrive on destination chain',
        expectedTimeInSeconds: ROFL_PAYMASTER_EXPECTED_TIME,
      },
      {
        id: 5,
        label: 'Validating chain connection',
        description: 'Ensuring wallet is connected to correct blockchain network',
      },
    ]

    lastValidProgressStepsRef.current = steps

    return steps
  }, [quote])

  return (
    <div className={`${classes.topUp} flex w-full h-full justify-center items-center`}>
      <div className="flex flex-col w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          <div className="space-y-3">
            <p className="block text-sm font-medium text-foreground">
              Swap to ${ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.symbol} from
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-10">
                  <div className="flex items-center gap-2">
                    {watchedValues.sourceChain?.id && <TokenLogo chainId={watchedValues.sourceChain.id} />}
                    <span className="text-sm font-medium">
                      {watchedValues.sourceChain?.name || 'Select Chain'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="w-[384px]">
                {ROFL_PAYMASTER_ENABLED_CHAINS?.filter(
                  chain => chain.id !== (ROFL_PAYMASTER_DESTINATION_CHAIN.id as number),
                ).map(chain => (
                  <DropdownMenuItem
                    key={chain.id}
                    onClick={() => handleChainSelect(chain)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <TokenLogo chainId={chain?.id} />
                    <span className="text-sm font-medium">{chain.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.sourceChain && <p className="text-xs text-error">{errors.sourceChain.message}</p>}
            <div className="flex">
              <div className="w-full relative">
                <Input
                  placeholder="0"
                  className="rounded-r-none h-10 pr-12"
                  value={watchedValues.amount}
                  onChange={handleAmountChange}
                  disabled={!watchedValues.sourceToken?.symbol}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 text-xs"
                  onClick={handleMaxClick}
                  disabled={!currentMaxAmount}
                >
                  MAX
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex justify-between items-center h-10 px-4 py-2 rounded-r-md rounded-l-none border-l-0 w-[128px]"
                    disabled={!watchedValues.sourceChain?.id}
                  >
                    <div className="flex items-center gap-2">
                      {(() => {
                        const selectedToken = selectedChainTokens?.find(
                          t => t.symbol === watchedValues.sourceToken?.symbol,
                        )

                        return (
                          <>
                            {selectedToken && <TokenLogo token={selectedToken} />}
                            <span
                              className={`${watchedValues.sourceToken?.symbol ? 'uppercase ' : ' '}text-foreground text-sm font-medium`}
                            >
                              {watchedValues.sourceToken?.symbol || 'Token'}
                            </span>
                          </>
                        )
                      })()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" className="w-[384px]">
                  {selectedChainTokens?.map(token => (
                    <DropdownMenuItem
                      key={token.symbol}
                      onClick={() => handleTokenSelect(token)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <TokenLogo token={token} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium uppercase">{token.symbol}</span>
                          <span className="text-xs text-muted-foreground">
                            {FormatUtils.formatBalance(token.balance, token.isLoadingBalance)}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {errors.amount && <p className="text-xs text-error">{errors.amount.message}</p>}
            {errors.sourceToken && <p className="text-xs text-error">{errors.sourceToken.message}</p>}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">You will receive</p>
            <div className="flex">
              <div className="w-full">
                <Input
                  className="rounded-r-none h-10 pointer-events-none"
                  placeholder="0"
                  value={NumberUtils.formatTokenAmount((quote ?? 0n).toString(), 18)}
                  disabled
                />
              </div>
              <Button
                variant="outline"
                className="flex justify-start rounded-l-none h-10 w-[128px] px-3 cursor-default"
              >
                <div className="flex items-center gap-2">
                  <TokenLogo token={ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN ?? undefined} />
                  <span className="text-foreground text-sm font-medium uppercase">
                    {ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.symbol}
                  </span>
                </div>
              </Button>
            </div>
            {errors.destinationToken && (
              <p className="text-xs text-error">{errors.destinationToken.message}</p>
            )}
          </div>

          {topUpError && (
            <p className="text-xs text-error break-words">
              {topUpError.length > 150 ? `${topUpError.slice(0, 150)}...` : topUpError}
            </p>
          )}

          <TransactionSummary
            quote={quote}
            isLoading={isLoading}
            selectedChain={ROFL_PAYMASTER_ENABLED_CHAINS.find(
              ({ id }) => id === watchedValues.sourceChain?.id,
            )}
          />
          {children?.({
            isValid: isFormValid && !!quote && !isLoading,
          })}
        </form>
      </div>

      <TopUpProgressDialog
        isOpen={currentStep !== null}
        currentStep={currentStep}
        stepStatuses={stepStatuses}
        progressSteps={progressSteps}
        onClose={() => {
          setCurrentStep(null)
          setStepStatuses({})
        }}
      />
    </div>
  )
}

export const TopUp: FC<TopUpProps> = props => {
  const network = useNetwork()

  if (network === 'mainnet') {
    return (
      <>
        <TopUpInitializationFailed />
        {/* Fallback navigation */}
        {props.children?.({ isValid: false })}
      </>
    )
  }

  if (network === 'testnet' && !VITE_FEATURE_FLAG_PAYMASTER) {
    return <FaucetInfo />
  }

  return (
    <RoflPaymasterContextProvider>
      <TopUpCmp {...props} minAmount={props.minAmount ?? new BigNumber(0)} />
    </RoflPaymasterContextProvider>
  )
}
