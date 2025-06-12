import type { FC } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { ExploreEmptyState } from './emptyState';

export const Explore: FC = () => {
  return (
    <MainLayout>
      <ExploreEmptyState />
    </MainLayout>
  );
};
