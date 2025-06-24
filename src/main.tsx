import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { CreateContextProvider } from './pages/CreateApp/CreateContextProvider';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { MyApps } from './pages/Dashboard/MyApps';
import { AppDetails } from './pages/Dashboard/AppDetails';
import { Machines } from './pages/Dashboard/Machines';
import { MachinesDetails } from './pages/Dashboard/MachinesDetails';
import { Create } from './pages/CreateApp';
import { Explore } from './pages/Explore';
import { wagmiConfig } from './constants/wagmi-config.ts';
import {
  lightTheme,
  RainbowKitProvider,
  type Theme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountAvatar } from './components/AccountAvatar/index.tsx';
import { MainLayout } from './components/Layout/MainLayout';
import { RoflAppBackendAuthProvider } from './contexts/RoflAppBackendAuth/Provider';

import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();
const rainbowKitTheme: Theme = {
  ...lightTheme({ /* accentColor: 'var(--brand-extra-dark)' */ }),
  fonts: {
    body: 'inherit',
  },
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/dashboard',
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
    path: '/create',
    element: <Create />,
  },
  {
    path: '/explore',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Explore />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          avatar={({ address, size }) => (
            <AccountAvatar
              diameter={size}
              account={{ address_eth: address as `0x${string}` }}
            />
          )}
        >
          <RoflAppBackendAuthProvider>
            <CreateContextProvider>
              <RouterProvider router={router} />
            </CreateContextProvider>
          </RoflAppBackendAuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
