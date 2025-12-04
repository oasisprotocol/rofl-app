import { useEffect, type FC, type ReactNode } from 'react'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { AppCard } from '../AppCard'
import { GetRuntimeRoflApps } from '../../nexus/api'
import { useNetwork } from '../../hooks/useNetwork'
import { useInView } from 'react-intersection-observer'
import { useAccount } from 'wagmi'
import { useNexusInfiniteQuery } from '../../utils/useNexusInfiniteQuery'

type AppsListProps = {
  emptyState: ReactNode
  type: 'dashboard' | 'explore'
}

export const AppsList: FC<AppsListProps> = ({ emptyState, type }) => {
  const pageLimit = type === 'dashboard' ? 9 : 18
  const { address, isConnected } = useAccount()
  const { ref, inView } = useInView()
  // Fallback is needed to render Explore page content without wallet connection
  const network = useNetwork(type === 'dashboard' ? undefined : 'mainnet')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetched } =
    useNexusInfiniteQuery({
      queryKeyPrefix: 'rofl_apps',
      queryFn: GetRuntimeRoflApps,
      resultsField: 'rofl_apps',
      params: [
        network,
        'sapphire',
        {
          limit: pageLimit,
          admin: type === 'dashboard' ? address : undefined,
          sort_by: type === 'dashboard' ? 'created_at_desc' : undefined,
        },
      ],
      enabled: type === 'explore' || (type === 'dashboard' && isConnected),
    })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, inView])

  const allRoflApps = data?.pages.flatMap(page => page.data.rofl_apps) || []
  const isEmpty = (type === 'dashboard' && !isConnected) || (isFetched && allRoflApps.length === 0)

  return (
    <>
      {isEmpty && <>{emptyState}</>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: pageLimit }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[200px]" />
          ))}

        {allRoflApps.map(app => (
          <AppCard key={app.id} app={app} network={network} type={type} />
        ))}

        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`next-page-${index}`} className="w-full h-[200px]" />
          ))}
      </div>

      <div ref={ref} className="h-10 w-full" />
    </>
  )
}
