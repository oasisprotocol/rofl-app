import { type FC, useCallback, useEffect, useMemo } from 'react'
import { useNetwork } from '../../../hooks/useNetwork'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetRuntimeRoflmarketProvidersAddressInstancesId } from '../../../nexus/generated/api'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton.tsx'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { trimLongString } from '../../../utils/trimLongString.ts'
import { BuildForm } from '../../../components/BuildForm'
import { CreateFormNavigation } from '../../CreateApp/CreateFormNavigation.tsx'
import { useMachineTopUp } from '../../../backend/api.ts'
import { BaseError, useAccount, useBalance, useChainId } from 'wagmi'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { NumberUtils } from '../../../utils/number.utils.ts'
import { BigNumber } from 'bignumber.js'
import { TopUp } from '../../../components/rofl-paymaster/TopUp'
import { Spinner } from '../../../components/Spinner'
import { defaultBuildConfig } from '../../CreateApp/templates.tsx'
import { useBlockNavigatingAway } from '../../CreateApp/useBlockNavigatingAway.ts'
import { machineDetailsPath } from '../../paths.ts'

export const MachineTopUp: FC = () => {
  const navigate = useNavigate()
  const network = useNetwork()
  const currentChainId = useChainId()
  const canNavigateAway = currentChainId === sapphire.id || currentChainId === sapphireTestnet.id
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

  const { blockNavigatingAway, allowNavigatingAway } = useBlockNavigatingAway()

  useEffect(() => {
    if (canNavigateAway) {
      allowNavigatingAway()
    } else {
      blockNavigatingAway()
    }
  }, [allowNavigatingAway, blockNavigatingAway, canNavigateAway])

  const handleBack = useCallback(() => {
    if (canNavigateAway) {
      navigate(machineDetailsPath(machine!.provider, machine!.id))
    }
  }, [canNavigateAway, machine, navigate])

  const handleTopUpSuccess = () => {
    refetchSapphireBalance()
  }
  return (
    <div>
      <div className="flex pl-6 pt-6 pr-3">
        <Button variant="ghost" className="flex items-center gap-2 !p-0 h-auto" onClick={handleBack}>
          <>
            <ChevronLeft className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Back to {machineTitle} details</span>
          </>
        </Button>
      </div>
      {isLoading && <Skeleton className="w-full h-[36px]" />}
      {isFetched && (
        <div className="py-6 px-6">
          <div className="flex flex-col">
            <div className="flex flex-col items-start gap-2 max-w-md">
              <h1 className="text-2xl font-semibold text-foreground">Top up {machineTitle}</h1>
              <p className="text-sm text-muted-foreground mb-2">Machine rental costs are non-refundable.</p>
              <BuildForm
                build={buildConfig}
                offerId={machine!.offer_id}
                onSubmit={async build => {
                  const newOrOldMachineId = await machineTopUp.mutateAsync({
                    machine: machine!,
                    provider: provider!,
                    network,
                    build,
                  })
                  navigate(machineDetailsPath(machine!.provider, newOrOldMachineId))
                }}
              >
                {({ form, noOffersWarning }) => {
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
                          {({ isValid }) => (
                            <>
                              <CreateFormNavigation handleBack={handleBack} disabled={!isValid} />
                              {!canNavigateAway && (
                                <p className="text-xs text-error py-2">
                                  Before navigating away, manually switch the chain to {sapphire.name} in your
                                  wallet.
                                </p>
                              )}
                            </>
                          )}
                        </TopUp>
                      </>
                    )
                  }

                  return (
                    <>
                      <CreateFormNavigation
                        handleBack={handleBack}
                        disabled={machineTopUp.isPending || noOffersWarning}
                        isLoading={machineTopUp.isPending}
                      />
                      {!canNavigateAway && (
                        <p className="text-xs text-error py-2">
                          Before navigating away, manually switch the chain to {sapphire.name} in your wallet.
                        </p>
                      )}
                      {machineTopUp.isError && (
                        <p className="text-xs text-error break-all">
                          {(machineTopUp?.error as unknown as BaseError).shortMessage ??
                            machineTopUp?.error.message}
                        </p>
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
