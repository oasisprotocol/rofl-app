import { RoflMarketInstance } from '../../nexus/api'
import * as oasisRT from '@oasisprotocol/client-rt'

export function isMachineRemoved(machine: RoflMarketInstance) {
  return machine.removed || machine.status === oasisRT.types.RoflmarketInstanceStatus.CANCELLED
}
