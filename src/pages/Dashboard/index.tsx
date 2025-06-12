import { type FC } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { MyAppsEmptyState } from '../../pages/Dashboard/MyApps/emptyState';
import { MachinesEmptyState } from '../../pages/Dashboard/Machines/emptyState';
import { MetricCard } from './MetricCard';
import { SectionHeader } from './SectionHeader';
import { useGetRuntimeRoflApps } from '../../nexus/api';
import { useNetwork } from '../../hooks/useNetwork';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { AppCard } from '../../components/AppCard';

const pageLimit = 3;

export const Dashboard: FC = () => {
  const network = useNetwork();
  const roflAppsQuery = useGetRuntimeRoflApps(network, 'sapphire', {
    limit: pageLimit,
    offset: 0,
    // add admin address query parameter when available
  });
  const { data, isLoading, isFetched } = roflAppsQuery;
  const roflApps = data?.data.rofl_apps;

  const appsNumber = roflApps ? roflApps.length : 0;
  const machinesNumber = 0;
  const failuresNumber = 0;

  return (
    <MainLayout>
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="ROFL Apps Running" value={appsNumber} />
          <MetricCard title="Machines Running" value={machinesNumber} />
          <MetricCard title="Failures" value={failuresNumber} />
        </div>
        <SectionHeader
          title="My ROFL Apps"
          to="/dashboard/apps"
          disabled={appsNumber === 0}
        />
        {isFetched && !appsNumber && <MyAppsEmptyState />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading &&
            Array.from({ length: pageLimit }).map((_, index) => (
              <Skeleton key={index} className="w-full h-[200px]" />
            ))}
          {isFetched &&
            roflApps?.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                network={network}
                type="dashboard"
              />
            ))}
        </div>
        <SectionHeader
          title="Machines"
          to="/dashboard/machines"
          disabled={machinesNumber === 0}
        />
        <MachinesEmptyState />
      </div>
    </MainLayout>
  );
};
