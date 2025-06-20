import { type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetRuntimeRoflAppsId,
  type RoflMarketInstance,
} from '../../nexus/api';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@oasisprotocol/ui-library/src/components/ui/card';
import { MachineStatusIcon } from '../MachineStatusIcon';
import { trimLongString } from '../../utils/trimLongString';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { cn } from '@oasisprotocol/ui-library/src/lib/utils';

type ExploreAppCardProps = {
  machine: RoflMarketInstance;
  network: 'mainnet' | 'testnet';
};

export const MachineCard: FC<ExploreAppCardProps> = ({ machine, network }) => {
  const roflAppQuery = useGetRuntimeRoflAppsId(
    network,
    'sapphire',
    machine.deployment?.app_id as string
  );
  const { data, isLoading, isFetched } = roflAppQuery;
  const roflAppName = data?.data.metadata['net.oasis.rofl.name'];

  return (
    <Card className="rounded-md">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground pr-2 break-all">
            <>
              {machine.metadata?.['net.oasis.provider.name'] ||
                trimLongString(machine.provider)}
            </>
          </h3>
          <MachineStatusIcon
            removed={machine.removed}
            expirationDate={machine.paid_until}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-2">
          <span
            className={cn('text-md break-all text-primary', {
              'text-primary': roflAppName,
              'text-muted-foreground': !roflAppName,
            })}
          >
            {isLoading && <Skeleton className="w-full h-[24px] w-full" />}
            {isFetched && <>{roflAppName || 'Not provided'}</>}
          </span>
          <span className="text-xs text-muted-foreground break-all">
            <>{machine.deployment?.app_id}</>
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" asChild>
          <Link
            to={`/dashboard/machines/${machine.provider}/instances/${machine.id}`}
          >
            View details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
