import { type FC } from 'react'
import * as oasis from '@oasisprotocol/client'
import type { RoflMarketInstance } from '../../../nexus/api'
import { useGetRuntimeAccountsAddress } from '../../../nexus/api'
import { useNetwork } from '../../../hooks/useNetwork'
import { getEthAccountAddressFromPreimage } from '../../../utils/helpers'

const DisplayEvmAddressFromOasis1: FC<{
  oasisAddress: string
}> = ({ oasisAddress }) => {
  const network = useNetwork()
  const accountQuery = useGetRuntimeAccountsAddress(network, 'sapphire', oasisAddress, {
    // @ts-expect-error Incorrect type demands queryKey
    query: {
      enabled: !!oasisAddress,
    },
  })

  const evmAddress = accountQuery.data?.data?.address_preimage
    ? getEthAccountAddressFromPreimage(accountQuery.data.data.address_preimage)
    : undefined

  if (!evmAddress) {
    return <div className="text-sm">{oasisAddress} - couldn't find corresponding 0x... EVM address</div>
  }
  return <div className="text-sm">{evmAddress}</div>
}

export const WhoCanViewLogs: FC<{
  machine: RoflMarketInstance
}> = ({ machine }) => {
  const metadata = machine.deployment?.metadata as undefined | { 'net.oasis.scheduler.permissions'?: string }

  try {
    const permissions = metadata?.['net.oasis.scheduler.permissions']
      ? (oasis.misc.fromCBOR(oasis.misc.fromBase64(metadata['net.oasis.scheduler.permissions'])) as {
          'log.view'?: Uint8Array[]
        })
      : {}

    const viewAccounts = permissions['log.view'] || []
    return (
      <div className="space-y-1">
        {/* TODO: "anyone" if policy allows others to run a machine */}
        <div className="text-sm">Admin</div>
        <div className="text-sm">Node provider</div>
        {viewAccounts.map((addressBytes, index) => (
          <DisplayEvmAddressFromOasis1
            key={index}
            oasisAddress={oasis.staking.addressToBech32(addressBytes)}
          />
        ))}
      </div>
    )
  } catch (err) {
    console.error('Failed to parse permissions:', err)
    return <span className="text-muted-foreground">Admin and node provider</span>
  }
}
