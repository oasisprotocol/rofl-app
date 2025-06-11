import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { WagmiProvider } from 'wagmi';
import './index.css';
import App from './App.tsx';
import { wagmiConfig } from './constants/wagmi-config.ts';
import {
  lightTheme,
  RainbowKitProvider,
  type Theme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountAvatar } from './components/AccountAvatar/index.tsx';

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
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
