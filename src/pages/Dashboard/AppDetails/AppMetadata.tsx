import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { DetailsSectionRow } from '../../../components/DetailsSectionRow'
import {
  useGetRuntimeRoflAppsIdTransactions,
  useGetRuntimeRoflmarketInstances,
  type RoflAppPolicy,
} from '../../../nexus/api'
import { useNetwork } from '../../../hooks/useNetwork'
import { isUrlSafe } from '../../../utils/url'
import { trimLongString } from '../../../utils/trimLongString'
import { MetadataDialog } from './MetadataDialog'
import { type ViewMetadataState } from './types'
import { type MetadataFormData } from '../../CreateApp/types'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { MachineResources } from '../../../components/MachineResources'
import { MachineName } from '../../../components/MachineName'
import { MachineStatusIcon } from '../../../components/MachineStatusIcon'
import { isMachineRemoved } from '../../../components/MachineStatusIcon/isMachineRemoved'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { CircleArrowUp } from 'lucide-react'
import { useRoflAppBackendAuthContext } from '../../../contexts/RoflAppBackendAuth/hooks'
import { useDownloadArtifact } from '../../../backend/api'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { useAccount } from 'wagmi'
import { getEvmBech32Address } from '../../../utils/helpers'
import { useRoflAppDomains } from '../../../backend/useRoflAppDomains'
import { appDetailsNewMachinePath, machineDetailsPath, machineDetailsTopUpPath } from '../../paths'

type AppMetadataProps = {
  id: string
  date_created: string
  editableState: MetadataFormData
  policy: RoflAppPolicy
  setViewMetadataState: (state: ViewMetadataState) => void
  editEnabled?: boolean
}

