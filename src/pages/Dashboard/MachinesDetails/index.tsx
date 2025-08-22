import { type FC } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@oasisprotocol/ui-library/src/components/ui/tabs'
import { CircleArrowUp, Clock } from 'lucide-react'
import { formatDistanceToNow, parseISO, isFuture } from 'date-fns'
import { MachineStatusIcon } from '../../../components/MachineStatusIcon'
import { DetailsSectionRow } from '../../../components/DetailsSectionRow'
import { MachineRestart } from './MachineRestart'
import { useNetwork } from '../../../hooks/useNetwork'
import {
  useGetRuntimeRoflAppsId,
  useGetRuntimeRoflmarketProvidersAddressInstancesId,
} from '../../../nexus/api'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { MachineResources } from '../../../components/MachineResources'
import { useMachineExecuteRestartCmd, useMachineExecuteStopCmd } from '../../../backend/api'
import { Dialog, DialogContent } from '@oasisprotocol/ui-library/src/components/ui/dialog'
import { MachineLogs } from './MachineLogs'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { MachineName } from '../../../components/MachineName'
import { toastWithDuration } from '../../../utils/toastWithDuration'
import { isMachineRemoved } from '../../../components/MachineStatusIcon/isMachineRemoved'
import { useSendTransaction } from 'wagmi'
import * as oasis from '@oasisprotocol/client'
import * as oasisRT from '@oasisprotocol/client-rt'

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
  const restartMachine = useMachineExecuteRestartCmd()
  const stopMachine = useMachineExecuteStopCmd()
  const { sendTransactionAsync } = useSendTransaction()

  const showBlockingOverlay = restartMachine.isPending || stopMachine.isPending
  return (
    <>
      <div>
        <Dialog open={showBlockingOverlay}>
          <DialogContent className="w-auto [&>button]:hidden">
            {/* mitigate webm black background */}
            <video className="mix-blend-lighten" width="310" height="310" autoPlay muted loop playsInline>
              <source src="https://assets.oasis.io/webm/Oasis-Loader-310x310.webm" type="video/webm" />
            </video>
          </DialogContent>
        </Dialog>
        <Tabs defaultValue="details">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b py-5">
            {isLoading && <Skeleton className="w-full h-[36px]" />}
            {isFetched && machine && (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    <MachineName machine={machine} network={network} />
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

                  <Button
                    variant="outline"
                    onClick={() => {
                      const sapphireRuntimeId =
                        network === 'mainnet'
                          ? oasis.misc.fromHex(
                              '000000000000000000000000000000000000000000000000f80306c9858e7279',
                            )
                          : oasis.misc.fromHex(
                              '000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c',
                            )
                      const roflmarket = new oasisRT.roflmarket.Wrapper(sapphireRuntimeId)
                      sendTransactionAsync(
                        roflmarket
                          .callInstanceChangeAdmin()
                          .setBody({
                            provider: oasis.staking.addressFromBech32(machine.provider),
                            id: oasis.misc.fromHex(machine.id),
                            admin: oasis.staking.addressFromBech32(
                              window.prompt('Change admin to', 'oasis1..')!,
                            ),
                          })
                          .toSubcall(),
                      )
                    }}
                  >
                    Change admin
                  </Button>

                  {!isMachineRemoved(machine) && (
                    <Button variant="outline" className="w-full md:w-auto" asChild>
                      <Link to="./top-up">
                        <CircleArrowUp />
                        Top up
                      </Link>
                    </Button>
                  )}
                  <MachineRestart
                    disabled={isMachineRemoved(machine)}
                    onConfirm={async () => {
                      await restartMachine.mutateAsync({
                        machineId: machine.id,
                        provider: machine.provider,
                        network,
                      })
                      toastWithDuration('Machine is restarting (~1min)', 1 * 60 * 1000)
                    }}
                  />
                  <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
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
                  {machine.metadata['net.oasis.error'] && (
                    <p className="text-error">Error: {machine.metadata['net.oasis.error'] as string}</p>
                  )}
                  {machine.deployment && (
                    <DetailsSectionRow
                      label={isMachineRemoved(machine) ? 'Last active app' : 'Active app'}
                      className="py-6 border-b"
                    >
                      <Link to={`/dashboard/apps/${machine.deployment?.app_id}`} className="text-primary">
                        <MachineAppDetails appId={machine.deployment?.app_id as string} />
                      </Link>
                    </DetailsSectionRow>
                  )}
                  {isMachineRemoved(machine) && (
                    <DetailsSectionRow label="Status">
                      <span className="text-error">Removed</span>
                    </DetailsSectionRow>
                  )}
                  <DetailsSectionRow label="Created">
                    {new Date(machine.created_at).toLocaleString()}
                  </DetailsSectionRow>
                  {machine.paid_from && (
                    <DetailsSectionRow label="Paid">
                      From {new Date(machine.paid_from).toLocaleString()}, until{' '}
                      {new Date(machine.paid_until).toLocaleString()}
                    </DetailsSectionRow>
                  )}
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
          <TabsContent value="logs">
            {isFetched && machine && (
              <MachineLogs
                schedulerRak={machine.metadata['net.oasis.scheduler.rak'] as string}
                provider={machine.provider}
                instance={machine.id}
                isRemoved={isMachineRemoved(machine)}
              />
            )}
          </TabsContent>
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
