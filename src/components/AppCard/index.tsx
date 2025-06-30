import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { type RoflApp } from '../../nexus/api'
import { Badge } from '@oasisprotocol/ui-library/src/components/ui/badge'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@oasisprotocol/ui-library/src/components/ui/card'
import { ArrowUpRight, RotateCw } from 'lucide-react'
import { AppStatusIcon } from '../AppStatusIcon'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { trimLongString } from '../../utils/trimLongString'
import { MetadataFormData } from '../../pages/CreateApp/types'

type AppCardProps =
  | {
      app: RoflApp
      network: string
      type?: 'explore' | 'dashboard'
    }
  | {
      app: MetadataFormData
      id: string
      network: string
      type?: 'explore' | 'dashboard'
      isPending: true
    }

export const AppCard: FC<AppCardProps> = props => {
  const { network, type } = props
  const isPending = 'isPending' in props && props.isPending
  const appId = isPending ? props.id : (props.app as RoflApp).id
  const appName = isPending ? props.app.name : (props.app as RoflApp).metadata?.['net.oasis.rofl.name']
  const appVersion = isPending
    ? props.app.version
    : (props.app as RoflApp).metadata?.['net.oasis.rofl.version']
  const appDescription = isPending
    ? props.app.description
    : (props.app as RoflApp).metadata?.['net.oasis.rofl.description']

  return (
    <Card className="rounded-md">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground pr-2 break-all">
            <>{appName || trimLongString(appId)}</>
          </h3>
          {isPending ? (
            <RotateCw className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <AppStatusIcon
              hasActiveInstances={(props.app as RoflApp).num_active_instances > 0}
              removed={(props.app as RoflApp).removed}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {type === 'explore' && !isPending && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            <>{appDescription}</>
          </p>
        )}
        {type === 'dashboard' && (
          <div className="flex flex-col gap-2">
            {!!appVersion && (
              <Badge variant="secondary">
                <>{appVersion}</>
              </Badge>
            )}
            <span className="text-xs text-muted-foreground break-all">{appId}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {type === 'dashboard' && (
          <Button variant="secondary" asChild={!isPending} disabled={isPending}>
            {isPending ? 'View details' : <Link to={`/dashboard/apps/${appId}`}>View details</Link>}
          </Button>
        )}

        <Button
          variant="secondary"
          asChild={!isPending}
          className={cn('bg-background', type === 'explore' && 'w-full')}
          disabled={isPending}
        >
          <a
            href={`https://explorer.oasis.io/${network}/sapphire/rofl/app/${appId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex items-center justify-center">
              <span>Explorer</span>
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
