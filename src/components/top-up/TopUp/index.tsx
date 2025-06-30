import { type FC, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Input } from '@oasisprotocol/ui-library/src/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { useRouterPathfinder } from '../../../contexts/top-up/useRouterPathfinder'
import { useNitroSwapAPI } from '../../../contexts/top-up/useNitroSwapAPI'
import type { Chain, Token } from '../../../types/top-up'
import { TokenLogo } from '../TokenLogo'
import { DESTINATION_CHAIN_ID } from '../../../constants/top-up-config'
import type { GetBalanceReturnType } from 'wagmi/actions'
import { useAccount, useChainId, useGasPrice } from 'wagmi'
import type { QuoteResponse } from '../../../backend/top-up'
import { NumberUtils } from '../../../utils/number.utils.ts'
import { FormatUtils } from '../../../utils/format.utils.ts'
import { checkAndSetErc20Allowance, getErc20Balance, switchToChain } from '../../../contracts/erc-20.ts'
import { RouterPathfinderContextProvider } from '../../../contexts/top-up/RouterPathfinderProvider.tsx'
import { NitroSwapAPIContextProvider } from '../../../contexts/top-up/NitroSwapAPIProvider.tsx'
import { Spinner } from '../../Spinner'
import { FaucetInfo } from '../FaucetInfo'
import { maxUint256 } from 'viem'
import { TopUpProgressDialog } from '../TopUpProgressDialog'
import { useNetwork } from '../../../hooks/useNetwork.ts'
import { sapphire, sapphireTestnet } from 'viem/chains'
import nitroBoltIcon from '../NitroBoltIcon.svg'

const bridgeFormSchema = z.object({
  sourceChain: z
    .object({
      chainId: z.string(),
      name: z.string(),
    })
    .refine(val => val.chainId !== '', {
      message: 'Source chain is required',
    }),
  sourceToken: z
    .object({
      symbol: z.string(),
      chainId: z.string(),
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
      chainId: z.string(),
      name: z.string(),
    })
    .refine(val => val.chainId !== '', {
      message: 'Destination chain is required',
    }),
  destinationToken: z
    .object({
      symbol: z.string(),
      chainId: z.string(),
    })
    .refine(val => val.symbol !== '', {
      message: 'Destination token is required',
    }),
})

type BridgeFormData = z.infer<typeof bridgeFormSchema>

interface TokenWithBalance extends Token {
  balance: GetBalanceReturnType | null
  isLoadingBalance?: boolean
}

interface TransactionSummaryProps {
  quote: QuoteResponse | null
  selectedChain?: Chain
  selectedChainNativeToken?: Token
  isLoading?: boolean
}

const TransactionSummary: FC<TransactionSummaryProps> = ({
  quote,
  isLoading,
  selectedChain,
  selectedChainNativeToken,
}) => {
  const { data: gasPrice, isLoading: isLoadingGasPrice } = useGasPrice({
    chainId: Number(selectedChain?.chainId),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start w-full">
        <span className="text-xs text-muted-foreground">Bridge Fee</span>
        <span className="text-xs text-card-foreground">
          {FormatUtils.formatLoadingState(isLoading, FormatUtils.formatTokenAmount(quote?.bridgeFee || null))}
        </span>
      </div>
      <div className="flex justify-between items-start w-full">
        <span className="text-xs text-muted-foreground">Gas Fee</span>
        <span className="text-xs text-card-foreground">
          {FormatUtils.formatLoadingState(
            isLoading || isLoadingGasPrice,
            FormatUtils.formatGasFee(
              quote,
              selectedChain || null,
              selectedChainNativeToken || null,
              gasPrice,
            ),
          )}
        </span>
      </div>
      <div className="flex justify-between items-start w-full">
        <span className="text-xs text-muted-foreground">Est. Time</span>
        <span className="text-xs text-card-foreground">
          {FormatUtils.formatLoadingState(
            isLoading,
            quote?.estimatedTime ? FormatUtils.formatTime(quote.estimatedTime) : '-/-',
          )}
        </span>
      </div>
    </div>
  )
}

const progressSteps = [
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
  },
]

interface TopUpProps {
  minAmount: BigNumber
  onValidChange?: (isValid: boolean) => void
  onTopUpSuccess?: () => void
  onTopUpError?: (error: Error) => void
  children?: (props: { isValid: boolean; onSubmit: (e?: FormEvent<HTMLFormElement>) => void }) => ReactNode
}

