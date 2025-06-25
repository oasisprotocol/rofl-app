import { networkTicker } from '../constants/ticker'
import { useNetwork } from './useNetwork'

export function useTicker() {
  const network = useNetwork()
  return networkTicker[network]
}
