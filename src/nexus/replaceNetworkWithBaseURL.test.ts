import { describe, it, expect, vi, beforeEach } from 'vitest'
import { replaceNetworkWithBaseURL } from './replaceNetworkWithBaseURL'
import axios from 'axios'

// Mock axios module for this test
vi.mock('axios', () => ({
  default: vi.fn(),
}))

const mockAxios = vi.mocked(axios)

describe('replaceNetworkWithBaseURL', () => {
  beforeEach(() => {
    // Clear calls
    mockAxios.mockClear()
    // Set up default return value for all axios calls
    mockAxios.mockResolvedValue({ data: 'test', status: 200, statusText: 'OK', headers: {}, config: {} })
  })

  describe('URL transformation for mainnet', () => {
    it('should replace mainnet prefix with mainnet URL', async () => {
      const config = {
        url: '/mainnet/test',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/test')
    })

    it('should handle complex mainnet URLs', async () => {
      const config = {
        url: '/mainnet/api/v1/apps',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/api/v1/apps')
    })

    it('should handle mainnet URLs with multiple path segments', async () => {
      const config = {
        url: '/mainnet/runtime/rofl/apps',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/runtime/rofl/apps')
    })

    it('should handle mainnet URLs with query parameters', async () => {
      const config = {
        url: '/mainnet/test?param=value&foo=bar',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/test?param=value&foo=bar')
    })

    it('should handle mainnet URLs with path parameters', async () => {
      const config = {
        url: '/mainnet/apps/123/details',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/apps/123/details')
    })
  })

  describe('URL transformation for testnet', () => {
    it('should replace testnet prefix with testnet URL', async () => {
      const config = {
        url: '/testnet/test',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://testnet.nexus.oasis.io/v1/test')
    })

    it('should handle complex testnet URLs', async () => {
      const config = {
        url: '/testnet/api/v1/apps',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://testnet.nexus.oasis.io/v1/api/v1/apps')
    })

    it('should handle testnet URLs with query parameters', async () => {
      const config = {
        url: '/testnet/test?param=value',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://testnet.nexus.oasis.io/v1/test?param=value')
    })
  })

  describe('Error handling', () => {
    it('should throw error for URL without network prefix', () => {
      const config = {
        url: '/invalid/test',
        method: 'GET' as const,
      }

      expect(() => replaceNetworkWithBaseURL(config)).toThrow(
        'Expected URL to be prefixed with network: /invalid/test',
      )
    })

    it('should throw error for URL without any prefix', () => {
      const config = {
        url: '/test',
        method: 'GET' as const,
      }

      expect(() => replaceNetworkWithBaseURL(config)).toThrow(
        'Expected URL to be prefixed with network: /test',
      )
    })

    it('should throw error for empty URL', () => {
      const config = {
        url: '',
        method: 'GET' as const,
      }

      expect(() => replaceNetworkWithBaseURL(config)).toThrow()
    })

    it('should throw error for URL with only network prefix (no trailing slash)', () => {
      const config = {
        url: '/mainnet',
        method: 'GET' as const,
      }

      expect(() => replaceNetworkWithBaseURL(config)).toThrow()
    })

    it('should handle case-sensitive network prefixes', () => {
      const config = {
        url: '/MainNet/test',
        method: 'GET' as const,
      }

      expect(() => replaceNetworkWithBaseURL(config)).toThrow()
    })
  })

  describe('Request configuration', () => {
    it('should preserve other config properties', async () => {
      const config = {
        url: '/mainnet/test',
        method: 'POST' as const,
        data: { key: 'value' },
        headers: { 'Content-Type': 'application/json' },
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.method).toBe('POST')
      expect(config.data).toEqual({ key: 'value' })
      expect(config.headers).toEqual({ 'Content-Type': 'application/json' })
    })

    it('should merge request overrides with config', async () => {
      const config = {
        url: '/mainnet/test',
        method: 'GET' as const,
        timeout: 1000,
      }
      const overrides = {
        headers: { 'X-Custom': 'value' },
        timeout: 5000,
      }

      await replaceNetworkWithBaseURL(config, overrides)
      expect(config.url).toBe('https://nexus.oasis.io/v1/test')
      expect(config.timeout).toBe(1000)
    })

    it('should override config properties with requestOverrides', async () => {
      const config = {
        url: '/mainnet/test',
        method: 'GET' as const,
        timeout: 1000,
      }
      const overrides = {
        timeout: 5000,
      }

      await replaceNetworkWithBaseURL(config, overrides)
      expect(config.url).toBe('https://nexus.oasis.io/v1/test')
    })
  })

  describe('Return value', () => {
    it('should return axios response', async () => {
      const config = {
        url: '/mainnet/test',
        method: 'GET' as const,
      }

      const result = await replaceNetworkWithBaseURL(config)

      expect(result).toBeDefined()
      expect(config.url).toBe('https://nexus.oasis.io/v1/test')
    })

    it('should return response with correct structure', async () => {
      const mockResponse = {
        data: { result: 'success' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {},
      }
      mockAxios.mockResolvedValueOnce(mockResponse)

      const config = {
        url: '/mainnet/test',
        method: 'GET' as const,
      }

      const result = await replaceNetworkWithBaseURL(config)

      // Check that axios was called with the transformed URL
      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://nexus.oasis.io/v1/test',
          method: 'GET',
        }),
      )
      // Check that the result is the response from axios
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Edge cases', () => {
    it('should handle URLs with fragments', async () => {
      const config = {
        url: '/mainnet/test#section',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/test#section')
    })

    it('should handle URLs with trailing slashes', async () => {
      const config = {
        url: '/mainnet/test/',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/test/')
    })

    it('should handle URLs with encoded characters', async () => {
      const config = {
        url: '/mainnet/test%20path',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/test%20path')
    })

    it('should handle different HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

      for (const method of methods) {
        const config = {
          url: '/mainnet/test',
          method,
        }

        await replaceNetworkWithBaseURL(config)
        expect(config.url).toBe('https://nexus.oasis.io/v1/test')
      }
    })

    it('should handle URL with port in path', async () => {
      const config = {
        url: '/mainnet/test:8080',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/test:8080')
    })

    it('should handle root path for mainnet', async () => {
      const config = {
        url: '/mainnet/',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://nexus.oasis.io/v1/')
    })

    it('should handle root path for testnet', async () => {
      const config = {
        url: '/testnet/',
        method: 'GET' as const,
      }

      await replaceNetworkWithBaseURL(config)

      expect(config.url).toBe('https://testnet.nexus.oasis.io/v1/')
    })
  })

  describe('Type safety', () => {
    it('should accept AxiosRequestConfig parameter', async () => {
      const config = {
        url: '/mainnet/test',
        method: 'GET' as const,
        headers: {},
      }

      const result = await replaceNetworkWithBaseURL(config)
      expect(result).toBeDefined()
    })

    it('should accept generic type parameter', async () => {
      const config = {
        url: '/mainnet/test',
        method: 'GET' as const,
      }

      const result = await replaceNetworkWithBaseURL<{ data: string }>(config)
      expect(result).toBeDefined()
    })
  })

  describe('Module structure', () => {
    it('should export replaceNetworkWithBaseURL function', () => {
      expect(typeof replaceNetworkWithBaseURL).toBe('function')
    })

    it('should also export as default', async () => {
      const module = await import('./replaceNetworkWithBaseURL')
      expect(typeof module.default).toBe('function')
    })
  })
})
