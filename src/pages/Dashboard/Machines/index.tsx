import { useEffect, type FC } from 'react';
import { MachinesEmptyState } from './emptyState';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useAccount } from 'wagmi';
import { useNetwork } from '../../../hooks/useNetwork';
import {
  getGetRuntimeRoflAppsQueryKey,
  GetRuntimeRoflmarketProviders,
} from '../../../nexus/api';
import { MachineCard } from '../../../components/MachineCard';

const pageLimit = 9;

export const Machines: FC = () => {
  const { isConnected } = useAccount();
  const { ref, inView } = useInView();
  const network = useNetwork();

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
      const result = await GetRuntimeRoflmarketProviders(network, 'sapphire', {
        limit: pageLimit,
        offset: pageParam,
      });
      return result;
    },
    initialPageParam: 0,
    enabled: isConnected,
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

  const allRoflProviders =
    data?.pages.flatMap((page) => page.data.providers) || [];
  const isEmpty = isFetched && allRoflProviders.length === 0;

  return (
    <>
      {isEmpty && <MachinesEmptyState />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: pageLimit }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[200px]" />
          ))}

        {allRoflProviders.map((machine) => (
          <MachineCard
            key={machine.address}
            machine={machine}
            network={network}
          />
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
