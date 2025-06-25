import { useAccount } from 'wagmi'
import { AppError, AppErrors } from '../components/ErrorBoundary/errors'
import { mainnet, sapphire, sapphireTestnet } from 'viem/chains'
import { useRef } from 'react'

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

  // Don't throw on "unsupported" chains, that are needed for payment
  if (chainId === mainnet.id) {
    return previousValueRef.current ?? fallback!
  }

  if (fallback) {
    return fallback
  }

  throw new AppError(AppErrors.UnsupportedChain)
}
