import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sapphire, sapphireTestnet } from 'viem/chains'

const { VITE_WALLET_CONNECT_PROJECT_ID } = import.meta.env

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getDefaultConfig>
  }
}

export const wagmiConfig: ReturnType<typeof getDefaultConfig> = getDefaultConfig({
  appName: 'ROFL App',
  projectId: VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [sapphireTestnet, sapphire],
  ssr: false,
  batch: {
    multicall: false,
  },
})
