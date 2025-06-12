import { type FC } from 'react';
import { type RoflApp } from '../../nexus/api';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@oasisprotocol/ui-library/src/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import { AppStatusIcon } from '../../components/AppStatusIcon';

type ExploreAppCardProps = {
  app: RoflApp;
  network: string;
};

export const ExploreAppCard: FC<ExploreAppCardProps> = ({ app, network }) => {
  return (
    <Card className="rounded-md">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground pr-2 break-all">
            <>{app.metadata?.['net.oasis.rofl.name']}</>
          </h3>
          <AppStatusIcon
            hasActiveInstances={!!app.num_active_instances}
            removed={app.removed}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-gray-400 text-sm leading-relaxed">
          <>{app.metadata?.['net.oasis.rofl.description']}</>
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" asChild>
          <a
            href={`https://explorer.oasis.io/${network}/sapphire/rofl/app/${app.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex items-center justify-center">
              <span>View details</span>
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};
