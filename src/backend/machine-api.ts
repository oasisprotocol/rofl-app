import { useState } from 'react'
import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { createSiweMessage } from 'viem/siwe'
import { useMutation, useQuery } from '@tanstack/react-query'

type AuthenticateResponse = {
  token: string
}

type FetchLogsRequest = {
  schedulerApi: string
  instance: string
  token: string
}

const fetchMachineLogs = async ({ schedulerApi, instance, token }: FetchLogsRequest): Promise<string[]> => {
  try {
    const response = await fetch(`${schedulerApi}/rofl-scheduler/v1/logs/get`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // https://github.com/oasisprotocol/oasis-sdk/blob/b45c059/rofl-scheduler/src/serverd/routes.rs#L12-L18
      body: JSON.stringify({
        instance_id: instance,
        // component_id
        // since
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Fetch logs failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    return result.logs || []
  } catch (error) {
    console.error('Fetch logs error:', error)
    throw error
  }
}

export function useMachineAuth(schedulerApi: string | undefined, provider: string) {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const chainId = useChainId()

  return useMutation<AuthenticateResponse, Error, void>({
    mutationFn: async () => {
      if (!address) {
        throw new Error('No wallet address available')
      }
      if (!schedulerApi) {
        throw new Error('Missing schedulerApi')
      }

      const domain = new URL(schedulerApi).hostname
      const message = createSiweMessage({
        domain: location.hostname,
        address: address,
        statement: `Authenticate to ROFL provider ${provider} to manage your machines via API at ${domain}.`,
        uri: schedulerApi,
        version: '1',
        chainId: chainId,
        issuedAt: new Date(),
        expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour
        nonce: Math.random().toString(36).substring(2, 15), // Does not matter
      })

      const signature = await signMessageAsync({ message })

      try {
        const response = await fetch(`${schedulerApi}/rofl-scheduler/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'siwe',
            data: {
              message,
              signature: signature.slice(2), // Without the 0x prefix
            },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Auth failed: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const result = await response.json()

        if (!result.token) {
          throw new Error('No token received from authentication')
        }

        return { token: result.token }
      } catch (error) {
        console.error('Authentication error:', error)
        throw error
      }
    },
    throwOnError: false,
  })
}

export function useFetchLogs(schedulerApi: string | undefined, instance: string, token: string | null) {
  return useQuery<string[], Error>({
    queryKey: [schedulerApi, instance, token],
    queryFn: async () => {
      return await fetchMachineLogs({ schedulerApi: schedulerApi!, instance: instance, token: token! })
    },
    enabled: !!token && !!schedulerApi,
    throwOnError: false,
    refetchInterval: 10_000,
  })
}

export function useMachineAccess(schedulerApi: string | undefined, provider: string, instance: string) {
  const [token, setToken] = useState<string | null>(null)
  const authMutation = useMachineAuth(schedulerApi, provider)
  const fetchLogsQuery = useFetchLogs(schedulerApi, instance, token)

  const startFetchingMachineLogs = async () => {
    let currentToken = token

    if (!currentToken) {
      const authResult = await authMutation.mutateAsync()
      currentToken = authResult.token
      setToken(currentToken)
    }

    if (!currentToken) {
      throw new Error('Authentication failed - no token available')
    }

    await new Promise(r => setTimeout(r, 10))
    fetchLogsQuery.refetch()
  }

  return {
    startFetchingMachineLogs,
    isAuthenticating: authMutation.isPending,
    isLoadingLogs: fetchLogsQuery.isFetching,
    token,
    logs: fetchLogsQuery.data ?? [],
  }
}
