import { useState } from 'react'
import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { createSiweMessage } from 'viem/siwe'

export const useMachineAccess = (schedulerApi: string, provider: string, instance: string) => {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const chainId = useChainId()
  const [token, setToken] = useState<string | null>(null)

  const authenticateWithSiwe = async () => {
    const domain = new URL(schedulerApi).hostname
    const message = createSiweMessage({
      domain: domain,
      address: address!,
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
            signature: signature.slice(2), // Without the 0x prefix.,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Auth failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()

      if (result.token) {
        setToken(result.token)
      }

      return result
    } catch (error) {
      console.error('Authentication error:', error)
      throw error
    }
  }

  const fetchMachineLogs = async () => {
    let currentToken = token

    if (!currentToken) {
      const authResult = await authenticateWithSiwe()
      currentToken = authResult.token
    }

    if (!currentToken) {
      throw new Error('Authentication failed - no token available')
    }

    try {
      const response = await fetch(`${schedulerApi}/rofl-scheduler/v1/logs/get`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instance_id: instance,
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

  return { fetchMachineLogs }
}
