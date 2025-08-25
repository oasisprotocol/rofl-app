import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { FC } from 'react'
import { EmptyState } from '../../../components/EmptyState'
import { useMachineAccess } from '../../../backend/machine-api'
import { useScheduler } from '../../../hooks/useScheduler'
import { CodeDisplay } from '../../../components/CodeDisplay'
import { RotateCw } from 'lucide-react'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'

type MachineLogsProps = {
  schedulerRak: string
  provider: string
  instance: string
  isRemoved?: boolean
}

export const MachineLogs: FC<MachineLogsProps> = ({ schedulerRak, provider, instance, isRemoved }) => {
  const { api: schedulerApi } = useScheduler(schedulerRak, provider)
  const {
    startFetchingMachineLogs,
    isAuthenticating,
    isLoadingLogs,
    logs: allLogs,
  } = useMachineAccess(schedulerApi, provider, instance)
  const handleFetchLogs = async () => {
    try {
      await startFetchingMachineLogs()
    } catch (error) {
      console.error('Failed to fetch machine logs:', error)
    }
  }

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

  const hasLogs = allLogs.length > 0

  // Hide a message while formatting disk that makes it look like progress is stuck.
  const misleadingMessageWhileFormattingDisk = 'No test for authenc(hmac(sha256),xts(aes))'
  const logs = allLogs[allLogs.length - 1]?.includes(misleadingMessageWhileFormattingDisk)
    ? allLogs.slice(0, -1)
    : allLogs

  // Append sections and indent everything else.
  // https://github.com/oasisprotocol/oasis-sdk/blob/e2061d999426e3455ca4ed7c8a5c82f0b52441e5/rofl-containers/src/main.rs#L110
  const containersInitializedMessage = '"everything is up and running"'
  const firstSection = logs.join('\n').includes(containersInitializedMessage)
    ? '# Application\n'
    : '# Still booting\n'
  const logsWithSections =
    firstSection +
    logs
      .slice()
      .reverse()
      .map(line => '  ' + line)
      .map(line => (line.includes(containersInitializedMessage) ? '\n\n\n# Booted\n' + line : line))
      .join('\n')

  // Workaround for Hyperliquid Copy Trader
  // Detect
  //   https://github.com/oasisprotocol/template-rofl-hl-copy-trader/blob/6ea6164b44d0a975daf95af2cf83d2052e5e5ab7/src/core/copy_trader.py#L54
  //   {"level":"warn","module":"runtime","msg":"2025-07-02 16:06:59,245 - src.core.copy_trader - INFO - Copy trader initialized - Target: 0x8af700ba841f30e0a3fcb0ee4c4a9d223e1efa05, Our address: 0xe8bbADdd6cE1D28a2efaC6272186E02968D01690, Dry run: False","ts":"2025-07-02T16:07:01.871593492Z"}
  const hyperliquidInitLine = logs.find(line =>
    line.includes('- src.core.copy_trader - INFO - Copy trader initialized -'),
  )
  // extract 0xe8bbADdd6cE1D28a2efaC6272186E02968D01690
  const hyperliquidTradingAddress = hyperliquidInitLine?.match(/Our address: (0x[0-9a-fA-F]{40}),/)?.[1]
  if (hyperliquidInitLine && !hyperliquidTradingAddress) {
    console.error('Can not parse hyperliquid init line:', hyperliquidInitLine)
  }
  const hyperliquidExtractedMessage = hyperliquidTradingAddress && (
    // Based on https://github.com/oasisprotocol/template-rofl-hl-copy-trader/blob/6ea6164b44d0a975daf95af2cf83d2052e5e5ab7/src/core/copy_trader.py#L82-L99
    <p className="text-md leading-relaxed">
      Your copy trading bot's USDC (Perps) address on Hyperliquid:
      <br />
      {hyperliquidTradingAddress}
      <br />
      ⚠️&nbsp; IMPORTANT: Only send USDC (Perps) on Hyperliquid!
      <br />
      ⚠️&nbsp; Sending funds on any other chain or to the wrong account type may result in PERMANENT LOSS OF
      FUNDS!
      <br />
      <br />
    </p>
  )

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
          {hyperliquidExtractedMessage}
          <CodeDisplay data={logsWithSections} className="h-[700px]" />
        </>
      )}
    </>
  )
}
