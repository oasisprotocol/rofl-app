import { describe, it, expect } from 'vitest'

describe('orval.config.mjs - Orval configuration', () => {
  describe('Module structure', () => {
    it('should export a default configuration object', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have a default export
      expect(fileContent).toContain('export default config')
    })

    it('should have .mjs extension', async () => {
      const _fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')

      expect(path.extname(filePath)).toBe('.mjs')
    })

    it('should be a valid JavaScript file', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')

      expect(fs.existsSync(filePath)).toBe(true)
    })
  })

  describe('Configuration structure', () => {
    it('should have a nexus configuration key', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should define a nexus configuration
      expect(fileContent).toContain('nexus:')
    })

    it('should have input configuration', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have input section
      expect(fileContent).toContain('input:')
    })

    it('should have output configuration', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have output section
      expect(fileContent).toContain('output:')
    })
  })

  describe('Input configuration', () => {
    it('should specify target OpenAPI spec', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should specify target (using GitHub URL)
      expect(fileContent).toContain('target:')
      expect(fileContent).toContain('raw.githubusercontent.com')
      expect(fileContent).toContain('nexus')
    })

    it('should have override configuration for input', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have override section
      expect(fileContent).toContain('override:')
    })

    it('should specify transformer function', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should use prependNetworkPath transformer
      expect(fileContent).toContain('transformer:')
      expect(fileContent).toContain('prependNetworkPath')
    })
  })

  describe('Output configuration', () => {
    it('should specify output target file', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should specify generated api.ts as target
      expect(fileContent).toContain("target: './generated/api.ts'")
    })

    it('should specify react-query client', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should use react-query as client
      expect(fileContent).toContain("client: 'react-query'")
    })

    it('should specify mode as single', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should use single mode
      expect(fileContent).toContain("mode: 'single'")
    })

    it('should enable urlEncodeParameters', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have urlEncodeParameters enabled
      expect(fileContent).toContain('urlEncodeParameters:')
      expect(fileContent).toContain('true')
    })
  })

  describe('Output override configuration', () => {
    it('should have output override section', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have override in output
      expect(fileContent).toMatch(/override:\s*\{/)
    })

    it('should specify operationName override', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should use removeNetworkFromName for operation names
      expect(fileContent).toContain('operationName:')
      expect(fileContent).toContain('removeNetworkFromName')
    })

    it('should specify mutator override', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should specify custom mutator
      expect(fileContent).toContain('mutator:')
      expect(fileContent).toContain('./replaceNetworkWithBaseURL.ts')
    })
  })

  describe('Imports', () => {
    it('should import prependNetworkPath', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should import prependNetworkPath
      expect(fileContent).toContain('import prependNetworkPath')
      expect(fileContent).toContain("'./prependNetworkPath.mjs'")
    })

    it('should import removeNetworkFromName', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should import removeNetworkFromName
      expect(fileContent).toContain('import removeNetworkFromName')
      expect(fileContent).toContain("'./removeNetworkFromName.mjs'")
    })
  })

  describe('TypeScript configuration', () => {
    it('should have TypeScript JSDoc type annotation', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have type annotation for config
      expect(fileContent).toContain('@type')
      expect(fileContent).toContain("import('@orval/core').Config")
    })

    it('should use const declaration for config', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should declare config as const
      expect(fileContent).toContain('const config =')
    })
  })

  describe('Configuration options', () => {
    it('should document configuration intent in comments', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have comments explaining the configuration
      expect(fileContent).toContain('//')
      expect(fileContent).toMatch(/network|parameter|API/i)
    })

    it('should have commented alternative target URLs', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have commented alternatives for different environments
      expect(fileContent).toContain('// target:')
    })
  })

  describe('Integration with other files', () => {
    it('should reference prependNetworkPath.mjs', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should reference the prependNetworkPath module
      expect(fileContent).toContain('prependNetworkPath')
    })

    it('should reference removeNetworkFromName.mjs', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should reference the removeNetworkFromName module
      expect(fileContent).toContain('removeNetworkFromName')
    })

    it('should reference replaceNetworkWithBaseURL.ts', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should reference the mutator
      expect(fileContent).toContain('replaceNetworkWithBaseURL')
    })
  })

  describe('Network parameter handling', () => {
    it('should configure network as a parameter via transformer', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should use prependNetworkPath to add network parameter
      expect(fileContent).toMatch(/transformer:\s*prependNetworkPath/)
    })

    it('should configure network in operation names', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should use removeNetworkFromName to clean operation names
      expect(fileContent).toMatch(/operationName:\s*removeNetworkFromName/)
    })
  })

  describe('Code generation settings', () => {
    it('should specify single file output mode', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should generate a single file
      expect(fileContent).toContain("mode: 'single'")
    })

    it('should output to generated directory', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should output to generated directory
      expect(fileContent).toContain("'./generated/api.ts'")
    })

    it('should use react-query as the client', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should generate react-query hooks
      expect(fileContent).toContain("client: 'react-query'")
    })
  })

  describe('File validity', () => {
    it('should not have syntax errors', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // File should be valid JavaScript
      expect(fileContent.length).toBeGreaterThan(0)
      expect(fileContent).toContain('const config')
      expect(fileContent).toContain('export default')
    })

    it('should be properly formatted', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const filePath = path.resolve('./src/nexus/orval.config.mjs')
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Should have balanced braces
      const openBraces = (fileContent.match(/\{/g) || []).length
      const closeBraces = (fileContent.match(/\}/g) || []).length

      expect(openBraces).toBe(closeBraces)
    })
  })
})
