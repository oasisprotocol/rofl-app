import { useAccount } from 'wagmi';

export function useNetwork(fallback): 'mainnet' | 'testnet' {
  const { chainId } = useAccount();

  if (chainId === 23294) {
    return 'mainnet';
  }

  if (chainId === 23295) {
    return 'testnet';
  }

  if (fallback) {
    return fallback;
  }

  throw new Error(`Unsupported chainId: ${chainId}.`);
}
