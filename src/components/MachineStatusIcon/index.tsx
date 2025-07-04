import { type FC } from 'react'
import { CircleCheck, CircleOff, CirclePause, CircleStop } from 'lucide-react'
import { parseISO, addMinutes, isWithinInterval, isPast } from 'date-fns'
import { Badge } from '@oasisprotocol/ui-library/src/components/ui/badge'
import { RoflMarketInstance } from '../../nexus/api'
import * as oasisRT from '@oasisprotocol/client-rt'
import { Tooltip, TooltipTrigger, TooltipContent } from '@oasisprotocol/ui-library/src/components/ui/tooltip'

type MachineStatusTypes = 'created' | 'active' | 'removed' | 'expiring' | 'accepted' | 'unknown'

function getMachineStatus(machine: RoflMarketInstance): MachineStatusTypes {
  if (machine.status === oasisRT.types.RoflmarketInstanceStatus.CREATED) return 'created'
  if (machine.status === oasisRT.types.RoflmarketInstanceStatus.CANCELLED) return 'removed'
  if (machine.status === oasisRT.types.RoflmarketInstanceStatus.ACCEPTED) {
    const expired = isExpired(machine.paid_until)
    const expiringSoon = !expired && isExpiringSoon(machine.paid_until)
    if (machine.removed || expired) return 'removed'
    if (expiringSoon) return 'expiring'

    // Machine is running when:
    // - Machine is in the accepted state
    // - Machine is paid for
    // - A node has been assigned
    // - There is an active deployment
    if (machine.node_id && machine.deployment) return 'active'
    return 'accepted'
  }

  return 'unknown'
}

type MachineStatusIconProps = {
  machine: RoflMarketInstance
}

const isExpiringSoon = (expirationDate: string) => {
  try {
    const paidUntilDate = parseISO(expirationDate)
    const now = new Date()
    const tenMinutesFromNow = addMinutes(now, 10)

    return isWithinInterval(paidUntilDate, {
      start: now,
      end: tenMinutesFromNow,
    })
  } catch {
    return false
  }
}

const isExpired = (expirationDate: string) => {
  try {
    const paidUntilDate = parseISO(expirationDate)
    return isPast(paidUntilDate)
  } catch {
    return false
  }
}

export const MachineStatusIcon: FC<MachineStatusIconProps> = ({ machine }) => {
  const status = getMachineStatus(machine)

  const getStatusConfig = (status: MachineStatusTypes) => {
    switch (status) {
      case 'created':
        return {
          icon: <CirclePause className="h-5 w-5" style={{ color: 'var(--warning)' }} />,
          tooltip: 'Machine pending startup',
        }
      case 'accepted':
        return {
          icon: <CirclePause className="h-5 w-5" style={{ color: 'var(--success)' }} />,
          tooltip: 'Machine is ready to start',
        }
      case 'active':
        return {
          icon: <CircleCheck className="h-5 w-5" style={{ color: 'var(--success)' }} />,
          tooltip: 'Machine is active and running',
        }
      case 'removed':
        return {
          icon: <CircleStop className="h-5 w-5" style={{ color: 'var(--error)' }} />,
          tooltip: 'Machine is no longer available',
        }
      case 'expiring':
        return {
          icon: <Badge className="bg-warning">Expiring Soon</Badge>,
          tooltip: 'Machine payment expires within 10 minutes',
        }
      case 'unknown':
        return {
          icon: <CircleOff className="h-5 w-5" style={{ color: 'var(--error)' }} />,
          tooltip: 'Machine is in unknown status',
        }
      default:
        return null
    }
  }

  const config = getStatusConfig(status)

  if (!config) return null

  return (
    <Tooltip>
      <TooltipTrigger>{config.icon}</TooltipTrigger>
      <TooltipContent>
        <p>{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
