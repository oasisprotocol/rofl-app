import { describe, it, expect } from 'vitest'
import { isUrlSafe, getHostname } from './url'

describe('url utils', () => {
  describe('isUrlSafe', () => {
    it('should return false for undefined', () => {
      expect(isUrlSafe(undefined)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isUrlSafe('')).toBe(false)
    })

    it('should return true for http URLs', () => {
      expect(isUrlSafe('http://example.com')).toBe(true)
      expect(isUrlSafe('http://localhost:3000')).toBe(true)
    })

    it('should return true for https URLs', () => {
      expect(isUrlSafe('https://example.com')).toBe(true)
      expect(isUrlSafe('https://example.com/path?query=value')).toBe(true)
    })

    it('should return true for ipfs URLs', () => {
      expect(isUrlSafe('ipfs://QmExample')).toBe(true)
      expect(isUrlSafe('ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')).toBe(true)
    })

    it('should return true for data URLs', () => {
      expect(isUrlSafe('data:text/plain;base64,SGVsbG8=')).toBe(true)
      expect(isUrlSafe('data:image/png;base64,iVBORw0KGgo=')).toBe(true)
    })

    it('should return false for ftp URLs', () => {
      expect(isUrlSafe('ftp://example.com')).toBe(false)
    })

    it('should return false for file URLs', () => {
      expect(isUrlSafe('file:///path/to/file')).toBe(false)
    })

    it('should return false for invalid URLs', () => {
      expect(isUrlSafe('not-a-url')).toBe(false)
      expect(isUrlSafe('javascript:alert(1)')).toBe(false)
    })

    it('should return false for other unsafe protocols', () => {
      expect(isUrlSafe('javascript:alert(1)')).toBe(false)
      expect(isUrlSafe('mailto:test@example.com')).toBe(false)
      expect(isUrlSafe('tel:+1234567890')).toBe(false)
    })
  })

  describe('getHostname', () => {
    it('should return empty string for undefined', () => {
      expect(getHostname(undefined)).toBe('')
    })

    it('should return empty string for empty string', () => {
      expect(getHostname('')).toBe('')
    })

    it('should return hostname for valid URLs', () => {
      expect(getHostname('https://example.com')).toBe('example.com')
      expect(getHostname('https://example.com/path')).toBe('example.com')
      expect(getHostname('http://localhost:3000/path')).toBe('localhost')
    })

    it('should return hostname with subdomain', () => {
      expect(getHostname('https://api.example.com')).toBe('api.example.com')
      expect(getHostname('https://sub.sub.example.com')).toBe('sub.sub.example.com')
    })

    it('should return hostname for URLs with port', () => {
      expect(getHostname('https://example.com:8080')).toBe('example.com')
      expect(getHostname('http://localhost:3000')).toBe('localhost')
    })

    it('should return hostname for URLs with query parameters', () => {
      expect(getHostname('https://example.com/path?query=value&other=value')).toBe('example.com')
    })

    it('should return hostname for URLs with hash', () => {
      expect(getHostname('https://example.com/path#section')).toBe('example.com')
    })

    it('should return empty string for invalid URLs', () => {
      expect(getHostname('not-a-url')).toBe('')
      expect(getHostname('javascript:alert(1)')).toBe('')
    })
  })
})
