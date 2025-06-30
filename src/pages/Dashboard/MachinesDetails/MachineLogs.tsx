import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { FC } from 'react'
import { EmptyState } from '../../../components/EmptyState'
import { useMachineAccess } from '../../../backend/machine-api'
import { useScheduler } from '../../../hooks/useScheduler'
import { RawCode } from '../../../components/CodeDisplay'
import { RotateCw } from 'lucide-react'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'

type MachineLogsProps = {
  schedulerRak: string
  provider: string
  instance: string
  logs: string[]
  setLogs: (logs: string[]) => void
  isRemoved?: boolean
}

export const MachineLogs: FC<MachineLogsProps> = ({
  schedulerRak,
  provider,
  instance,
  logs,
  setLogs,
  isRemoved,
}) => {
  const { api: schedulerApi } = useScheduler(schedulerRak, provider)
  const { fetchMachineLogs, isAuthenticating, isLoadingLogs } = useMachineAccess(
    schedulerApi,
    provider,
    instance,
  )
  const handleFetchLogs = async () => {
    try {
      const fetchedLogs = await fetchMachineLogs()
      setLogs(fetchedLogs)
    } catch (error) {
      console.error('Failed to fetch machine logs:', error)
    }
  }
  const hasLogs = logs.length > 0

  if (!schedulerRak) {
    return (
      <EmptyState
        title="Waiting for scheduler"
        description="Logs will be available once the scheduler is ready."
      ></EmptyState>
    )
  }

  if (isRemoved) {
    return (
      <EmptyState
        title="Machine has been removed"
        description="Logs are not available for machines that have been removed."
      ></EmptyState>
    )
  }

  return (
    <>
      {!hasLogs && !isLoadingLogs && (
        <EmptyState
          title="Additional access required"
          description="To view machine logs, log into the machine with your Ethereum account."
        >
          <Button onClick={handleFetchLogs} disabled={isAuthenticating}>
            {isAuthenticating ? 'Accessing...' : 'Access machine'}
          </Button>
        </EmptyState>
      )}
      {!hasLogs && isLoadingLogs && <Skeleton className="h-[700px] w-full" />}
      {hasLogs && (
        <>
          <div className="flex justify-end mt-2 mb-4">
            <Button
              variant="outline"
              onClick={handleFetchLogs}
              disabled={isAuthenticating || isLoadingLogs}
              className="flex items-center"
            >
              <RotateCw
                className={`ml-2 h-4 w-4 ${isAuthenticating || isLoadingLogs ? 'animate-spin' : ''}`}
              />
              {isAuthenticating || isLoadingLogs ? 'Fetching...' : 'Refetch logs'}
            </Button>
          </div>

          <RawCode data={logs.reverse().join('\n')} className="h-[700px]" />
        </>
      )}
    </>
  )
}
