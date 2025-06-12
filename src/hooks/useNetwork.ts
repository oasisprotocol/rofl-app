import { useAccount } from 'wagmi';

export function useNetwork(): 'mainnet' | 'testnet' {
  const { chainId } = useAccount();

  if (chainId === 23294) {
    return 'mainnet';
  }

  if (chainId === 23295) {
    return 'testnet';
  }

  throw new Error(`Unsupported chainId: ${chainId}.`);
}