const TopUpCmp: FC<TopUpProps> = ({ children, minAmount, onValidChange, onTopUpSuccess, onTopUpError }) => {
  const { address } = useAccount()
  const currentChainId = useChainId()
  const network = useNetwork()
  const appChain = network === 'mainnet' ? sapphire : sapphireTestnet
  const {
    state: { chains, nativeTokens },
    getToken,
  } = useNitroSwapAPI()
  const { getQuote, executeTransaction, pollStatus } = useRouterPathfinder()

  const [selectedChainTokens, setSelectedChainTokens] = useState<TokenWithBalance[] | null>(null)
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
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

  const destinationChain = chains?.find(chain => chain.chainId === DESTINATION_CHAIN_ID)
  const destinationToken = nativeTokens?.find(token => token.chainId === DESTINATION_CHAIN_ID)

  const form = useForm<BridgeFormData>({
    resolver: zodResolver(bridgeFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      sourceChain: { chainId: '', name: '' },
      sourceToken: { symbol: '', chainId: '' },
      amount: '',
      destinationChain: destinationChain
        ? { chainId: destinationChain.chainId, name: destinationChain.name }
        : { chainId: '', name: '' },
      destinationToken: destinationToken
        ? { symbol: destinationToken.symbol, chainId: destinationToken.chainId }
        : { symbol: '', chainId: '' },
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
    if (quote?.destination) {
      if (NumberUtils.isLessThan(quote.destination.tokenAmount, minAmount.toString())) {
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
    if (destinationChain && destinationToken) {
      setValue('destinationChain', {
        chainId: destinationChain.chainId,
        name: destinationChain.name,
      })
      setValue('destinationToken', {
        symbol: destinationToken.symbol,
        chainId: destinationToken.chainId,
      })
    }
  }, [destinationChain, destinationToken, setValue])

  useEffect(() => {
    const sourceChain = watchedValues.sourceChain
    if (!sourceChain?.chainId) {
      setSelectedChainTokens(null)
      setValue('sourceToken', { symbol: '', chainId: '' })
      return
    }

    const getTokensByChainId = async () => {
      try {
        const { data } = await getToken({
          chainId: sourceChain.chainId,
          isReserved: true,
        })

        const tokensWithBalance: TokenWithBalance[] = data.map(token => ({
          ...token,
          balance: null,
          isLoadingBalance: true,
        }))

        setSelectedChainTokens(tokensWithBalance)

        for (let i = 0; i < tokensWithBalance.length; i++) {
          const token = tokensWithBalance[i]
          try {
            const balance = await getErc20Balance(
              token.address as `0x${string}`,
              address!,
              Number(token.chainId),
            )

            setSelectedChainTokens(
              prev =>
                prev?.map(t =>
                  t.address === token.address ? { ...t, balance, isLoadingBalance: false } : t,
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

    getTokensByChainId()
  }, [watchedValues.sourceChain.chainId, getToken, setValue, watchedValues.sourceChain, address])

  useEffect(() => {
    const { sourceChain, sourceToken, amount, destinationChain, destinationToken } = watchedValues

    setQuote(null)
    setTopUpError('')

    if (
      !sourceChain?.chainId ||
      !sourceToken?.symbol ||
      !amount ||
      !destinationChain?.chainId ||
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

        const selectedDestinationToken = destinationToken
          ? nativeTokens?.find(
              token => token.symbol === destinationToken.symbol && token.chainId === destinationChain.chainId,
            )
          : null

        if (!selectedDestinationToken) {
          console.error('Destination token not found')
          return
        }

        const expandedAmount = NumberUtils.expandAmount(amount)

        const quoteResponse = await getQuote({
          fromTokenChainId: sourceChain.chainId,
          fromTokenAddress: selectedSourceToken.address,
          toTokenChainId: destinationChain.chainId,
          toTokenAddress: selectedDestinationToken.address,
          amount: expandedAmount,
          slippageTolerance: 2,
          destFuel: 0,
        })

        setQuote(quoteResponse)
      } catch (error) {
        setQuote(null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTopUpError((error as any).error.error)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchQuote, 1000)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedValues.sourceChain.chainId,
    watchedValues.sourceToken.symbol,
    watchedValues.amount,
    watchedValues.destinationChain.chainId,
    watchedValues.destinationToken.symbol,
    selectedChainTokens,
    nativeTokens,
    getQuote,
  ])

  const handleChainSelect = (chain: Chain) => {
    setValue('sourceChain', { chainId: chain.chainId, name: chain.name })

    setSelectedChainTokens(null)
    setValue('sourceToken', { symbol: '', chainId: '' })
    setValue('amount', '0')
    setQuote(null)
  }

  const handleTokenSelect = (token: TokenWithBalance) => {
    setValue('sourceToken', { symbol: token.symbol, chainId: token.chainId })

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

  const onSubmit = async () => {
    if (!quote) return

    setIsLoading(true)
    setTopUpError('')
    try {
      setCurrentStep(1)

      // Step 1: Chain validation and switching
      updateStepStatus(1, 'processing')
      const switchToSource = await switchToChain({
        targetChainId: Number(quote.source?.chainId ?? '0'),
        currentChainId,
        address,
      })

      if (!switchToSource.success) {
        throw new Error(switchToSource.error)
      }
      updateStepStatus(1, 'completed')

      setCurrentStep(2)

      // Step 2: Token allowance approval
      updateStepStatus(2, 'processing')
      await checkAndSetErc20Allowance(
        quote.source!.asset.address as `0x${string}`,
        quote.allowanceTo! as `0x${string}`,
        maxUint256,
        address as `0x${string}`,
      )
      updateStepStatus(2, 'completed')
      setCurrentStep(3)

      // Step 3: Execute cross-chain transaction
      updateStepStatus(3, 'processing')
      const txHash = await executeTransaction(quote)
      updateStepStatus(3, 'completed')
      setCurrentStep(4)

      // Step 4: Monitor transaction completion
      updateStepStatus(4, 'processing')
      await pollStatus({ srcTxHash: txHash })
      updateStepStatus(4, 'completed')
      setCurrentStep(null)

      // Step 5: Switch back to app chain
      const switchToAppChain = await switchToChain({
        targetChainId: appChain.id,
        currentChainId,
        address,
      })

      if (!switchToAppChain.success) {
        throw new Error(switchToAppChain.error)
      }

      onTopUpSuccess?.()
    } catch (error) {
      console.error('Topup transaction failed:', error)
      if (currentStep) {
        updateStepStatus(currentStep, 'error')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTopUpError((error as any).message)
      onTopUpError?.(error as Error)
      setCurrentStep(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="flex w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          <div className="space-y-2">
            <div className="space-y-6">
              <div className="space-y-2 rounded">
                <div className="space-y-2">
                  <div className="space-y-3">
                    <p className="block text-sm font-medium text-foreground">Swap to $ROSE from</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between h-10">
                        <div className="flex items-center gap-2">
                          {watchedValues.sourceChain?.chainId && (
                            <TokenLogo chainId={watchedValues.sourceChain.chainId} />
                          )}
                          <span className="text-sm font-medium">
                            {watchedValues.sourceChain?.name || 'Select Chain'}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom" className="w-[384px]">
                      {chains
                        ?.filter(chain => chain.chainId !== DESTINATION_CHAIN_ID)
                        .map(chain => (
                          <DropdownMenuItem
                            key={chain.chainId}
                            onClick={() => handleChainSelect(chain)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <TokenLogo chainId={chain?.chainId} />
                            <span className="text-sm font-medium">{chain.name}</span>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.sourceChain && <p className="text-xs text-red-500">{errors.sourceChain.message}</p>}

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
                          disabled={!watchedValues.sourceChain?.chainId}
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
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                  {errors.sourceToken && <p className="text-xs text-red-500">{errors.sourceToken.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded">
              <div className="space-y-2">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">You will receive</p>
                </div>
              </div>
              <div className="flex">
                <div className="w-full">
                  <Input
                    className="rounded-r-none h-10 pointer-events-none"
                    placeholder="0"
                    value={FormatUtils.formatDestinationAmount(quote)}
                    disabled
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex justify-start rounded-l-none h-10 w-[128px] px-3 cursor-default"
                >
                  <div className="flex items-center gap-2">
                    <TokenLogo token={destinationToken ?? undefined} />
                    <span className="text-foreground text-sm font-medium uppercase">
                      {destinationToken?.symbol}
                    </span>
                  </div>
                </Button>
              </div>
              {errors.destinationToken && (
                <p className="text-xs text-red-500">{errors.destinationToken.message}</p>
              )}
            </div>
          </div>

          {topUpError && (
            <p className="text-xs text-red-500 break-words">
              {topUpError.length > 150 ? `${topUpError.slice(0, 150)}...` : topUpError}
            </p>
          )}

          <TransactionSummary
            quote={quote}
            isLoading={isLoading}
            selectedChain={chains?.find(chain => chain.chainId === watchedValues.sourceChain?.chainId)}
            selectedChainNativeToken={nativeTokens?.find(token => token.chainId)}
          />

          <div className="flex items-center justify-center gap-0.5">
            <p className="text-xs font-medium text-foreground leading-4">Powered by</p>
            <div className="w-4 h-4">
              <img src={nitroBoltIcon} alt="Router Nitro" className="h-4 w-4 mx-auto" />
            </div>
            <p className="text-xs font-medium text-foreground leading-4">Router Nitro</p>
          </div>

          {children?.({
            isValid: isFormValid && !!quote && !isLoading,
            onSubmit,
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

const TopUpLoading: FC<TopUpProps> = props => {
  const { isLoading } = useNitroSwapAPI()

  if (!isLoading) {
    return <TopUpCmp {...props} />
  }

  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="flex mx-auto">
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-foreground" />
        </div>
      </div>
    </div>
  )
}

export const TopUp: FC<TopUpProps> = props => {
  const network = useNetwork()

  if (network === 'testnet') {
    return <FaucetInfo />
  }

  return (
    <NitroSwapAPIContextProvider>
      <RouterPathfinderContextProvider>
        <TopUpLoading {...props} />
      </RouterPathfinderContextProvider>
    </NitroSwapAPIContextProvider>
  )
}
