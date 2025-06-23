import { useEffect, type FC, type ReactNode } from 'react';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { AppCard } from '../AppCard';
import {
  getGetRuntimeRoflAppsQueryKey,
  GetRuntimeRoflApps,
} from '../../nexus/api';
import { useNetwork } from '../../hooks/useNetwork';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useAccount } from 'wagmi';

type AppsListProps = {
  emptyState: ReactNode;
  type: 'dashboard' | 'explore';
};

export const AppsList: FC<AppsListProps> = ({ emptyState, type }) => {
  const pageLimit = type === 'dashboard' ? 9 : 18;
  const { address, isConnected } = useAccount();
  const { ref, inView } = useInView();
  const network = useNetwork('mainnet');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetched,
  } = useInfiniteQuery({
    queryKey: [...getGetRuntimeRoflAppsQueryKey(network, 'sapphire'), type],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await GetRuntimeRoflApps(network, 'sapphire', {
        limit: pageLimit,
        offset: pageParam,
        // admin: type === 'dashboard' ? address : undefined,
      });
      return result;
    },
    initialPageParam: 0,
    enabled: type === 'explore' || (type === 'dashboard' && isConnected),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * pageLimit;
      return totalFetched < lastPage.data.total_count
        ? totalFetched
        : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, inView]);

  const allRoflApps = data?.pages.flatMap((page) => page.data.rofl_apps) || [];
  const isEmpty =
    (type === 'dashboard' && !isConnected) ||
    (isFetched && allRoflApps.length === 0);

  return (
    <>
      {isEmpty && <>{emptyState}</>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: pageLimit }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[200px]" />
          ))}

        {allRoflApps.map((app) => (
          <AppCard key={app.id} app={app} network={network} type={type} />
        ))}

        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`next-page-${index}`} className="w-full h-[200px]" />
          ))}
      </div>

      <div ref={ref} className="h-10 w-full" />
    </>
  );
};
