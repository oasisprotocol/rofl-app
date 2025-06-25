import { type FC } from 'react'
import { CircleCheck, CircleMinus } from 'lucide-react'
import { parseISO, addMinutes, isWithinInterval, isPast } from 'date-fns'
import { Badge } from '@oasisprotocol/ui-library/src/components/ui/badge'

type MachineStatusTypes = 'active' | 'removed' | 'expiring'

function getMachineStatus(removed: boolean, expiringSoon: boolean, expired: boolean): MachineStatusTypes {
  if (removed || expired) return 'removed'
  if (expiringSoon) return 'expiring'
  return 'active'
}

type MachineStatusIconProps = {
  removed: boolean
  expirationDate: string
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

export const MachineStatusIcon: FC<MachineStatusIconProps> = ({ removed, expirationDate }) => {
  const expired = isExpired(expirationDate)
  const expiringSoon = !expired && isExpiringSoon(expirationDate)
  const status = getMachineStatus(removed, expiringSoon, expired)
  const getStatusIcon = (status: MachineStatusTypes) => {
    switch (status) {
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
