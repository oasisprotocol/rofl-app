import type { FC } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@oasisprotocol/ui-library/src/components/ui/tabs'
import { Clock, CircleArrowUp } from 'lucide-react'
import { formatDistanceToNow, parseISO, isFuture } from 'date-fns'
import { MachineStatusIcon } from '../../../components/MachineStatusIcon'
import { DetailsSectionRow } from '../../../components/DetailsSectionRow'
import { MachineStop } from './MachineStop'
import { MachineRestart } from './MachineRestart'
import { useNetwork } from '../../../hooks/useNetwork'
import {
  useGetRuntimeRoflAppsId,
  useGetRuntimeRoflmarketProvidersAddressInstancesId,
} from '../../../nexus/api'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { trimLongString } from '../../../utils/trimLongString'
import { MachineResources } from '../../../components/MachineResources'
import { useMachineExecuteRestartCmd } from '../../../backend/api'

export const MachinesDetails: FC = () => {
  const network = useNetwork()
  const { provider, id } = useParams()
  const roflMachinesQuery = useGetRuntimeRoflmarketProvidersAddressInstancesId(
    network,
    'sapphire',
    provider!,
    id!,
  )
  const { data, isLoading, isFetched } = roflMachinesQuery
  const machine = data?.data
  const { mutateAsync: restartMachine } = useMachineExecuteRestartCmd()

  return (
    <>
      <div>
        <Tabs defaultValue="details">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b py-5">
            {isLoading && <Skeleton className="w-full h-[36px]" />}
            {isFetched && machine && (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    <>{machine.metadata?.['net.oasis.provider.name'] || trimLongString(machine.provider)}</>
                  </h1>
                  <MachineStatusIcon machine={machine} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-orange-400 px-3 py-1.5 ">
                    {machine.paid_until && isFuture(parseISO(machine.paid_until)) && (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(parseISO(machine.paid_until), {
                            addSuffix: false,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  <Button variant="outline" className="w-full md:w-auto" disabled>
                    <CircleArrowUp />
                    Top up
                  </Button>
                  <MachineRestart
                    disabled={machine.removed}
                    onConfirm={() => {
                      restartMachine({ machineId: machine.id, provider: machine.provider, network })
                      roflMachinesQuery.refetch()
                    }}
                  />
                  <MachineStop />

                  <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {/* <TabsTrigger value="logs">Logs</TabsTrigger> */}
                  </TabsList>
                </div>
              </>
            )}
          </div>
          <TabsContent value="details">
            <div className="space-y-4">
              {isLoading && <Skeleton className="w-full h-[200px]" />}
              {isFetched && machine && (
                <>
                  <DetailsSectionRow label="App Running" className=" py-6 border-b">
                    <Link to={`/dashboard/apps/${machine.deployment?.app_id}`} className="text-primary">
                      <MachineAppDetails appId={machine.deployment?.app_id as string} />
                    </Link>
                  </DetailsSectionRow>
                  <DetailsSectionRow label="Provider">{machine.provider}</DetailsSectionRow>
                  <DetailsSectionRow label="Instance ID">{machine.id}</DetailsSectionRow>
                  <DetailsSectionRow label="Resources">
                    <MachineResources
                      cpus={machine.resources?.cpus}
                      memory={machine.resources?.memory}
                      storage={machine.resources?.storage}
                    />
                  </DetailsSectionRow>
                  <DetailsSectionRow label="Node ID" className="pb-6 border-b">
                    {machine.node_id}
                  </DetailsSectionRow>
                </>
              )}
            </div>
          </TabsContent>
          {/* <TabsContent value="logs">
            <div className="whitespace-pre-wrap font-mono text-sm bg-card text-foreground mt-6 p-6 rounded-sm overflow-auto leading-relaxed">
              [2024-01-15 10:30:25] INFO: Application started
            </div>
          </TabsContent> */}
        </Tabs>
      </div>
    </>
  )
}

const MachineAppDetails: FC<{
  appId: string
}> = ({ appId }) => {
  const network = useNetwork()
  const roflAppQuery = useGetRuntimeRoflAppsId(network, 'sapphire', appId)
  const { data, isFetched } = roflAppQuery
  const roflAppName = data?.data.metadata['net.oasis.rofl.name']

  return <>{isFetched && <>{roflAppName || appId}</>}</>
}
