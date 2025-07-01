import { type FC, useMemo } from 'react'
import { useNetwork } from '../../../hooks/useNetwork'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGetRuntimeRoflmarketProvidersAddressInstancesId } from '../../../nexus/generated/api'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton.tsx'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { trimLongString } from '../../../utils/trimLongString.ts'
import { BuildForm } from '../../../components/BuildForm'
import { CreateFormNavigation } from '../../CreateApp/CreateFormNavigation.tsx'
import { useMachineTopUp } from '../../../backend/api.ts'
import { useAccount, useBalance } from 'wagmi'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { NumberUtils } from '../../../utils/number.utils.ts'
import { BigNumber } from 'bignumber.js'
import { TopUp } from '../../../components/top-up/TopUp'
import { Spinner } from '../../../components/Spinner'
import { defaultBuildConfig } from '../../CreateApp/templates.tsx'

export const MachineTopUp: FC = () => {
  const navigate = useNavigate()
  const network = useNetwork()
  const { provider, id } = useParams()
  // TODO: Refactor, join with MachineDetails/index.tsx state into a provider
  const roflMachinesQuery = useGetRuntimeRoflmarketProvidersAddressInstancesId(
    network,
    'sapphire',
    provider!,
    id!,
  )
  const { data, isLoading, isFetched } = roflMachinesQuery
  const machine = data?.data
  const machineTitle = (
    <>{machine?.metadata?.['net.oasis.provider.name'] || trimLongString(machine?.provider ?? '') || ''}</>
  )
  const machineTopUp = useMachineTopUp()

  const { address } = useAccount()
  const isTestnet = network === 'testnet'
  const chain = isTestnet ? sapphireTestnet : sapphire
  const {
    data: sapphireBalance,
    isLoading: isSapphireBalanceLoading,
    refetch: refetchSapphireBalance,
  } = useBalance({
    chainId: chain.id,
    address,
  })

  const buildConfig = useMemo(
    () => ({
      ...defaultBuildConfig,
      provider: provider ?? '',
    }),
    [provider],
  )

  const handleBack = () => {
    navigate(`/dashboard/machines/${machine!.provider}/instances/${machine!.id}`)
  }

  const handleTopUpSuccess = () => {
    refetchSapphireBalance()
  }

  return (
    <div>
      <div className="flex pl-6 pt-6 pr-3">
        <Button variant="ghost" className="flex items-center gap-2 !p-0 h-auto" asChild>
          <Link to="../">
            <ChevronLeft className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Back to {machineTitle} details</span>
          </Link>
        </Button>
      </div>
      {isLoading && <Skeleton className="w-full h-[36px]" />}
      {isFetched && (
        <div className="py-6 px-6">
          <div className="flex flex-col">
            <div className="flex flex-col items-start gap-2 max-w-md">
              <h1 className="text-2xl font-semibold text-foreground">Top up {machineTitle}</h1>
              <p className="text-sm text-muted-foreground">
                At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices
                egestas. Bibendum sed integer ac eget.
              </p>
              <BuildForm
                build={buildConfig}
                offerId={machine!.offer_id}
                onSubmit={async build => {
                  await machineTopUp.mutateAsync({
                    machineId: machine!.id,
                    provider: provider!,
                    network,
                    build,
                  })
                  handleBack()
                }}
              >
                {({ form, handleFormSubmit, noOffersWarning }) => {
                  const buildCost = form.getValues('roseCostInBaseUnits')

                  const hasEnoughBalance =
                    sapphireBalance && buildCost
                      ? NumberUtils.isGreaterThan(sapphireBalance.value.toString(), buildCost.toString())
                      : false
                  const minAmount =
                    hasEnoughBalance || !sapphireBalance || !buildCost
                      ? null
                      : BigNumber(buildCost).minus(sapphireBalance.value)

                  if (!hasEnoughBalance && minAmount) {
                    return (
                      <>
                        {isSapphireBalanceLoading && <Spinner />}
                        <TopUp minAmount={minAmount} onTopUpSuccess={handleTopUpSuccess}>
                          {({ isValid, onSubmit }) => (
                            <CreateFormNavigation
                              handleNext={onSubmit}
                              handleBack={handleBack}
                              disabled={!isValid}
                            />
                          )}
                        </TopUp>
                      </>
                    )
                  }

                  return (
                    <>
                      <CreateFormNavigation
                        handleNext={handleFormSubmit}
                        handleBack={handleBack}
                        disabled={machineTopUp.isPending || noOffersWarning}
                        isLoading={machineTopUp.isPending}
                      />
                      {machineTopUp.isError && (
                        <p className="text-xs text-error break-all">{machineTopUp?.error.message}</p>
                      )}
                    </>
                  )
                }}
              </BuildForm>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
