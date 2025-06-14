import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { type RoflMarketProvider } from '../../nexus/api';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@oasisprotocol/ui-library/src/components/ui/card';
import { MachineStatusIcon } from '../MachineStatusIcon';
import { trimLongString } from '../../utils/trimLongString';

type ExploreAppCardProps = {
  machine: RoflMarketProvider;
};

export const MachineCard: FC<ExploreAppCardProps> = ({ machine }) => {
  return (
    <Card className="rounded-md">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground pr-2 break-all">
            <>
              {machine.metadata?.['net.oasis.provider.name'] ||
                trimLongString(machine.address)}
            </>
          </h3>
          <MachineStatusIcon removed={machine.removed} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-2">
          <span className="text-md text-primary break-all">
            {/* TODO */}
            ROFL App name
          </span>
          <span className="text-xs text-muted-foreground break-all">
            {machine.scheduler}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" asChild>
          <Link to={`/dashboard/machines/${machine.address}`}>
            View details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
