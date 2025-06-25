import BigNumber from 'bignumber.js'

export function fromBaseUnits(valueInBaseUnits: string, decimals = 18): string {
  const value = new BigNumber(valueInBaseUnits).shiftedBy(-decimals) // / 10 ** decimals
  if (value.isNaN()) {
    throw new Error(`Not a number in fromBaseUnits(${valueInBaseUnits})`)
  }
  return value.toFixed()
}

export const convertToNano = (value: string): string => fromBaseUnits(value, -9)

export function multiplyBaseUnits(valueInBaseUnits: string, multiplier: string | number): string {
  const baseValue = new BigNumber(valueInBaseUnits)
  const multiplierBN = new BigNumber(multiplier)

  if (baseValue.isNaN()) {
    throw new Error(`Invalid base units value: ${valueInBaseUnits}`)
  }

  if (multiplierBN.isNaN()) {
    throw new Error(`Invalid multiplier: ${multiplier}`)
  }

  const result = baseValue.multipliedBy(multiplierBN)

  return result.toFixed(0)
}
