import { type FC, useEffect } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { ExploreEmptyState } from './emptyState';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNetwork } from '../../hooks/useNetwork';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { AppCard } from '../../components/AppCard';

import {
  getGetRuntimeRoflAppsQueryKey,
  GetRuntimeRoflApps,
} from '../../nexus/api';
import { useInView } from 'react-intersection-observer';

const pageLimit = 18;

export const Explore: FC = () => {
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
    queryKey: [...getGetRuntimeRoflAppsQueryKey(network, 'sapphire')],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await GetRuntimeRoflApps(network, 'sapphire', {
        limit: pageLimit,
        offset: pageParam,
      });
      return result;
    },
    initialPageParam: 0,
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
  const isEmpty = isFetched && allRoflApps.length === 0;

  return (
    <MainLayout>
      {isEmpty && <ExploreEmptyState />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: pageLimit }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[200px]" />
          ))}

        {allRoflApps.map((app) => (
          <AppCard key={app.id} app={app} network={network} type="explore" />
        ))}

        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`next-page-${index}`} className="w-full h-[200px]" />
          ))}
      </div>

      <div ref={ref} className="h-10 w-full" />
    </MainLayout>
  );
};
