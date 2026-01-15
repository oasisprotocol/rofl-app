import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { MyApps } from './pages/Dashboard/MyApps'
import { AppDetails } from './pages/Dashboard/AppDetails'
import { Machines } from './pages/Dashboard/Machines'
import { MachinesDetails } from './pages/Dashboard/MachinesDetails'
import { Create } from './pages/CreateApp'
import { Explore } from './pages/Explore'
import { NotFound } from './components/NotFound'
import { wagmiConfig } from './constants/wagmi-config.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from './components/Layout/MainLayout'
import { RootLayout } from './components/RootLayout'
import { LandingTemplates } from './pages/LandingTemplates'
import { MachineTopUp } from './pages/Dashboard/MachinesDetails/MachineTopUp'
import { ProtectedLayout } from './components/ProtectedLayout'

import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import { AppNewMachine } from './pages/Dashboard/AppDetails/AppNewMachine.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'templates',
        element: <LandingTemplates />,
      },
      {
        path: 'explore',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Explore />,
          },
        ],
      },
      {
        path: ':network/app/:id',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <AppDetails />,
          },
          {
            path: 'new-machine',
            element: <ProtectedLayout />,
            children: [
              {
                index: true,
                element: <AppNewMachine />,
              },
            ],
          },
        ],
      },
      {
        path: ':network/machine/:provider/instances/:id',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <MachinesDetails />,
          },
          {
            path: 'top-up',
            element: <ProtectedLayout />,
            children: [
              {
                index: true,
                element: <MachineTopUp />,
              },
            ],
          },
        ],
      },
      {
        path: ':network/dashboard',
        element: <ProtectedLayout />,
        children: [
          {
            element: <MainLayout />,
            children: [
              {
                index: true,
                element: <Dashboard />,
              },
            ],
          },
          {
            path: 'apps',
            element: <MainLayout />,
            children: [
              {
                index: true,
                element: <MyApps />,
              },
            ],
          },
          {
            path: 'machines',
            element: <MainLayout />,
            children: [
              {
                index: true,
                element: <Machines />,
              },
            ],
          },
          {
            path: 'machine/:provider/instances/:id',
            element: <MainLayout />,
            children: [
              {
                index: true,
                element: <MachinesDetails />,
              },
            ],
          },
          {
            path: 'machine/:provider/instances/:id/top-up',
            element: <MainLayout />,
            children: [
              {
                index: true,
                element: <MachineTopUp />,
              },
            ],
          },
        ],
      },
      {
        path: 'create',
        element: <ProtectedLayout redirectPath="/templates" />,
        children: [
          {
            index: true,
            Component: () => {
              const location = useLocation()
              // Key is used to reset state on every navigation to this route. Even
              // if inside create flow and user clicks "Create +" in Header bar.
              return <Create key={location.key} />
            },
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </WagmiProvider>,
)
