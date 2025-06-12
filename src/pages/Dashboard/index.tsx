import { type FC } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { MyAppsEmptyState } from '../../pages/Dashboard/MyApps/emptyState';
import { MachinesEmptyState } from '../../pages/Dashboard/Machines/emptyState';
import { MetricCard } from './MetricCard';
import { SectionHeader } from './SectionHeader';

export const Dashboard: FC = () => {
  const appsNumber = 0;
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
        <MyAppsEmptyState />

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
