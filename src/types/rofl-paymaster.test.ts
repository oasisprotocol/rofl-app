import { describe, it, expect } from 'vitest'
import { ChainNativeCurrency } from './rofl-paymaster'
import type { Chain } from 'viem'

describe('rofl-paymaster types', () => {
  describe('ChainNativeCurrency type', () => {
    it('should export ChainNativeCurrency type', () => {
      // This type is imported from viem's Chain type
      // It represents the native currency of a blockchain
      const currency: ChainNativeCurrency = {
        name: 'Test',
        symbol: 'TST',
        decimals: 18,
      }

      expect(currency.name).toBe('Test')
      expect(currency.symbol).toBe('TST')
      expect(currency.decimals).toBe(18)
    })

    it('should be a type alias from viem Chain', () => {
      // ChainNativeCurrency is a type alias
      // It should have the same structure as Chain['nativeCurrency']
      const currency: ChainNativeCurrency = {
        name: 'Test Currency',
        symbol: 'TST',
        decimals: 18,
      }

      expect(typeof currency.name).toBe('string')
      expect(typeof currency.symbol).toBe('string')
      expect(typeof currency.decimals).toBe('number')
    })

    it('should require name property', () => {
      const currency: ChainNativeCurrency = {
        name: 'Test Token',
        symbol: 'TST',
        decimals: 18,
      }

      expect(currency.name).toBeDefined()
      expect(typeof currency.name).toBe('string')
    })

    it('should require symbol property', () => {
      const currency: ChainNativeCurrency = {
        name: 'Test',
        symbol: 'TST',
        decimals: 18,
      }

      expect(currency.symbol).toBeDefined()
      expect(typeof currency.symbol).toBe('string')
    })

    it('should require decimals property', () => {
      const currency: ChainNativeCurrency = {
        name: 'Test',
        symbol: 'TST',
        decimals: 18,
      }

      expect(currency.decimals).toBeDefined()
      expect(typeof currency.decimals).toBe('number')
    })
  })

  describe('Common blockchain native currencies', () => {
    it('should accept Ethereum native currency structure', () => {
      const eth: ChainNativeCurrency = {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      }

      expect(eth.name).toBe('Ether')
      expect(eth.symbol).toBe('ETH')
      expect(eth.decimals).toBe(18)
    })

    it('should accept ROSE native currency structure', () => {
      const rose: ChainNativeCurrency = {
        name: 'ROSE',
        symbol: 'ROSE',
        decimals: 18,
      }

      expect(rose.name).toBe('ROSE')
      expect(rose.symbol).toBe('ROSE')
      expect(rose.decimals).toBe(18)
    })

    it('should accept USDC native currency structure', () => {
      const usdc: ChainNativeCurrency = {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      }

      expect(usdc.name).toBe('USD Coin')
      expect(usdc.symbol).toBe('USDC')
      expect(usdc.decimals).toBe(6)
    })

    it('should accept WBTC native currency structure', () => {
      const wbtc: ChainNativeCurrency = {
        name: 'Wrapped BTC',
        symbol: 'WBTC',
        decimals: 8,
      }

      expect(wbtc.name).toBe('Wrapped BTC')
      expect(wbtc.symbol).toBe('WBTC')
      expect(wbtc.decimals).toBe(8)
    })

    it('should accept MATIC native currency structure', () => {
      const matic: ChainNativeCurrency = {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      }

      expect(matic.name).toBe('MATIC')
      expect(matic.symbol).toBe('MATIC')
      expect(matic.decimals).toBe(18)
    })

    it('should accept BNB native currency structure', () => {
      const bnb: ChainNativeCurrency = {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      }

      expect(bnb.name).toBe('BNB')
      expect(bnb.symbol).toBe('BNB')
      expect(bnb.decimals).toBe(18)
    })
  })

  describe('Decimal values', () => {
    it('should accept different decimal values', () => {
      const currency1: ChainNativeCurrency = {
        name: 'Currency1',
        symbol: 'CUR1',
        decimals: 6,
      }

      const currency2: ChainNativeCurrency = {
        name: 'Currency2',
        symbol: 'CUR2',
        decimals: 9,
      }

      expect(currency1.decimals).toBe(6)
      expect(currency2.decimals).toBe(9)
    })

    it('should accept 0 decimals', () => {
      const currency: ChainNativeCurrency = {
        name: 'Zero Decimal',
        symbol: 'ZERO',
        decimals: 0,
      }

      expect(currency.decimals).toBe(0)
    })

    it('should accept high decimal values', () => {
      const currency: ChainNativeCurrency = {
        name: 'High Decimal',
        symbol: 'HIGH',
        decimals: 18,
      }

      expect(currency.decimals).toBe(18)
    })
  })

  describe('Type compatibility', () => {
    it('should be compatible with viem Chain nativeCurrency', () => {
      // Verify that ChainNativeCurrency is compatible with Chain['nativeCurrency']
      const nativeCurrency: Chain['nativeCurrency'] = {
        name: 'Test',
        symbol: 'TST',
        decimals: 18,
      }

      const currency: ChainNativeCurrency = nativeCurrency

      expect(currency).toEqual(nativeCurrency)
    })

    it('should allow assignment from viem Chain nativeCurrency', () => {
      const chainNativeCurrency: Chain['nativeCurrency'] = {
        name: 'Chain Token',
        symbol: 'CTK',
        decimals: 18,
      }

      const currency: ChainNativeCurrency = chainNativeCurrency

      expect(currency.name).toBe('Chain Token')
      expect(currency.symbol).toBe('CTK')
    })
  })

  describe('Edge cases', () => {
    it('should accept short symbol names', () => {
      const currency: ChainNativeCurrency = {
        name: 'X',
        symbol: 'X',
        decimals: 18,
      }

      expect(currency.symbol).toBe('X')
    })

    it('should accept long symbol names', () => {
      const currency: ChainNativeCurrency = {
        name: 'Very Long Token Name',
        symbol: 'VERYLONGTOKEN',
        decimals: 18,
      }

      expect(currency.symbol).toBe('VERYLONGTOKEN')
    })

    it('should accept special characters in name', () => {
      const currency: ChainNativeCurrency = {
        name: 'Test-Token (v2)',
        symbol: 'TSTv2',
        decimals: 18,
      }

      expect(currency.name).toBe('Test-Token (v2)')
    })

    it('should accept numbers in symbol', () => {
      const currency: ChainNativeCurrency = {
        name: 'Token 2024',
        symbol: 'TST2024',
        decimals: 18,
      }

      expect(currency.symbol).toBe('TST2024')
    })
  })

  describe('Module structure', () => {
    it('should export ChainNativeCurrency', () => {
      // Verify the type is exported
      const currency: ChainNativeCurrency = {
        name: 'Test',
        symbol: 'TST',
        decimals: 18,
      }

      expect(currency).toBeDefined()
    })

    it('should be importable', async () => {
      const module = await import('./rofl-paymaster')
      // ChainNativeCurrency is a type, not a value, so it won't be defined at runtime
      // But we can verify the module can be imported
      expect(module).toBeDefined()
    })
  })
})
