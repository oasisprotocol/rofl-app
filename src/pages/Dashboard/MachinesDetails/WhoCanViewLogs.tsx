import { type FC } from 'react'
import * as oasis from '@oasisprotocol/client'
import type { RoflMarketInstance } from '../../../nexus/api'

export const WhoCanViewLogs: FC<{
  machine: RoflMarketInstance
}> = ({ machine }) => {
  const metadata = machine.deployment?.metadata as undefined | { 'net.oasis.scheduler.permissions'?: string }

  try {
    const permissions = metadata?.['net.oasis.scheduler.permissions'] ? oasis.misc.fromCBOR(
      oasis.misc.fromBase64(metadata['net.oasis.scheduler.permissions']),
    ) as { 'log.view'?: Uint8Array[] } : {}

    const viewAccounts = permissions['log.view'] || []
    return (
      <div className="space-y-1">
        {/* TODO: "anyone" if policy allows others to run a machine */}
        <div className="text-sm">Admin</div>
        <div className="text-sm">Node provider</div>
        {viewAccounts.map((addressBytes, index) => (
          <div key={index} className="text-sm">
            {oasis.staking.addressToBech32(addressBytes)}
          </div>
        ))}
      </div>
    )
  } catch (err) {
    console.error('Failed to parse permissions:', err)
    return <span className="text-muted-foreground">Admin and node provider</span>
  }
}
