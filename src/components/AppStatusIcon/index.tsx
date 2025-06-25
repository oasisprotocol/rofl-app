import { type FC } from 'react'
import { CircleCheck, CircleMinus, CirclePause } from 'lucide-react'

type AppStatusTypes = 'active' | 'inactive' | 'removed'

function getRoflAppStatus(hasActiveInstances: boolean, removed: boolean): AppStatusTypes {
  if (removed) return 'removed'
  return hasActiveInstances ? 'active' : 'inactive'
}

type AppStatusIconProps = {
  hasActiveInstances: boolean
  removed: boolean
}

export const AppStatusIcon: FC<AppStatusIconProps> = ({ hasActiveInstances, removed }) => {
  const status = getRoflAppStatus(hasActiveInstances, removed)
  const getStatusIcon = (status: AppStatusTypes) => {
    switch (status) {
      case 'active':
        return <CircleCheck className="h-5 w-5" style={{ color: 'var(--success)' }} />
      case 'inactive':
        return <CirclePause className="h-5 w-5" style={{ color: 'var(--warning)' }} />
      case 'removed':
        return <CircleMinus className="h-5 w-5" style={{ color: 'var(--error)' }} />
      default:
        return null
    }
  }

  return <>{getStatusIcon(status)}</>
}
