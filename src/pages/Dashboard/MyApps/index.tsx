import type { FC } from 'react';
import { MyAppsEmptyState } from './emptyState';
import { MainLayout } from '../../../components/Layout/MainLayout';

export const MyApps: FC = () => {
  return (
    <MainLayout>
      <MyAppsEmptyState />
    </MainLayout>
  );
};
