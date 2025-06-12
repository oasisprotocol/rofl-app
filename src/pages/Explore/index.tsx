import { type FC } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { ExploreEmptyState } from './emptyState';
import { useGetRuntimeRoflApps } from '../../nexus/api';
import { useNetwork } from '../../hooks/useNetwork';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { ExploreAppCard } from './ExploreAppCard';

const pageLimit = 18;

export const Explore: FC = () => {
  const network = useNetwork();
  const roflAppsQuery = useGetRuntimeRoflApps(network, 'sapphire', {
    limit: pageLimit,
    offset: 0,
  });
  const { data, isLoading, isFetched } = roflAppsQuery;
  const roflApps = data?.data.rofl_apps;

  return (
    <MainLayout>
      {isFetched && !roflApps?.length && <ExploreEmptyState />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: pageLimit }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[200px]" />
          ))}
        {isFetched &&
          roflApps?.map((app) => (
            <ExploreAppCard key={app.id} app={app} network={network} />
          ))}
      </div>
    </MainLayout>
  );
};
