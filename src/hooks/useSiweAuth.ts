import { useState, useCallback } from 'react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import { useGetNonce, useLogin } from '../backend/api';

export function useSiweAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refetch: refetchNonce } = useGetNonce(
    isConnected ? address : undefined
  );
  const loginMutation = useLogin();
  const createSiweMessage = useCallback(
    (address: string, nonce: string, chainId: number): string => {
      const domain = location.hostname;
      const uri = location.host;
      const statement = `Sign in to ${domain}`;
      const version = '1';
      const issuedAt = new Date().toISOString();

      return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
    },
    []
  );

  const login = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: freshNonce } = await refetchNonce();
      if (!freshNonce) {
        throw new Error('Failed to fetch nonce');
      }

      const message = createSiweMessage(address, freshNonce, chainId || 1);
      const signature = await signMessageAsync({ message });

      const jwtToken = await loginMutation.mutateAsync({
        message,
        signature,
      });

      setToken(jwtToken);
      console.log('SIWE Authentication successful');
      return jwtToken;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    isConnected,
    refetchNonce,
    createSiweMessage,
    chainId,
    signMessageAsync,
    loginMutation,
  ]);

  const logout = useCallback(() => {
    setToken(null);
    setError(null);
    console.log('SIWE Authentication logged out');
  }, []);

  const isAuthenticated = !!token;

  return {
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
    token,
  };
}
