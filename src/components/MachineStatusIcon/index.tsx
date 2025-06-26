import { type FC } from 'react'
import { CircleCheck, CircleMinus, CirclePause } from 'lucide-react'
import { parseISO, addMinutes, isWithinInterval, isPast } from 'date-fns'
import { Badge } from '@oasisprotocol/ui-library/src/components/ui/badge'
import { RoflMarketInstance } from '../../nexus/api'
import * as oasisRT from '@oasisprotocol/client-rt'

type MachineStatusTypes = 'created' | 'active' | 'removed' | 'expiring'

function getMachineStatus(machine: RoflMarketInstance): MachineStatusTypes {
  if (machine.status === oasisRT.types.RoflmarketInstanceStatus.CREATED) return 'created'
  if (machine.status === oasisRT.types.RoflmarketInstanceStatus.CANCELLED) return 'removed'
  // else oasisRT.types.RoflmarketInstanceStatus.ACCEPTED:
  const expired = isExpired(machine.paid_until)
  const expiringSoon = !expired && isExpiringSoon(machine.paid_until)
  if (machine.removed || expired) return 'removed'
  if (expiringSoon) return 'expiring'
  return 'active'
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
  const getStatusIcon = (status: MachineStatusTypes) => {
    switch (status) {
      case 'created':
        return <CirclePause className="h-5 w-5" style={{ color: 'var(--warning)' }} />
      case 'active':
        return <CircleCheck className="h-5 w-5" style={{ color: 'var(--success)' }} />
      case 'removed':
        return <CircleMinus className="h-5 w-5" style={{ color: 'var(--error)' }} />
      case 'expiring':
        return <Badge className="bg-warning">Expiring Soon</Badge>
      default:
        return null
    }
  }

  return <>{getStatusIcon(status)}</>
}
