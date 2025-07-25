import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { type RoflApp } from '../../nexus/api'
import { Badge } from '@oasisprotocol/ui-library/src/components/ui/badge'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@oasisprotocol/ui-library/src/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import { AppStatusIcon } from '../AppStatusIcon'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { trimLongString } from '../../utils/trimLongString'
import { formatDistanceToNow, parseISO } from 'date-fns'

type AppCardProps = {
  app: RoflApp
  network: string
  type?: 'explore' | 'dashboard'
}

export const AppCard: FC<AppCardProps> = ({ app, network, type }) => {
  return (
    <Card className="rounded-md">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <h3
            className={cn(
              'text-lg font-semibold text-foreground pr-2 break-all',
              type === 'dashboard' && 'text-primary',
            )}
          >
            {type === 'dashboard' && (
              <Link to={`/dashboard/apps/${app.id}`}>
                <>{app.metadata?.['net.oasis.rofl.name'] || trimLongString(app.id)}</>
              </Link>
            )}
            {type === 'explore' && <>{app.metadata?.['net.oasis.rofl.name'] || trimLongString(app.id)}</>}
          </h3>
          <AppStatusIcon hasActiveInstances={!!app.num_active_instances} removed={app.removed} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {type === 'explore' && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            <>{app.metadata?.['net.oasis.rofl.description']}</>
          </p>
        )}
        {type === 'dashboard' && (
          <div className="flex flex-col gap-2">
            <div>
              {!!app.metadata?.['net.oasis.rofl.version'] && (
                <Badge variant="secondary">
                  <>{app.metadata?.['net.oasis.rofl.version']}</>
                </Badge>
              )}{' '}
              <span className="text-xs">
                {formatDistanceToNow(parseISO(app.date_created), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <span className="text-xs text-muted-foreground break-all">{app.id}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {type === 'dashboard' && (
          <Button variant="secondary" asChild>
            <Link to={`/dashboard/apps/${app.id}`}>View details</Link>
          </Button>
        )}

        <Button variant="secondary" asChild className={cn('bg-background', type === 'explore' && 'w-full')}>
          <a
            href={`https://explorer.oasis.io/${network}/sapphire/rofl/app/${app.id}`}
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
