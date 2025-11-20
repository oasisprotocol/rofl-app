import ERC_8004_ABI from './ERC-8004_ABI.json'
import { ROFL_8004_AGENT_IDENTITY_CONTRACT, ROFL_8004_PUBLIC_CLIENT } from '../constants/rofl-8004.ts'

export const getMetadata = async (agentId: bigint, key?: string): Promise<`0x${string}`> => {
  try {
    return (await ROFL_8004_PUBLIC_CLIENT.readContract({
      address: ROFL_8004_AGENT_IDENTITY_CONTRACT,
      abi: ERC_8004_ABI,
      functionName: 'getMetadata',
      args: [agentId, key],
    })) as `0x${string}`
  } catch (error) {
    console.error(`Error fetching metadata for agent ${agentId}`, error)
    throw error
  }
}

export const getTokenURI = async (agentId: bigint): Promise<string> => {
  try {
    return (await ROFL_8004_PUBLIC_CLIENT.readContract({
      address: ROFL_8004_AGENT_IDENTITY_CONTRACT,
      abi: ERC_8004_ABI,
      functionName: 'tokenURI',
      args: [agentId],
    })) as string
  } catch (error) {
    console.error(`Error fetching tokenURI for agent ${agentId}:`, error)
    throw error
  }
}
