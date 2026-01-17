import { describe, it, expect } from 'vitest'
import { FAUCET_URL, ROSE_APP_URL } from './global'

describe('global constants', () => {
  describe('module exports', () => {
    it('should export FAUCET_URL', () => {
      expect(FAUCET_URL).toBeDefined()
    })

    it('should export ROSE_APP_URL', () => {
      expect(ROSE_APP_URL).toBeDefined()
    })

    it('should export all constants', () => {
      // Verify all expected exports are present
      expect(typeof FAUCET_URL).toBe('string')
      expect(typeof ROSE_APP_URL).toBe('string')
    })
  })

  describe('FAUCET_URL', () => {
    it('should have correct faucet URL', () => {
      expect(FAUCET_URL).toBe('https://faucet.testnet.oasis.io/')
    })

    it('should be a valid URL', () => {
      expect(() => new URL(FAUCET_URL)).not.toThrow()
    })

    it('should use HTTPS protocol', () => {
      expect(FAUCET_URL).toMatch(/^https:\/\//)
    })

    it('should have oasis.io domain', () => {
      const url = new URL(FAUCET_URL)
      expect(url.hostname).toContain('oasis.io')
    })

    it('should be non-empty string', () => {
      expect(FAUCET_URL.length).toBeGreaterThan(0)
      expect(FAUCET_URL.trim()).toBe(FAUCET_URL)
    })
  })

  describe('ROSE_APP_URL', () => {
    it('should have correct ROSE app URL', () => {
      expect(ROSE_APP_URL).toBe('https://rose.oasis.io/')
    })

    it('should be a valid URL', () => {
      expect(() => new URL(ROSE_APP_URL)).not.toThrow()
    })

    it('should use HTTPS protocol', () => {
      expect(ROSE_APP_URL).toMatch(/^https:\/\//)
    })

    it('should have oasis.io domain', () => {
      const url = new URL(ROSE_APP_URL)
      expect(url.hostname).toContain('oasis.io')
    })

    it('should be non-empty string', () => {
      expect(ROSE_APP_URL.length).toBeGreaterThan(0)
      expect(ROSE_APP_URL.trim()).toBe(ROSE_APP_URL)
    })
  })

  describe('URL uniqueness', () => {
    it('should have different URLs for different services', () => {
      expect(FAUCET_URL).not.toBe(ROSE_APP_URL)
    })

    it('should not have duplicate URLs', () => {
      const urls = [FAUCET_URL, ROSE_APP_URL]
      const uniqueUrls = new Set(urls)
      expect(uniqueUrls.size).toBe(urls.length)
    })
  })

  describe('URL structure', () => {
    it('should have trailing slashes for consistency', () => {
      expect(FAUCET_URL).toMatch(/\/$/)
      expect(ROSE_APP_URL).toMatch(/\/$/)
    })

    it('should parse to valid URL objects', () => {
      const faucetUrl = new URL(FAUCET_URL)
      const roseUrl = new URL(ROSE_APP_URL)

      expect(faucetUrl.protocol).toBe('https:')
      expect(roseUrl.protocol).toBe('https:')
    })
  })

  describe('type safety', () => {
    it('should have string type for FAUCET_URL', () => {
      const isString: string = FAUCET_URL
      expect(typeof isString).toBe('string')
    })

    it('should have string type for ROSE_APP_URL', () => {
      const isString: string = ROSE_APP_URL
      expect(typeof isString).toBe('string')
    })
  })
})
