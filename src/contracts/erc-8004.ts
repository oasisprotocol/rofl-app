import ERC_8004_ABI from './ERC-8004_ABI.json'
import { ROFL_8004_SUPPORTED_CHAINS } from '../constants/rofl-8004.ts'
import { createPublicClient, http } from 'viem'

export const getMetadata = async (
  chainId: number | string,
  agentId: bigint,
  key?: string,
): Promise<`0x${string}`> => {
  const supportedNetwork = ROFL_8004_SUPPORTED_CHAINS[chainId.toString()]

  try {
    return (await createPublicClient({
      chain: supportedNetwork.chain,
      transport: http(supportedNetwork.rpcUrl[0]),
    }).readContract({
      address: supportedNetwork.identityContract as `0x${string}`,
      abi: ERC_8004_ABI,
      functionName: 'getMetadata',
      args: [agentId, key],
    })) as `0x${string}`
  } catch (error) {
    console.error(`Error fetching metadata for agent ${agentId}`, error)
    throw error
  }
}

export const getTokenURI = async (chainId: number | string, agentId: bigint): Promise<string> => {
  const supportedNetwork = ROFL_8004_SUPPORTED_CHAINS[chainId.toString()]

  try {
    return (await createPublicClient({
      chain: supportedNetwork.chain,
      transport: http(supportedNetwork.rpcUrl[0]),
    }).readContract({
      address: supportedNetwork.identityContract as `0x${string}`,
      abi: ERC_8004_ABI,
      functionName: 'tokenURI',
      args: [agentId],
    })) as string
  } catch (error) {
    console.error(`Error fetching tokenURI for agent ${agentId}:`, error)
    throw error
  }
}
