import * as oasisRT from '@oasisprotocol/client-rt'
import * as oasis from '@oasisprotocol/client'
import { sapphire, sapphireTestnet } from 'viem/chains'
import { toChecksumAddress } from '@ethereumjs/util'
import type { AddressPreimage } from '../nexus/api'

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

// Convert data from base64 to hex
export const base64ToHex = (base64Data: string): string =>
  `0x${Buffer.from(base64Data, 'base64').toString('hex')}`

// Convert address from base64 to hex, add prefix, and convert to checksum address
export function getEthAccountAddressFromBase64(base64Address: string): string {
  return toChecksumAddress(base64ToHex(base64Address))
}

export function getEthAccountAddressFromPreimage(preimage: AddressPreimage | undefined): string | undefined {
  if (preimage?.context !== 'oasis-runtime-sdk/address: secp256k1eth' || !preimage.address_data) {
    // We can only determine the ETH address if there was a preimage,
    // and the generation context was secp256k1eth
    return undefined
  }
  // We need to convert from base64 to hex, add the prefix, and convert to checksum address
  return getEthAccountAddressFromBase64(preimage.address_data)
}

export function getNetworkFromChainId(chainId: number | undefined): 'mainnet' | 'testnet' {
  if (chainId === sapphire.id) return 'mainnet'
  if (chainId === sapphireTestnet.id) return 'testnet'
  return 'mainnet'
}

export function getOasisAddressFromBase64PublicKey(key: string) {
  const keyBytes = new Uint8Array(Buffer.from(key, 'base64'))
  return oasis.staking.addressToBech32(oasis.staking.addressFromPublicKey(keyBytes))
}
