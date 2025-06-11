import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';

export const Dashboard: FC = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
