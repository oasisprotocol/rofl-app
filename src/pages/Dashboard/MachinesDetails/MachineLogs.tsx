import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { FC, useState } from 'react'
import { EmptyState } from '../../../components/EmptyState'
import { useMachineAccess } from '../../../hooks/useMachine'
import { useScheduler } from '../../../hooks/useScheduler'

type MachineLogsProps = {
  provider: string
  instance: string
}

export const MachineLogs: FC<MachineLogsProps> = ({ provider, instance }) => {
  const [logs, setLogs] = useState<string[]>([])
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
      {hasLogs && (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <pre key={index}>{log}</pre>
          ))}
        </div>
      )}
    </>
  )
}
