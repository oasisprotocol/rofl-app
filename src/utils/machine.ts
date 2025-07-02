import { hexToNumber } from 'viem'

export const convertMachineId = (hexId: string) => {
  try {
    const normalizedHex = hexId.startsWith('0x') ? hexId : `0x${hexId}`
    const numericId = hexToNumber(normalizedHex as `0x${string}`)

    return numericId.toString()
  } catch (error) {
    console.error('Error converting machine ID:', error)
  }
}
