export type Ticker = (typeof Ticker)[keyof typeof Ticker]

export const Ticker = {
  ROSE: 'ROSE',
  TEST: 'TEST',
} as const

export const networkTicker: Record<string, Ticker> = {
  mainnet: Ticker.ROSE,
  testnet: Ticker.TEST,
}
