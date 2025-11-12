import type { GetBalanceReturnType } from 'wagmi/actions'
import { NumberUtils } from './number.utils.ts'

export abstract class FormatUtils {
  static formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  static formatTokenAmount(tokenAmount: { amount: string; decimals: number; symbol: string } | null): string {
    if (!tokenAmount || !tokenAmount.amount || tokenAmount.amount === '0') return '-/-'

    return NumberUtils.formatTokenAmountWithSymbol(
      tokenAmount.amount,
      tokenAmount.decimals,
      tokenAmount.symbol,
      6,
    )
  }

  static formatBalance(balance: GetBalanceReturnType | null, isLoading?: boolean): string {
    if (isLoading) return 'Loading...'
    if (!balance) return '-/-'
    return balance.formatted
  }

  static formatNumberInput(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, '')
    const parts = cleaned.replace(',', '.').split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    return cleaned
  }

  static formatLoadingState(
    isLoading: boolean | undefined,
    value: string,
    loadingText = 'Loading...',
  ): string {
    return isLoading ? loadingText : value
  }
}
