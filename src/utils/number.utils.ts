import { BigNumber } from 'bignumber.js'

export abstract class NumberUtils {
  static formatTokenAmount(amount: string, decimals: number = 18, displayDecimals = 6): string {
    if (!amount || amount === '0') return '0'

    return BigNumber(amount)
      .dividedBy(BigNumber(10).pow(decimals))
      .dp(displayDecimals, BigNumber.ROUND_DOWN)
      .toString()
  }

  static formatTokenAmountWithSymbol(
    amount: string,
    decimals: number = 18,
    symbol: string = 'ROSE',
    displayDecimals = 6,
  ): string {
    const formatted = this.formatTokenAmount(amount, decimals, displayDecimals)
    const cleanFormatted = BigNumber(formatted).toString() // Remove trailing zeros
    return `${cleanFormatted} ${symbol}`
  }

  static expandAmount(amount: string, decimals: number = 18): string {
    if (!amount || amount === '0') return '0'

    return BigNumber(amount)
      .multipliedBy(BigNumber(10).pow(decimals))
      .integerValue(BigNumber.ROUND_DOWN)
      .toFixed(0)
  }

  static calculateGasFee(gasLimit: string | number, gasPrice: bigint): string {
    const gasFeeWei = BigNumber(gasPrice.toString()).multipliedBy(gasLimit.toString())
    return gasFeeWei.toString()
  }

  static formatGasFee(
    gasLimit: string | number,
    gasPrice: bigint,
    decimals: number,
    displayDecimals = 6,
  ): string {
    const gasFeeWei = this.calculateGasFee(gasLimit, gasPrice)
    return this.formatTokenAmount(gasFeeWei, decimals, displayDecimals)
  }

  static formatGasFeeWithSymbol(
    gasLimit: string | number,
    gasPrice: bigint,
    nativeSymbol: string = '',
    decimals: number = 18,
    displayDecimals = 6,
  ): string {
    const formatted = this.formatGasFee(gasLimit, gasPrice, decimals, displayDecimals)
    return `${formatted}${nativeSymbol ? ` ${nativeSymbol}` : ''}`
  }

  static add(amount1: string, amount2: string): string {
    return BigNumber(amount1).plus(BigNumber(amount2)).toFixed(0)
  }

  static compareAmounts(amount1: string, amount2: string): number | null {
    return BigNumber(amount1).comparedTo(BigNumber(amount2))
  }

  static isGreaterThan(amount1: string, amount2: string): boolean {
    return BigNumber(amount1).isGreaterThan(BigNumber(amount2))
  }

  static isLessThan(amount1: string, amount2: string): boolean {
    return BigNumber(amount1).isLessThan(BigNumber(amount2))
  }

  static isGreaterThanOrEqual(amount1: string, amount2: string): boolean {
    return BigNumber(amount1).isGreaterThanOrEqualTo(BigNumber(amount2))
  }

  static isZero(amount: string): boolean {
    return BigNumber(amount).isZero()
  }

  static isValidAmount(amount: string): boolean {
    const bn = BigNumber(amount)
    return bn.isFinite() && !bn.isNaN() && bn.isPositive() && !this.isZero(amount)
  }
}
