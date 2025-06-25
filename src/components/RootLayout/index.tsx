import type { FC } from 'react'
import { FathomAnalytics } from '../FathomAnalytics'
import { Outlet } from 'react-router-dom'

export const RootLayout: FC = () => (
  <>
    <FathomAnalytics />
    <Outlet />
  </>
)
