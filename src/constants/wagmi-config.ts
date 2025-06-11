import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { sapphireTestnet } from 'viem/chains';

export const SAPPHIRE_1RPC_CHAIN_CONFIG = defineChain({
  id: 23294,
  name: 'Oasis Sapphire',
  network: 'sapphire',
  nativeCurrency: { name: 'Sapphire Rose', symbol: 'ROSE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://1rpc.io/oasis/sapphire'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Oasis Explorer',
      url: 'https://explorer.oasis.io/mainnet/sapphire',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 734531,
    },
  },
});

const { VITE_WALLET_CONNECT_PROJECT_ID, PROD } = import.meta.env;

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getDefaultConfig>;
  }
}

export const wagmiConfig: ReturnType<typeof getDefaultConfig> =
  getDefaultConfig({
    appName: 'ROSE Stake',
    projectId: VITE_WALLET_CONNECT_PROJECT_ID,
    chains: [PROD ? SAPPHIRE_1RPC_CHAIN_CONFIG : sapphireTestnet],
    ssr: false,
    batch: {
      multicall: false,
    },
  });
