import { type FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { RoflInstance } from '../../../nexus/generated/api.ts'
import { useERC8004TokenURI } from '../../../hooks/useERC8004TokenURI.ts'
import { fromMetadataToAgentId, tokenURIToLink } from '../../../utils/rofl-8004.ts'
import { CodeDisplay } from '../../../components/CodeDisplay'

type Props = {
  roflInstances: RoflInstance[]
}

export const AppERC8004: FC<Props> = ({ roflInstances }) => {
  const [instance] = roflInstances
  const [chainId, tokenId] = fromMetadataToAgentId(instance.metadata)
  const {
    isLoading: isLoadingTokenURI,
    data: tokenURI,
    error: tokenURIError,
  } = useERC8004TokenURI(chainId!, tokenId!, !!chainId && !!tokenId)

  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useQuery({
    queryKey: ['erc8004-metadata', tokenURI],
    queryFn: async () => {
      if (!tokenURI) throw new Error('No tokenURI available')
      const httpLink = tokenURIToLink(tokenURI)
      const response = await axios.get(httpLink)
      return response.data
    },
    enabled: !!tokenURI,
  })

  const isLoading = isLoadingTokenURI || isLoadingMetadata
  const error = tokenURIError || metadataError

  return (
    <div className="space-y-6">
      {isLoading && <Skeleton className="w-full h-[400px]" />}
      {!isLoading && (
        <>
          {metadata && (
            <div>
              <h3 className="text-lg font-semibold mb-2">ERC-8004 Metadata</h3>
              <CodeDisplay data={JSON.stringify(metadata, null, '\t')} language="json" />
            </div>
          )}
          {error && <div className="text-red-500">Error loading metadata: {error.message}</div>}
        </>
      )}
    </div>
  )
}
