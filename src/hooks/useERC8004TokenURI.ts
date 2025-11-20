import { useEffect, useState } from 'react'
import { getTokenURI } from '../contracts/erc-8004.ts'

interface UseERC8004TokenURIReturnType {
  data: string | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useERC8004TokenURI(
  agentId: bigint | undefined,
  enabled = true,
): UseERC8004TokenURIReturnType {
  const [data, setData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTokenURI = async () => {
    if (!agentId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getTokenURI(agentId)

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch token URI'))
      console.error('Error fetching ERC-8004 token URI:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (enabled && agentId) {
      fetchTokenURI()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, enabled])

  return {
    data,
    isLoading,
    error,
    refetch: fetchTokenURI,
  }
}
