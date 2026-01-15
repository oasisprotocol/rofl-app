import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { useGetRuntimeRoflAppsId, type RoflMarketInstance } from '../../nexus/api'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@oasisprotocol/ui-library/src/components/ui/card'
import { MachineStatusIcon } from '../MachineStatusIcon'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { ArrowRight } from 'lucide-react'
import { MachineName } from '../MachineName'
import { appDetailsPath, machineDetailsPath } from '../../pages/paths'

type ExploreAppCardProps = {
  machine: RoflMarketInstance
  network: 'mainnet' | 'testnet'
}

export const MachineCard: FC<ExploreAppCardProps> = ({ machine, network }) => {
  const roflAppQuery = useGetRuntimeRoflAppsId(network, 'sapphire', machine.deployment?.app_id as string)
  const { data, isLoading, isFetched } = roflAppQuery
  const roflAppName = data?.data.metadata['net.oasis.rofl.name']

  return (
    <Card className="rounded-md">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground pr-2 break-all text-primary">
            <Link to={machineDetailsPath(network, machine.provider, machine.id)}>
              <MachineName machine={machine} network={network} />
            </Link>
          </h3>
          <MachineStatusIcon machine={machine} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-2">
          <span
            className={cn('text-md break-all flex items-center gap-2', {
              'text-foreground': roflAppName,
              'text-muted-foreground': !roflAppName,
            })}
          >
            {isLoading && <Skeleton className="w-full h-[24px] w-full" />}
            {isFetched && !!roflAppName && (
              <>
                <>{roflAppName}</>
                <Link to={appDetailsPath(network, data?.data.id)}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
            {isFetched && !roflAppName && <>Name not provided</>}
          </span>
          <span className="text-xs text-muted-foreground break-all">
            <>{machine.deployment?.app_id}</>
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" asChild>
          <Link to={machineDetailsPath(network, machine.provider, machine.id)}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
