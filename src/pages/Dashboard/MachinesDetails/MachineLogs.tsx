import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { FC } from 'react'
import { EmptyState } from '../../../components/EmptyState'
import { useMachineAccess } from '../../../hooks/useMachine'
import { useScheduler } from '../../../hooks/useScheduler'
import { RawCode } from '../../../components/CodeDisplay'

type MachineLogsProps = {
  provider: string
  instance: string
  logs: string[]
  setLogs: (logs: string[]) => void
}

export const MachineLogs: FC<MachineLogsProps> = ({ provider, instance, logs, setLogs }) => {
  const { api: schedulerApi } = useScheduler(provider)
  const { fetchMachineLogs } = useMachineAccess(schedulerApi, provider, instance)
  const handleMachineAccess = async () => {
    const result = await fetchMachineLogs()
    setLogs(result)
  }

  const hasLogs = logs.length > 0

  return (
    <>
      {!hasLogs && (
        <EmptyState
          title="Additional access required"
          description="To view machine logs, log into the machine with your Ethereum account."
        >
          <Button onClick={handleMachineAccess}>Access machine</Button>
        </EmptyState>
      )}
      {hasLogs && <RawCode data={logs.join('\n')} className="h-[700px]" />}
    </>
  )
}
