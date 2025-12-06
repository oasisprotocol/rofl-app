import { RoflMarketInstance } from '../nexus/api'
import * as oasis from '@oasisprotocol/client'
import { getEvmBech32Address } from './helpers'

export function hasViewLogsPermission(machine: RoflMarketInstance, account: `0x${string}`) {
  const metadata = machine.deployment?.metadata as undefined | { 'net.oasis.scheduler.permissions'?: string }
  if (!metadata?.['net.oasis.scheduler.permissions']) return false

  const oasisAddress = getEvmBech32Address(account)
  // Parse oWhsb2cudmlld4FVABUafBL3j0oDGd4HRygbj5UK92DG to { log.view: [oasis1qq235lqj77855qcemcr5w2qm372s4amqcc4v3ztc] }
  const permissions = oasis.misc.fromCBOR(
    oasis.misc.fromBase64(metadata['net.oasis.scheduler.permissions']),
  ) as { 'log.view'?: Uint8Array[] }

  return permissions['log.view']?.find(a => oasis.staking.addressToBech32(a) === oasisAddress)
}
