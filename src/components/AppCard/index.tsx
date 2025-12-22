import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { useGetRuntimeRoflmarketInstances, type RoflApp } from '../../nexus/api'
import { Badge } from '@oasisprotocol/ui-library/src/components/ui/badge'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@oasisprotocol/ui-library/src/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import { AppStatusIcon } from '../AppStatusIcon'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { trimLongString } from '../../utils/trimLongString'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useAccount } from 'wagmi'
import { hasViewLogsPermission } from '../../utils/hasViewLogsPermission'
import { isMachineRemoved } from '../MachineStatusIcon/isMachineRemoved'

type AppCardProps = {
  app: RoflApp
  network: 'mainnet' | 'testnet'
  type?: 'explore' | 'dashboard'
}

export const AppCard: FC<AppCardProps> = ({ app, network, type }) => {
  const { address } = useAccount()
  const machinesQuery = useGetRuntimeRoflmarketInstances(network, 'sapphire', {
    limit: 100,
    offset: 0,
    deployed_app_id: app.id,
  })
  const machinesWithOnlyLogsPermission =
    type === 'explore' && address && machinesQuery.data?.data.instances
      ? machinesQuery.data.data.instances
          .filter(machine => !isMachineRemoved(machine))
          .filter(machine => hasViewLogsPermission(machine, address))
      : []

  return (
    <Card className="rounded-md">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <h3
            className={cn(
              'text-lg font-semibold text-foreground pr-2 break-all',
              type === 'dashboard' && 'text-primary',
            )}
          >
            {type === 'dashboard' && (
              <Link to={`/dashboard/apps/${app.id}`}>
                <>{app.metadata?.['net.oasis.rofl.name'] || trimLongString(app.id)}</>
              </Link>
            )}
            {type === 'explore' && <>{app.metadata?.['net.oasis.rofl.name'] || trimLongString(app.id)}</>}
          </h3>
          <AppStatusIcon hasActiveInstances={!!app.num_active_instances} removed={app.removed} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {type === 'explore' && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            <>{app.metadata?.['net.oasis.rofl.description']}</>
          </p>
        )}
        {type === 'dashboard' && (
          <div className="flex flex-col gap-2">
            <div>
              {!!app.metadata?.['net.oasis.rofl.version'] && (
                <Badge variant="secondary">
                  <>{app.metadata?.['net.oasis.rofl.version']}</>
                </Badge>
              )}{' '}
              <span className="text-xs">
                {formatDistanceToNow(parseISO(app.date_created), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <span className="text-xs text-muted-foreground break-all">{app.id}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between only:*:grow">
        {type === 'dashboard' && (
          <Button variant="secondary" asChild>
            <Link to={`/dashboard/apps/${app.id}`}>View details</Link>
          </Button>
        )}

        {machinesWithOnlyLogsPermission.length > 0 && (
          <div className="flex flex-col gap-2">
            {machinesWithOnlyLogsPermission.map(machine => (
              <Button key={machine.id} variant="default" asChild>
                {/* TODO: Link to logs subpage. But shadcn does not support routed tabs nicely. */}
                <Link to={`/dashboard/machines/${machine.provider}/instances/${machine.id}`}>View logs</Link>
              </Button>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          asChild
          className="bg-background"
        >
          <a
            href={`https://explorer.oasis.io/${network}/sapphire/rofl/app/${app.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex items-center justify-center">
              <span>Explorer</span>
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
