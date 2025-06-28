import { type FC } from 'react'
import { MyAppsEmptyState } from '../../pages/Dashboard/MyApps/emptyState'
import { MachinesEmptyState } from '../../pages/Dashboard/Machines/emptyState'
import { MetricCard } from './MetricCard'
import { SectionHeader } from './SectionHeader'
import { useGetRuntimeRoflApps, useGetRuntimeRoflmarketInstances } from '../../nexus/api'
import { useNetwork } from '../../hooks/useNetwork'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { AppCard } from '../../components/AppCard'
import { MachineCard } from '../../components/MachineCard'
import { useAccount } from 'wagmi'

const cardsLimit = 3

export const Dashboard: FC = () => {
  const network = useNetwork()
  const { address } = useAccount()
  const roflAppsQuery = useGetRuntimeRoflApps(network, 'sapphire', {
    limit: 1000,
    offset: 0,
    admin: address,
  })

  const roflMachinesQuery = useGetRuntimeRoflmarketInstances(network, 'sapphire', {
    limit: 1000,
    offset: 0,
    admin: address,
  })
  const { data, isLoading, isFetched } = roflAppsQuery
  const roflApps = data?.data.rofl_apps
  const { data: machinesData, isLoading: isMachinesLoading, isFetched: isMachinesFetched } = roflMachinesQuery
  const roflMachines = machinesData?.data.instances
  const appsNumber = data?.data.total_count
  const runningAppsNumber = roflApps?.filter(app => app.num_active_instances > 0).length || 0
  const machinesNumber = machinesData?.data.total_count
  const runningMachinesNumber = roflMachines?.filter(machine => !machine.removed).length || 0

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
          {isFetched &&
            roflApps
              ?.slice(0, cardsLimit)
              .map(app => <AppCard key={app.id} app={app} network={network} type="dashboard" />)}
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
