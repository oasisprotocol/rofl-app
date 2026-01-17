import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock getOperationId
vi.mock('@orval/core', async () => {
  const actual = await vi.importActual('@orval/core')
  return {
    ...actual,
    getOperationId: vi.fn(),
  }
})

describe('removeNetworkFromName.mjs - Orval operation name transformer', () => {
  let removeNetworkFromName: any
  let mockedGetOperationId: any

  beforeEach(async () => {
    // Get the mocked function
    const orvalCore = await import('@orval/core')
    mockedGetOperationId = orvalCore.getOperationId

    // Reset mock
    vi.mocked(mockedGetOperationId).mockReset()
    vi.mocked(mockedGetOperationId).mockImplementation((operation: string, route: string, verb: string) => {
      return `${operation}_${route}_${verb}`
    })

    // Dynamic import to get the function
    const module = await import('./removeNetworkFromName.mjs')
    removeNetworkFromName = module.default
  })

  describe('function behavior', () => {
    it('should remove ${network} from route and call getOperationId', () => {
      vi.mocked(mockedGetOperationId).mockReturnValue('test_operation')

      const result = removeNetworkFromName('getRuntime', '/api/${network}/apps', 'GET')

      expect(mockedGetOperationId).toHaveBeenCalledWith('getRuntime', '/api/apps', 'GET')
      expect(result).toBe('test_operation')
    })

    it('should handle routes without ${network}', () => {
      vi.mocked(mockedGetOperationId).mockReturnValue('test_operation')

      const result = removeNetworkFromName('getRuntime', '/api/apps', 'GET')

      expect(mockedGetOperationId).toHaveBeenCalledWith('getRuntime', '/api/apps', 'GET')
      expect(result).toBe('test_operation')
    })

    it('should handle multiple ${network} placeholders', () => {
      vi.mocked(mockedGetOperationId).mockReturnValue('test_operation')

      const result = removeNetworkFromName('getRuntime', '/api/${network}/apps/${network}/id', 'GET')

      expect(mockedGetOperationId).toHaveBeenCalledWith('getRuntime', '/api/apps/${network}/id', 'GET')
      expect(result).toBe('test_operation')
    })

    it('should pass through operation and verb correctly', () => {
      vi.mocked(mockedGetOperationId).mockReturnValue('custom_operation')

      const result = removeNetworkFromName('customOperation', '/api/${network}/test', 'POST')

      expect(mockedGetOperationId).toHaveBeenCalledWith('customOperation', '/api/test', 'POST')
      expect(result).toBe('custom_operation')
    })

    it('should return the result from getOperationId', () => {
      vi.mocked(mockedGetOperationId).mockReturnValue('getRuntime_api_sapphire_apps_GET')

      const result = removeNetworkFromName('getRuntime', '/api/sapphire/apps', 'GET')

      expect(result).toBe('getRuntime_api_sapphire_apps_GET')
    })
  })

  describe('Module structure', () => {
    it('should export a default function', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/removeNetworkFromName.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      expect(fileContent).toContain('export default')
    })

    it('should have correct file extension', async () => {
      const _fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/removeNetworkFromName.mjs')

      expect(path.extname(filePath)).toBe('.mjs')
    })
  })

  describe('Import statements', () => {
    it('should import getOperationId from @orval/core', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/removeNetworkFromName.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      expect(fileContent).toContain("import { getOperationId } from '@orval/core'")
    })

    it('should export a default function that uses getOperationId', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/removeNetworkFromName.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      expect(fileContent).toContain('getOperationId')
      expect(fileContent).toContain('export default')
    })
  })
})
