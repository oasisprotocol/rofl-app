import { type FC } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@oasisprotocol/ui-library/src/components/ui/tabs'
import { CircleArrowUp, Clock } from 'lucide-react'
import { formatDistanceToNow, parseISO, isFuture } from 'date-fns'
import { MachineStatusIcon } from '../../../components/MachineStatusIcon'
import { DetailsSectionRow } from '../../../components/DetailsSectionRow'
import { MachineRestart } from './MachineRestart'
import { GrantLogsPermissionDialog } from './GrantLogsPermissionDialog'
import { useNetwork } from '../../../hooks/useNetwork'
import {
  useGetRuntimeRoflAppsId,
  useGetRuntimeRoflmarketProvidersAddressInstancesId,
} from '../../../nexus/api'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { MachineResources } from '../../../components/MachineResources'
import {
  useGrantLogsPermission,
  useMachineExecuteRestartCmd,
  useMachineExecuteStopCmd,
} from '../../../backend/api'
import { Dialog, DialogContent } from '@oasisprotocol/ui-library/src/components/ui/dialog'
import { MachineLogs } from './MachineLogs'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { MachineName } from '../../../components/MachineName'
import { toastWithDuration } from '../../../utils/toastWithDuration'
import { isMachineRemoved } from '../../../components/MachineStatusIcon/isMachineRemoved'
import { useAccount } from 'wagmi'
import { getEvmBech32Address } from '../../../utils/helpers'
import { appDetailsPath } from '../../paths'
import { hasViewLogsPermission } from '../../../utils/hasViewLogsPermission'

export const MachinesDetails: FC = () => {
  const account = useAccount()
  const network = useNetwork()
  const { provider, id } = useParams()
  const roflMachinesQuery = useGetRuntimeRoflmarketProvidersAddressInstancesId(
    network,
    'sapphire',
    provider!,
    id!,
    {
      // @ts-expect-error Incorrect type demands queryKey
      query: {
        refetchInterval: 10_000, // Most useful when waiting for net.oasis.scheduler.rak
      },
    },
  )
  const { data, isLoading, isFetched } = roflMachinesQuery
  const machine = data?.data
  const restartMachine = useMachineExecuteRestartCmd()
  const stopMachine = useMachineExecuteStopCmd()
  const grantLogsPermission = useGrantLogsPermission()

  const showBlockingOverlay =
    restartMachine.isPending || stopMachine.isPending || grantLogsPermission.isPending
  const editEnabled =
    machine &&
    !isMachineRemoved(machine) &&
    account.address &&
    machine?.admin === getEvmBech32Address(account.address)
  const canAccessLogs =
    editEnabled || (machine && account.address && hasViewLogsPermission(machine, account.address))

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
                  {editEnabled && (
                    <>
                      <Button variant="outline" className="w-full md:w-auto" asChild>
                        <Link to="./top-up">
                          <CircleArrowUp />
                          Top up
                        </Link>
                      </Button>
                      <MachineRestart
                        onConfirm={async () => {
                          await restartMachine.mutateAsync({
                            machineId: machine.id,
                            provider: machine.provider,
                            network,
                          })
                          toastWithDuration('Machine is restarting (~1min)', 1 * 60 * 1000)
                        }}
                      />
                      <GrantLogsPermissionDialog
                        onConfirm={async evmAddress => {
                          await grantLogsPermission.mutateAsync({
                            machine: machine,
                            provider: machine.provider,
                            network,
                            evmAddress,
                          })
                          toastWithDuration(
                            'Logs view permission granted. Machine is restarting (~1min)',
                            1 * 60 * 1000,
                          )
                        }}
                      />
                    </>
                  )}
                  <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {canAccessLogs && <TabsTrigger value="logs">Logs</TabsTrigger>}
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
                      <Link
                        to={appDetailsPath(network, machine.deployment.app_id as string)}
                        className="text-primary"
                      >
                        <MachineAppDetails appId={machine.deployment.app_id as string} />
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
