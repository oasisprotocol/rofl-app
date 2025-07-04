import { type FC } from 'react'
import { CircleCheck, CirclePause, CircleStop } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@oasisprotocol/ui-library/src/components/ui/tooltip'

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
  const getStatusConfig = (status: AppStatusTypes) => {
    switch (status) {
      case 'active':
        return {
          icon: <CircleCheck className="h-5 w-5" style={{ color: 'var(--success)' }} />,
          tooltip: 'Application is up and running',
        }
      case 'inactive':
        return {
          icon: <CirclePause className="h-5 w-5" style={{ color: 'var(--warning)' }} />,
          tooltip: 'Application is down',
        }
      case 'removed':
        return {
          icon: <CircleStop className="h-5 w-5" style={{ color: 'var(--error)' }} />,
          tooltip: 'Application is no longer available',
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
