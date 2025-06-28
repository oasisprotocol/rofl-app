import type { FC } from 'react'
import { FathomAnalytics } from '../FathomAnalytics'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@oasisprotocol/ui-library'

export const RootLayout: FC = () => (
  <>
    <FathomAnalytics />
    <Toaster />
    <Outlet />
  </>
)
