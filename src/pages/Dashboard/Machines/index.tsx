import type { FC } from 'react';
import { MachinesEmptyState } from './emptyState';
import { MainLayout } from '../../../components/Layout/MainLayout';

export const Machines: FC = () => {
  return (
    <MainLayout>
      <MachinesEmptyState />
    </MainLayout>
  );
};
