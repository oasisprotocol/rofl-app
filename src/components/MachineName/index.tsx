import { type FC } from 'react'
import { type RoflMarketInstance } from '../../nexus/api'

import { convertMachineId } from '../../utils/machine'
import { WHITELISTED_PROVIDER_ADDRESSES } from '../../utils/providers'
import { trimLongString } from '../../utils/trimLongString'

type MachineNameProps = {
  machine: RoflMarketInstance
  network: 'mainnet' | 'testnet'
}

export const MachineName: FC<MachineNameProps> = ({ machine, network }) => {
  const machineNumber = convertMachineId(machine.id)
  const isOpfProvider = WHITELISTED_PROVIDER_ADDRESSES[network] === machine.provider

  return (
    <>
      {!isOpfProvider && (
        <>{machine.metadata?.['net.oasis.provider.name'] || trimLongString(machine.provider)}</>
      )}
      {/* We don't want to show names available in metadata for now */}
      {isOpfProvider && network === 'mainnet' && <>OPF</>}
      {isOpfProvider && network === 'testnet' && <>OPF Testnet</>}
      {machineNumber && <>-{machineNumber}</>}
    </>
  )
}
