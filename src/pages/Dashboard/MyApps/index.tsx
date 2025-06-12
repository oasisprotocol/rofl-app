import { type FC } from 'react';
import { MyAppsEmptyState } from './emptyState';
import { AppsList } from '../../../components/AppsList';

export const MyApps: FC = () => {
  return <AppsList emptyState={<MyAppsEmptyState />} type="dashboard" />;
};
