import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { useAccount, useBalance } from 'wagmi'
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

type AgentStepProps = {
  handleNext: () => void
  handleBack: () => void
  selectedTemplateName?: string
  appData?: AppData
}

export const PaymentStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  selectedTemplateName,
  appData,
}) => {
  const { address } = useAccount()
  const network = useNetwork()
  const isTestnet = network === 'testnet'
  const chain = network === 'mainnet' ? sapphire : sapphireTestnet
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

  const handleTopUpSuccess = () => {
    refetch()
  }

  return (
    <CreateLayout
      currentStep={4}
      hints={[
        {
          title: 'Tips and Tricks',
          description:
            'Ultricies convallis urna habitant blandit risus ultrices facilisi donec. Bibendum semper convallis sit tellus tincidunt tincidunt.',
        },
      ]}
      selectedTemplateName={selectedTemplateName}
    >
      <CreateFormHeader
        title="Payment"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
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
          total={amountRequired ? `${fromBaseUnits(amountRequired)} ${ticker}` : '-'}
          availableAmount={
            !hasEnoughBalance
              ? NumberUtils.formatTokenAmountWithSymbol(sapphireBalance.value.toString())
              : undefined
          }
        />
      )}
      {!hasEnoughBalance && minAmount && (
        <TopUp minAmount={minAmount} onTopUpSuccess={handleTopUpSuccess}>
          {({ isValid, onSubmit }) => (
            <CreateFormNavigation handleNext={onSubmit} handleBack={handleBack} disabled={!isValid} />
          )}
        </TopUp>
      )}
      {(hasEnoughBalance || isTestnet) && (
        <CreateFormNavigation
          handleNext={handleNext}
          handleBack={handleBack}
          disabled={import.meta.env.PROD && isTestnet}
        />
      )}
    </CreateLayout>
  )
}
