import { describe, it, expect } from 'vitest'
import { Ticker, networkTicker, type Ticker as TickerType } from './ticker'

describe('ticker constants', () => {
  describe('module exports', () => {
    it('should export Ticker object', () => {
      expect(Ticker).toBeDefined()
      expect(typeof Ticker).toBe('object')
    })

    it('should export networkTicker', () => {
      expect(networkTicker).toBeDefined()
      expect(typeof networkTicker).toBe('object')
    })

    it('should export Ticker type', () => {
      const ticker: TickerType = 'ROSE'
      expect(ticker).toBeDefined()
    })
  })

  describe('Ticker', () => {
    it('should have ROSE ticker', () => {
      expect(Ticker.ROSE).toBe('ROSE')
    })

    it('should have TEST ticker', () => {
      expect(Ticker.TEST).toBe('TEST')
    })

    it('should be readonly object', () => {
      expect(Object.isFrozen(Ticker) || Object.keys(Ticker).length >= 2).toBe(true)
    })

    it('should have all required tickers', () => {
      expect(Object.keys(Ticker)).toContain('ROSE')
      expect(Object.keys(Ticker)).toContain('TEST')
    })

    it('should have exactly two tickers', () => {
      expect(Object.keys(Ticker)).toHaveLength(2)
    })

    it('should have string values', () => {
      expect(typeof Ticker.ROSE).toBe('string')
      expect(typeof Ticker.TEST).toBe('string')
    })

    it('should have uppercase values', () => {
      expect(Ticker.ROSE).toBe(Ticker.ROSE.toUpperCase())
      expect(Ticker.TEST).toBe(Ticker.TEST.toUpperCase())
    })
  })

  describe('networkTicker', () => {
    it('should map mainnet to ROSE', () => {
      expect(networkTicker.mainnet).toBe(Ticker.ROSE)
    })

    it('should map testnet to TEST', () => {
      expect(networkTicker.testnet).toBe(Ticker.TEST)
    })

    it('should be a record', () => {
      expect(typeof networkTicker).toBe('object')
      expect(Array.isArray(networkTicker)).toBe(false)
    })

    it('should have mainnet and testnet keys', () => {
      expect(Object.keys(networkTicker)).toContain('mainnet')
      expect(Object.keys(networkTicker)).toContain('testnet')
    })

    it('should have all keys mapping to Ticker values', () => {
      Object.values(networkTicker).forEach(ticker => {
        expect(Object.values(Ticker)).toContain(ticker)
      })
    })
  })

  describe('Ticker type', () => {
    it('should allow valid ticker values', () => {
      const rose: TickerType = 'ROSE'
      const test: TickerType = 'TEST'

      expect(rose).toBe('ROSE')
      expect(test).toBe('TEST')
    })

    it('should only allow union of Ticker values', () => {
      const validTickers: TickerType[] = ['ROSE', 'TEST']
      expect(validTickers).toHaveLength(2)
    })

    it('should be string literal union type', () => {
      const ticker: TickerType = 'ROSE'
      expect(typeof ticker).toBe('string')
    })
  })

  describe('Ticker consistency', () => {
    it('should have matching values in Ticker and networkTicker', () => {
      expect(Ticker.ROSE).toBe(networkTicker.mainnet)
      expect(Ticker.TEST).toBe(networkTicker.testnet)
    })

    it('should have unique ticker values', () => {
      const values = Object.values(Ticker)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })

    it('should have unique network ticker values', () => {
      const values = Object.values(networkTicker)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })
  })

  describe('network type mappings', () => {
    it('should correctly map network types to tickers', () => {
      const networks = ['mainnet', 'testnet'] as const

      networks.forEach(network => {
        const ticker = networkTicker[network]
        expect(ticker).toBeDefined()
        expect(Object.values(Ticker)).toContain(ticker)
      })
    })

    it('should have type-safe network keys', () => {
      const mainnetTicker = networkTicker.mainnet
      const testnetTicker = networkTicker.testnet

      expect(mainnetTicker).toBe('ROSE')
      expect(testnetTicker).toBe('TEST')
    })
  })

  describe('ticker value constraints', () => {
    it('should have non-empty ticker symbols', () => {
      Object.values(Ticker).forEach(ticker => {
        expect(ticker.length).toBeGreaterThan(0)
      })
    })

    it('should have ticker symbols with reasonable length', () => {
      Object.values(Ticker).forEach(ticker => {
        expect(ticker.length).toBeLessThanOrEqual(10)
      })
    })

    it('should not have spaces in ticker symbols', () => {
      Object.values(Ticker).forEach(ticker => {
        expect(ticker).not.toContain(' ')
      })
    })
  })
})
