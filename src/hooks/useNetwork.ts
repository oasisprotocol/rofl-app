import { useAccount } from 'wagmi'
import { AppError, AppErrors } from '../components/ErrorBoundary/errors'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { useRef } from 'react'
import { ROFL_PAYMASTER_ENABLED_CHAINS_IDS } from '../constants/rofl-paymaster-config.ts'

export function useNetwork(fallback?: 'mainnet' | 'testnet') {
  const { isConnected, chainId } = useAccount()
  const previousValueRef = useRef<'mainnet' | 'testnet' | null>(null)

  if (!isConnected) {
    if (!fallback) {
      throw new AppError(AppErrors.WalletNotConnected)
    } else {
      return fallback
    }
  }

  if (chainId === sapphire.id) {
    previousValueRef.current = 'mainnet'
    return 'mainnet'
  }

  if (chainId === sapphireTestnet.id) {
    previousValueRef.current = 'testnet'
    return 'testnet'
  }

  // Allow payment-required chains without throwing errors
  if (chainId && ROFL_PAYMASTER_ENABLED_CHAINS_IDS.includes(chainId.toString())) {
    if (previousValueRef.current) return previousValueRef.current
  }

  if (fallback) {
    return fallback
  }

  throw new AppError(AppErrors.UnsupportedChain)
}
