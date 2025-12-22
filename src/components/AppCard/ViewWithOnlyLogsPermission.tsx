import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { useGetRuntimeRoflmarketInstances, type RoflApp } from '../../nexus/api'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { useAccount } from 'wagmi'
import { hasViewLogsPermission } from '../../utils/hasViewLogsPermission'
import { isMachineRemoved } from '../MachineStatusIcon/isMachineRemoved'

type ViewWithOnlyLogsPermissionProps = {
  app: RoflApp
  network: 'mainnet' | 'testnet'
}

export const ViewWithOnlyLogsPermission: FC<ViewWithOnlyLogsPermissionProps> = ({ app, network }) => {
  const { address } = useAccount()
  const machinesQuery = useGetRuntimeRoflmarketInstances(network, 'sapphire', {
    limit: 100,
    offset: 0,
    deployed_app_id: app.id,
  })
  const machinesWithOnlyLogsPermission =
    address && machinesQuery.data?.data.instances
      ? machinesQuery.data.data.instances
          .filter(machine => !isMachineRemoved(machine))
          .filter(machine => hasViewLogsPermission(machine, address))
      : []

  if (machinesWithOnlyLogsPermission.length <= 0) return
  return (
    <div className="flex flex-col gap-2">
      {machinesWithOnlyLogsPermission.map(machine => (
        <Button key={machine.id} variant="default" asChild>
          {/* TODO: Link to logs subpage. But shadcn does not support routed tabs nicely. */}
          <Link to={`/dashboard/machines/${machine.provider}/instances/${machine.id}`}>View logs</Link>
        </Button>
      ))}
    </div>
  )
}
