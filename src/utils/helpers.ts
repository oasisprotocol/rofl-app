import * as oasisRT from '@oasisprotocol/client-rt'
import * as oasis from '@oasisprotocol/client'
import { sapphire, sapphireTestnet } from 'viem/chains'

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

export function getNetworkFromChainId(chainId: number | undefined): 'mainnet' | 'testnet' {
  if (chainId === sapphire.id) return 'mainnet'
  if (chainId === sapphireTestnet.id) return 'testnet'
  return 'mainnet'
}
