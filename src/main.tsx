import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
  ...lightTheme({ accentColor: 'var(--brand-extra-dark)' }),
  fonts: {
    body: 'inherit',
  },
};

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
            <BrowserRouter>
              <CreateContextProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="apps" element={<MyApps />} />
                    <Route path="apps/:id" element={<AppDetails />} />
                    <Route path="machines" element={<Machines />} />
                    <Route
                      path="machines/:provider/instances/:id"
                      element={<MachinesDetails />}
                    />
                  </Route>
                  <Route path="/create" element={<Create />}></Route>
                  <Route path="/explore" element={<MainLayout />}>
                    <Route index element={<Explore />} />
                  </Route>
                </Routes>
              </CreateContextProvider>
            </BrowserRouter>
          </RoflAppBackendAuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
