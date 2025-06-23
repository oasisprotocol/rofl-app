import BigNumber from 'bignumber.js';

export function fromBaseUnits(
  valueInBaseUnits: string,
  decimals: number
): string {
  const value = new BigNumber(valueInBaseUnits).shiftedBy(-decimals); // / 10 ** decimals
  if (value.isNaN()) {
    throw new Error(`Not a number in fromBaseUnits(${valueInBaseUnits})`);
  }
  return value.toFixed();
}

export const convertToNano = (value: string): string =>
  fromBaseUnits(value, -9);
