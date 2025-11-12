import { type FC, useEffect } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { NumberUtils } from '../../utils/number.utils.ts'
import { TopUp } from '../../components/top-up/TopUp'
import { PaymentCostBreakdown } from './PaymentCostBreakdown.tsx'
import { Spinner } from '../../components/Spinner'
import { BigNumber } from 'bignumber.js'
import { type AppData } from './types'
import { fromBaseUnits } from '../../utils/number-utils'
import { useNetwork } from '../../hooks/useNetwork.ts'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { useTicker } from '../../hooks/useTicker'
import { useBlockNavigatingAway } from './useBlockNavigatingAway.ts'

type PaymentStepProps = {
  handleNext: () => void
  handleBack: () => void
  selectedTemplateName?: string
  selectedTemplateId?: string
  appData?: AppData
  customStepTitle: string
}

export const PaymentStep: FC<PaymentStepProps> = ({
  handleNext,
  handleBack,
  selectedTemplateName,
  selectedTemplateId,
  appData,
  customStepTitle,
}) => {
  const { address } = useAccount()
  const network = useNetwork()
  const currentChainId = useChainId()
  const canNavigateAway = currentChainId === sapphire.id || currentChainId === sapphireTestnet.id
  const isTestnet = network === 'testnet'
  const chain = isTestnet ? sapphireTestnet : sapphire
  const ticker = useTicker()
  const {
    data: sapphireBalance,
    isLoading,
    refetch,
  } = useBalance({
    chainId: chain.id,
    address,
  })
  const buildCost = appData?.build?.roseCostInBaseUnits
  const appCost = NumberUtils.expandAmount('100')
  const feeCost = NumberUtils.expandAmount('1')
  const amountRequired = NumberUtils.add(
    NumberUtils.add(buildCost!, appCost /*Add 100 $ROSE for app cost*/),
    feeCost /*Add 1 $ROSE for gas fees*/,
  )
  const hasEnoughBalance =
    sapphireBalance && amountRequired
      ? NumberUtils.isGreaterThan(sapphireBalance.value.toString(), amountRequired.toString())
      : false
  const minAmount =
    hasEnoughBalance || !sapphireBalance || !amountRequired
      ? null
      : BigNumber(amountRequired).minus(sapphireBalance.value)

  const { blockNavigatingAway, allowNavigatingAway } = useBlockNavigatingAway()

  useEffect(() => {
    if (canNavigateAway) {
      allowNavigatingAway()
    } else {
      blockNavigatingAway()
    }
  }, [allowNavigatingAway, blockNavigatingAway, canNavigateAway])

  return (
    <CreateLayout
      currentStep={4}
      selectedTemplateName={selectedTemplateName}
      selectedTemplateId={selectedTemplateId}
      customStepTitle={customStepTitle}
    >
      <CreateFormHeader
        title="Payment"
        description={
          <>
            Registration fees are refundable if you delete your app.
            <br /> Machine rental costs are non-refundable.
          </>
        }
      />
      {isLoading && <Spinner />}
      {sapphireBalance && (
        <PaymentCostBreakdown
          appCost={`${fromBaseUnits(appCost)} ${ticker}`}
          deployCost={
            appData?.build?.roseCostInBaseUnits
              ? `${fromBaseUnits(appData.build.roseCostInBaseUnits)} ${ticker}`
              : '-'
          }
          transactionFee={`~${fromBaseUnits(feeCost)} ${ticker}`}
          total={amountRequired ? `~${fromBaseUnits(amountRequired)} ${ticker}` : '-'}
          hasEnoughBalance={hasEnoughBalance}
          availableAmount={NumberUtils.formatTokenAmountWithSymbol(
            sapphireBalance.value.toString(),
            sapphireBalance.decimals,
            sapphireBalance.symbol,
          )}
        />
      )}
      {!hasEnoughBalance && minAmount && (
        <p className="text-sm text-foreground font-semibold text-center my-4">
          You need more ROSE to complete this process.
          <br />
          Top up your wallet below.
        </p>
      )}
      {!hasEnoughBalance && minAmount && (
        <TopUp minAmount={minAmount} onTopUpSuccess={refetch} onTopUpError={() => refetch()}>
          {({ isValid }) => (
            <>
              <CreateFormNavigation
                handleBack={() => {
                  if (canNavigateAway) {
                    handleBack()
                  }
                }}
                disabled={!isValid}
              />
              {!canNavigateAway && (
                <p className="text-xs text-error py-2">
                  Before navigating away, manually switch the chain to {sapphire.name} in your wallet.
                </p>
              )}
            </>
          )}
        </TopUp>
      )}

      {import.meta.env.PROD && isTestnet && (
        <div className="text-sm text-destructive mt-4 text-pretty">
          Functionality is currently blocked on the Oasis Sapphire Testnet. To build and deploy your
          application, please switch to Mainnet.
        </div>
      )}

      {(hasEnoughBalance || isTestnet) && (
        <form onSubmit={handleNext} className="w-full">
          <CreateFormNavigation
            handleBack={() => {
              if (canNavigateAway) {
                handleBack()
              }
            }}
            disabled={(import.meta.env.PROD && isTestnet) || !hasEnoughBalance || !canNavigateAway}
          />
          {!canNavigateAway && (
            <p className="text-xs text-error py-2">
              Before navigating away, manually switch the chain to {sapphire.name} in your wallet.
            </p>
          )}
        </form>
      )}
    </CreateLayout>
  )
}
