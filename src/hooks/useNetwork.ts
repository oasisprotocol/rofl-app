import { useAccount } from 'wagmi'
import { AppError, AppErrors } from '../components/ErrorBoundary/errors'

export function useNetwork(fallback?: 'mainnet' | 'testnet') {
  const { isConnected, chainId } = useAccount()

  if (!isConnected) {
    if (!fallback) {
      throw new AppError(AppErrors.WalletNotConnected)
    } else {
      return fallback
    }
  }

  if (chainId === 23294) {
    return 'mainnet'
  }

  if (chainId === 23295) {
    return 'testnet'
  }

  if (fallback) {
    return fallback
  }

  throw new AppError(AppErrors.UnsupportedChain)
}
