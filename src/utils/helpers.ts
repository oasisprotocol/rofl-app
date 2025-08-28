import * as oasisRT from '@oasisprotocol/client-rt'
import * as oasis from '@oasisprotocol/client'

export function getEvmBech32Address(evmAddress: `0x${string}`) {
  return oasisRT.address.toBech32(getOasisAddressBytesFromEvm(evmAddress))
}

export function getOasisAddressBytesFromEvm(evmAddress: `0x${string}`) {
  const evmBytes = oasis.misc.fromHex(evmAddress.replace('0x', ''))
  const address = oasis.address.fromData(
    oasisRT.address.V0_SECP256K1ETH_CONTEXT_IDENTIFIER,
    oasisRT.address.V0_SECP256K1ETH_CONTEXT_VERSION,
    evmBytes,
  )

  return address
}
