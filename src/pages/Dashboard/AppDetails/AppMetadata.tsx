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
  const machines = machinesData?.data.instances.filter(machine => !machine.removed)

  return (
    <div className="space-y-4">
      {isMachineLoading && <Skeleton className="w-full h-60px]" />}

      {machines && machines.length > 0 && isMachineFetched ? (
        <>
          <DetailsSectionRow label="Machines">
            {machines.map((machine, index) => (
              <span key={machine.id}>
                <Link
                  key={machine.id}
                  to={`/dashboard/machines/${machine.provider}/instances/${machine.id}`}
                  className="text-primary"
                >
                  <MachineName machine={machine} network={network} />
                </Link>
                {index < machines.length - 1 && <>, </>}
              </span>
            ))}
          </DetailsSectionRow>
          <DetailsSectionRow label="Resources" className=" pb-6 border-b">
            {machines.map((machine, index) => (
              <span key={machine.id}>
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
          <span className="text-muted-foreground">Machines data is not available.</span>
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
              href={`https://explorer.oasis.io/mainnet/sapphire/tx/${transaction.hash}`}
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

  return <></>
}
