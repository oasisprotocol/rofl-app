import axios from 'axios'
import type { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'

type GetRosePriceResponse = {
  'oasis-network': { usd: number }
}

const staleTime = 1000 * 60 * 3 // 3 minutes

export function useGetRosePrice() {
  return useQuery<number, AxiosError<unknown>>({
    queryKey: ['rosePrice'],
    queryFn: () =>
      axios
        .get<GetRosePriceResponse>('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: 'oasis-network',
            vs_currencies: 'usd',
          },
        })
        .then(({ data }) => data['oasis-network'].usd),
    staleTime,
    throwOnError: false,
  })
}