export const AppMetadata: FC<AppMetadataProps> = ({
  id,
  date_created,
  editableState,
  policy,
  setViewMetadataState,
  editEnabled,
}) => {
  const network = useNetwork()
  const { data } = useGetRuntimeRoflAppsIdTransactions(network, 'sapphire', id, {
    limit: 1,
    method: 'rofl.Update',
  })
  const transaction = data?.data.transactions[0]
  const {
    data: machinesData,
    isLoading: isMachineLoading,
    isFetched: isMachineFetched,
  } = useGetRuntimeRoflmarketInstances(network, 'sapphire', {
    deployed_app_id: id,
  })
  const { token } = useRoflAppBackendAuthContext()
  const roflTemplateQuery = useDownloadArtifact(`${id}-rofl-template-yaml`, token)

  const machines = machinesData?.data.instances.filter(machine => !isMachineRemoved(machine))
  const lastMachineToDuplicate = machinesData?.data.instances[0]

  const appDomains = useRoflAppDomains(network, id)

  return (
    <div className="space-y-4">
      {isMachineLoading && <Skeleton className="w-full h-60px]" />}
      {editEnabled && (
        <div className="flex flex-wrap gap-3">
          {lastMachineToDuplicate && (
            <Button
              variant="outline"
              className={cn(!lastMachineToDuplicate?.deployment?.app_id && 'pointer-events-none opacity-50')}
              disabled={!lastMachineToDuplicate?.deployment?.app_id}
              asChild
            >
              <Link to={machineDetailsTopUpPath(lastMachineToDuplicate.provider, lastMachineToDuplicate?.id)}>
                <CircleArrowUp />
                Top up new machine based on last one
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            className={cn(!roflTemplateQuery.data && 'pointer-events-none opacity-50')}
            disabled={!roflTemplateQuery.data}
            asChild
          >
            <Link to={appDetailsNewMachinePath(id)}>
              <CircleArrowUp />
              Deploy to new machine
            </Link>
          </Button>
        </div>
      )}

      {machines && machines.length > 0 && isMachineFetched ? (
        <>
          <DetailsSectionRow label="Machines">
            {machines.map((machine, index) => (
              <span key={machine.id}>
                <span className="inline-flex items-center gap-2">
                  <Link
                    key={machine.id}
                    to={machineDetailsPath(machine.provider, machine.id)}
                    className="text-primary"
                  >
                    <MachineName machine={machine} network={network} />
                  </Link>
                  <MachineStatusIcon machine={machine} />
                </span>
                {index < machines.length - 1 && <>, </>}
              </span>
            ))}
          </DetailsSectionRow>
          <DetailsSectionRow label="Resources" className="pb-6 border-b">
            {machines.map((machine, index) => (
              <span key={machine.id} className="flex items-center">
                <MachineResources
                  cpus={machine.resources.cpus}
                  memory={machine.resources.memory}
                  storage={machine.resources.storage}
                />
                {index < machines.length - 1 && <>, </>}
              </span>
            ))}
          </DetailsSectionRow>
        </>
      ) : (
        <DetailsSectionRow label="Machine(s)" className="pb-6 border-b">
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-muted-foreground">Machines data is not available.</span>
          </div>
        </DetailsSectionRow>
      )}
      <DetailsSectionRow label="Explorer">
        <a
          href={`https://explorer.oasis.io/${network}/sapphire/rofl/app/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          {id}
        </a>
      </DetailsSectionRow>
      <DetailsSectionRow label="Created" className="pb-6 border-b">
        {new Date(date_created).toLocaleString()}
      </DetailsSectionRow>
      <MetadataDialog
        metadata={editableState}
        setViewMetadataState={setViewMetadataState}
        editEnabled={editEnabled}
      />
      <DetailsSectionRow label="Author">
        <>{editableState.author}</>
      </DetailsSectionRow>
      <DetailsSectionRow label="Description">
        <>{editableState.description}</>
      </DetailsSectionRow>
      <DetailsSectionRow label="Version">
        <>{editableState.version}</>
      </DetailsSectionRow>
      <DetailsSectionRow label="Homepage">
        {isUrlSafe(editableState.homepage) ? (
          <a href={editableState.homepage} target="_blank" rel="noopener noreferrer" className="text-primary">
            {editableState.homepage}
          </a>
        ) : undefined}
      </DetailsSectionRow>
      <DetailsSectionRow label="Proxy Domains">
        <div>
          {appDomains.isLoading && <Skeleton className="h-[20px] w-[80px]" />}
          {appDomains.isError && 'Error'}
          {appDomains.data?.map((port, i) => (
            <div key={i}>
              {port.ServiceName && `${port.ServiceName}: `}
              {isUrlSafe(port.Domain) ? (
                <a href={port.Domain} target="_blank" rel="noopener noreferrer" className="text-primary">
                  {port.Domain}
                </a>
              ) : (
                // `https://p<exposed ports>.m899.opf-testnet-rofl-25.rofl.app` is also considered invalid
                <span>{port.Domain}</span>
              )}
            </div>
          ))}
        </div>
      </DetailsSectionRow>
      <div className="text-xl font-bold">Policy</div>
      <DetailsSectionRow label="Who can run this app">
        <Endorsements endorsements={policy.endorsements} />
      </DetailsSectionRow>
      <DetailsSectionRow label="Latest Update" className=" pb-6 border-b">
        {transaction && (
          <>
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date(transaction?.timestamp))}
            <br />
            <a
              href={`https://explorer.oasis.io/${network}/sapphire/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              {trimLongString(transaction.eth_hash || transaction.hash)}
            </a>
          </>
        )}
      </DetailsSectionRow>
    </div>
  )
}

const Endorsements = ({ endorsements }: { endorsements: unknown }) => {
  const { address } = useAccount()
  const oasisAddress = getEvmBech32Address(address!)
  const items = endorsements as Array<{ node?: string; any?: boolean }>

  if (items.some(item => 'node' in item)) {
    return (
      <>
        {items.map(item => (
          <div key={item.node}>{item.node}</div>
        ))}
      </>
    )
  }

  if (items.length === 1 && 'any' in items[0]) {
    return <>Any</>
  }

  // TODO: Replace with https://github.com/oasisprotocol/rofl-app/issues/241
  if (items.length === 1 && 'provider_instance_admin' in items[0]) {
    return (
      <>
        {items[0].provider_instance_admin === oasisAddress
          ? 'You are currently admin on machine'
          : `${items[0].provider_instance_admin} is currently admin on machine`}
      </>
    )
  }

  return <></>
}
