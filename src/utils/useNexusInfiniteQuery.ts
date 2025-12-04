import { useInfiniteQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { List } from '../nexus/api'

/** Strictly typed, correctly puts params in queryKey, and paginates using total_count */
export function useNexusInfiniteQuery<
  T extends unknown[],
  ResultsField extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Params extends any[],
>({
  queryKeyPrefix,
  queryFn,
  resultsField,
  params,
  enabled,
}: {
  queryKeyPrefix: string
  queryFn: (...params: Params) => Promise<AxiosResponse<List & { [k in ResultsField]: T }, unknown, unknown>>
  resultsField: ResultsField
  params: Params
  enabled?: boolean
}) {
  if (!params.find(p => (p as { limit?: number } | undefined)?.limit))
    throw new Error('Expected some param to specify page "limit"')
  if (params.find(p => (p as { offset?: number } | undefined)?.offset))
    throw new Error('Unexpected param "offset" - it will be added automatically')

  return useInfiniteQuery({
    queryKey: ['infinite', queryKeyPrefix, params],
    queryFn: ({ pageParam = 0 }) => {
      const paramsWithOffset = params.map(p =>
        (p as { limit?: number } | undefined)?.limit ? { ...p, offset: pageParam } : p,
      ) as Params
      return queryFn(...paramsWithOffset)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.data[resultsField].length, 0)
      return lastPage.data[resultsField].length < lastPage.data.total_count ? totalFetched : undefined
    },
    enabled: enabled,
  })
}
