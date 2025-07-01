import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { CreateContextProvider } from './pages/CreateApp/CreateContextProvider'
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
import { darkTheme, RainbowKitProvider, type Theme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AccountAvatar } from './components/AccountAvatar'
import { MainLayout } from './components/Layout/MainLayout'
import { RoflAppBackendAuthProvider } from './contexts/RoflAppBackendAuth/Provider'
import { RootLayout } from './components/RootLayout'
import { sapphire } from 'viem/chains'

import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()
const rainbowKitTheme: Theme = {
  ...darkTheme(),
  fonts: {
    body: 'inherit',
  },
}

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
        path: 'dashboard',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'apps',
            element: <MyApps />,
          },
          {
            path: 'apps/:id',
            element: <AppDetails />,
          },
          {
            path: 'machines',
            element: <Machines />,
          },
          {
            path: 'machines/:provider/instances/:id',
            element: <MachinesDetails />,
          },
        ],
      },
      {
        path: 'create',
        Component: () => {
          const location = useLocation()
          // Key is used to reset state on every navigation to this route. Even
          // if inside create flow and user clicks "Create +" in Header bar.
          // TODO: CreateContextProvider is not needed anymore
          return (
            <CreateContextProvider key={location.key}>
              <Create />
            </CreateContextProvider>
          )
        },
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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        initialChain={sapphire}
        theme={rainbowKitTheme}
        avatar={({ address, size }) => (
          <AccountAvatar diameter={size} account={{ address_eth: address as `0x${string}` }} />
        )}
      >
        <RoflAppBackendAuthProvider>
          <RouterProvider router={router} />
        </RoflAppBackendAuthProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
)
