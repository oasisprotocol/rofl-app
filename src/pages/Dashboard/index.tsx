import { useEffect, useState, type FC } from 'react'
import { MyAppsEmptyState } from '../../pages/Dashboard/MyApps/emptyState'
import { MachinesEmptyState } from '../../pages/Dashboard/Machines/emptyState'
import { MetricCard } from './MetricCard'
import { SectionHeader } from './SectionHeader'
import { useGetRuntimeRoflApps, useGetRuntimeRoflmarketInstances } from '../../nexus/api'
import { useNetwork } from '../../hooks/useNetwork'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { MachineCard } from '../../components/MachineCard'
import { useAccount } from 'wagmi'
import { DashboardAppsCards } from './DashboardAppCards'
import { MetadataFormData } from '../CreateApp/types'

const cardsLimit = 3
const refetchInterval = 10000 // 10 seconds

export const Dashboard: FC = () => {
  const network = useNetwork()
  const { address } = useAccount()
  const persistedPendingApps: {
    [address: string]: { [network: string]: { [key: string]: MetadataFormData } }
  } = JSON.parse(window.localStorage.getItem('pendingApps') || '{}')
  const [pendingApps, setPendingApps] = useState<{ [key: string]: MetadataFormData }>(
    address ? persistedPendingApps[address]?.[network] || {} : {},
  )
  const roflAppsQuery = useGetRuntimeRoflApps(
    network,
    'sapphire',
    {
      limit: 1000,
      offset: 0,
      admin: address,
    },
    {
      query: {
        queryKey: ['roflAppsPolling', network, address],
        refetchInterval: refetchInterval,
      },
    },
  )

  const roflMachinesQuery = useGetRuntimeRoflmarketInstances(
    network,
    'sapphire',
    {
      limit: 1000,
      offset: 0,
      admin: address,
    },
    {
      query: {
        queryKey: ['roflmachinePolling', network, address],
        refetchInterval: refetchInterval,
      },
    },
  )
  const { data, isLoading, isFetched } = roflAppsQuery
  const roflApps = data?.data.rofl_apps
  const { data: machinesData, isLoading: isMachinesLoading, isFetched: isMachinesFetched } = roflMachinesQuery
  const roflMachines = machinesData?.data.instances
  const appsNumber = data?.data.total_count
  const runningAppsNumber = roflApps?.filter(app => app.num_active_instances > 0).length || 0
  const machinesNumber = machinesData?.data.total_count
  const runningMachinesNumber = roflMachines?.filter(machine => !machine.removed).length || 0
  useEffect(() => {
    if (pendingApps && roflApps && address) {
      const roflAppIds = new Set(roflApps.map(app => app.id))
      const updatedPendingApps = { ...pendingApps }
      let hasChanges = false

      Object.keys(pendingApps).forEach(pendingAppId => {
        if (roflAppIds.has(pendingAppId)) {
          delete updatedPendingApps[pendingAppId]
          hasChanges = true
        }
      })

      if (hasChanges) {
        const updatedPersistedApps = {
          ...persistedPendingApps,
          [address]: {
            ...persistedPendingApps[address],
            [network]: updatedPendingApps,
          },
        }
        window.localStorage.setItem('pendingApps', JSON.stringify(updatedPersistedApps))
        setPendingApps(updatedPendingApps)
      }
    }
  }, [roflApps, pendingApps, network, persistedPendingApps, address])

  return (
    <>
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading && <Skeleton className="w-full h-[120px]" />}
          {isFetched && (
            <MetricCard
              title="Apps running"
              value={runningAppsNumber}
              isTotalCountClipped={data?.data.is_total_count_clipped}
            />
          )}
          {isMachinesLoading && <Skeleton className="w-full h-[120px]" />}
          {isMachinesFetched && (
            <MetricCard
              title="Machines running"
              value={runningMachinesNumber}
              isTotalCountClipped={machinesData?.data.is_total_count_clipped}
            />
          )}
        </div>
        <SectionHeader title="Apps" to="/dashboard/apps" disabled={appsNumber === 0} />
        {isFetched && !appsNumber && <MyAppsEmptyState />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading &&
            Array.from({ length: cardsLimit }).map((_, index) => (
              <Skeleton key={index} className="w-full h-[200px]" />
            ))}
          {isFetched && (
            <DashboardAppsCards
              pendingApps={pendingApps}
              roflApps={roflApps || []}
              cardsLimit={cardsLimit}
              network={network}
            />
          )}
        </div>
        <SectionHeader title="Machines" to="/dashboard/machines" disabled={machinesNumber === 0} />
        {isMachinesFetched && !machinesNumber && <MachinesEmptyState />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isMachinesLoading &&
            Array.from({ length: cardsLimit }).map((_, index) => (
              <Skeleton key={index} className="w-full h-[200px]" />
            ))}
          {isFetched &&
            roflMachines
              ?.slice(0, cardsLimit)
              .map(machine => <MachineCard key={machine.id} machine={machine} network={network} />)}
        </div>
      </div>
    </>
  )
}
