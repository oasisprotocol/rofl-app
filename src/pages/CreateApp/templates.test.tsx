import { describe, it, expect } from 'vitest'
import {
  templates,
  getTemplateById,
  getCustomTemplate,
  getReadmeByTemplateId,
  extractResources,
  defaultBuildConfig,
  fillTemplate,
} from './templates'
import type { MetadataFormData } from './types'
import { BuildFormData } from '../../types/build-form'

// Import the internal extractMetadata function for testing
// Note: Since extractMetadata is not exported, we'll test it indirectly through templates
// The function is defined at lines 58-64 in templates.tsx

describe('templates', () => {
  describe('templates array', () => {
    it('should be defined', () => {
      expect(templates).toBeDefined()
    })

    it('should be an array', () => {
      expect(Array.isArray(templates)).toBe(true)
    })

    it('should have 4 templates', () => {
      expect(templates.length).toBe(4)
    })

    it('should include tgbot template', () => {
      const template = templates.find(t => t.id === 'tgbot')
      expect(template).toBeDefined()
      expect(template?.id).toBe('tgbot')
    })

    it('should include x-agent template', () => {
      const template = templates.find(t => t.id === 'x-agent')
      expect(template).toBeDefined()
      expect(template?.id).toBe('x-agent')
    })

    it('should include hl-copy-trader template', () => {
      const template = templates.find(t => t.id === 'hl-copy-trader')
      expect(template).toBeDefined()
      expect(template?.id).toBe('hl-copy-trader')
    })

    it('should include custom-build template', () => {
      const template = templates.find(t => t.id === 'custom-build')
      expect(template).toBeDefined()
      expect(template?.id).toBe('custom-build')
    })

    it('should have template with required properties', () => {
      templates.forEach(template => {
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('customStepTitle')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('initialValues')
        expect(template).toHaveProperty('yaml')
      })
    })

    it('should have Setup Agent step title for tgbot', () => {
      const template = templates.find(t => t.id === 'tgbot')
      expect(template?.customStepTitle).toBe('Setup Agent')
    })

    it('should have Setup Containers step title for custom-build', () => {
      const template = templates.find(t => t.id === 'custom-build')
      expect(template?.customStepTitle).toBe('Setup Containers')
    })

    it('should have yaml compose and rofl properties', () => {
      templates.forEach(template => {
        expect(template.yaml).toHaveProperty('compose')
        expect(template.yaml).toHaveProperty('rofl')
      })
    })
  })

  describe('getTemplateById', () => {
    it('should return tgbot template for tgbot id', () => {
      const template = getTemplateById('tgbot')
      expect(template).toBeDefined()
      expect(template?.id).toBe('tgbot')
    })

    it('should return x-agent template for x-agent id', () => {
      const template = getTemplateById('x-agent')
      expect(template).toBeDefined()
      expect(template?.id).toBe('x-agent')
    })

    it('should return hl-copy-trader template for hl-copy-trader id', () => {
      const template = getTemplateById('hl-copy-trader')
      expect(template).toBeDefined()
      expect(template?.id).toBe('hl-copy-trader')
    })

    it('should return custom-build template for custom-build id', () => {
      const template = getTemplateById('custom-build')
      expect(template).toBeDefined()
      expect(template?.id).toBe('custom-build')
    })

    it('should return undefined for unknown id', () => {
      const template = getTemplateById('unknown-template')
      expect(template).toBeUndefined()
    })

    it('should return undefined for undefined id', () => {
      const template = getTemplateById(undefined)
      expect(template).toBeUndefined()
    })
  })

  describe('getCustomTemplate', () => {
    it('should return template with custom compose for tgbot', () => {
      const customCompose = 'version: "3.8"\nservices:\n  custom:\n    image: test'
      const template = getCustomTemplate('tgbot', customCompose)
      expect(template).toBeDefined()
      expect(template?.yaml.compose).toBe(customCompose)
    })

    it('should return template with custom compose for x-agent', () => {
      const customCompose = 'version: "3.8"\nservices:\n  custom:\n    image: test'
      const template = getCustomTemplate('x-agent', customCompose)
      expect(template).toBeDefined()
      expect(template?.yaml.compose).toBe(customCompose)
    })

    it('should return original compose when custom compose is undefined', () => {
      const template = getCustomTemplate('tgbot', undefined)
      expect(template).toBeDefined()
      expect(template?.yaml.compose).toBeDefined()
    })

    it('should return undefined for unknown template id', () => {
      const template = getCustomTemplate('unknown', 'compose: test')
      expect(template).toBeUndefined()
    })

    it('should preserve other template properties when customizing compose', () => {
      const customCompose = 'custom compose content'
      const template = getCustomTemplate('tgbot', customCompose)
      expect(template?.yaml.rofl).toBeDefined()
      expect(template?.id).toBe('tgbot')
    })
  })

  describe('getReadmeByTemplateId', () => {
    it('should return README for tgbot template', () => {
      const readme = getReadmeByTemplateId('tgbot')
      expect(typeof readme).toBe('string')
      expect(readme.length).toBeGreaterThan(0)
    })

    it('should return README for x-agent template', () => {
      const readme = getReadmeByTemplateId('x-agent')
      expect(typeof readme).toBe('string')
      expect(readme.length).toBeGreaterThan(0)
    })

    it('should return README for hl-copy-trader template', () => {
      const readme = getReadmeByTemplateId('hl-copy-trader')
      expect(typeof readme).toBe('string')
      expect(readme.length).toBeGreaterThan(0)
    })

    it('should return README for custom-build template', () => {
      const readme = getReadmeByTemplateId('custom-build')
      expect(typeof readme).toBe('string')
      expect(readme.length).toBeGreaterThan(0)
    })

    it('should return empty string for unknown template', () => {
      const readme = getReadmeByTemplateId('unknown')
      expect(readme).toBe('')
    })
  })

  describe('defaultBuildConfig', () => {
    it('should have provider as empty string', () => {
      expect(defaultBuildConfig.provider).toBe('')
    })

    it('should have duration as hours', () => {
      expect(defaultBuildConfig.duration).toBe('hours')
    })

    it('should have number as 2', () => {
      expect(defaultBuildConfig.number).toBe(2)
    })

    it('should have offerId as empty string', () => {
      expect(defaultBuildConfig.offerId).toBe('')
    })

    it('should have offerCpus as 0', () => {
      expect(defaultBuildConfig.offerCpus).toBe(0)
    })

    it('should have offerMemory as 0', () => {
      expect(defaultBuildConfig.offerMemory).toBe(0)
    })

    it('should have offerStorage as 0', () => {
      expect(defaultBuildConfig.offerStorage).toBe(0)
    })
  })

  describe('extractResources', () => {
    it('should extract cpus from parsed template', () => {
      const parsedTemplate = { resources: { cpus: 4 } }
      const resources = extractResources(parsedTemplate as any)
      expect(resources.offerCpus).toBe(4)
    })

    it('should extract memory from parsed template', () => {
      const parsedTemplate = { resources: { memory: 8192 } }
      const resources = extractResources(parsedTemplate as any)
      expect(resources.offerMemory).toBe(8192)
    })

    it('should extract storage size from parsed template', () => {
      const parsedTemplate = { resources: { storage: { size: 10240 } } }
      const resources = extractResources(parsedTemplate as any)
      expect(resources.offerStorage).toBe(10240)
    })

    it('should set default values when resources are missing', () => {
      const parsedTemplate = {}
      const resources = extractResources(parsedTemplate as any)
      expect(resources.offerCpus).toBe(0)
      expect(resources.offerMemory).toBe(0)
      expect(resources.offerStorage).toBe(0)
    })

    it('should include default build config properties', () => {
      const parsedTemplate = {}
      const resources = extractResources(parsedTemplate as any)
      expect(resources).toHaveProperty('provider')
      expect(resources).toHaveProperty('duration')
      expect(resources).toHaveProperty('number')
      expect(resources).toHaveProperty('offerId')
    })
  })

  describe('extractMetadata (via templates)', () => {
    // Since extractMetadata is not exported, we test it indirectly through templates
    // The function is defined at lines 58-64 in templates.tsx
    // It's used in the templates array to set initialValues.metadata

    it('should extract metadata when template has name property', () => {
      // The tgbot template should have metadata extracted from its parsed template
      const template = templates.find(t => t.id === 'tgbot')
      expect(template).toBeDefined()
      expect(template?.initialValues.metadata).toHaveProperty('name')
      expect(typeof template?.initialValues.metadata.name).toBe('string')
    })

    it('should set author to empty string', () => {
      // All templates should have author as empty string (line 60)
      templates.forEach(template => {
        expect(template.initialValues.metadata.author).toBe('')
      })
    })

    it('should extract description when present', () => {
      const template = templates.find(t => t.id === 'tgbot')
      expect(template).toBeDefined()
      expect(template?.initialValues.metadata).toHaveProperty('description')
      expect(typeof template?.initialValues.metadata.description).toBe('string')
    })

    it('should extract version when present', () => {
      const template = templates.find(t => t.id === 'tgbot')
      expect(template).toBeDefined()
      expect(template?.initialValues.metadata).toHaveProperty('version')
      expect(typeof template?.initialValues.metadata.version).toBe('string')
    })

    it('should extract homepage when present', () => {
      const template = templates.find(t => t.id === 'tgbot')
      expect(template).toBeDefined()
      expect(template?.initialValues.metadata).toHaveProperty('homepage')
      expect(typeof template?.initialValues.metadata.homepage).toBe('string')
    })

    it('should handle missing name with fallback to empty string', () => {
      // Custom build template should have empty string if name is missing
      const template = templates.find(t => t.id === 'custom-build')
      expect(template).toBeDefined()
      expect(typeof template?.initialValues.metadata.name).toBe('string')
    })

    it('should handle missing description with fallback to empty string', () => {
      const template = templates.find(t => t.id === 'custom-build')
      expect(template).toBeDefined()
      expect(typeof template?.initialValues.metadata.description).toBe('string')
    })

    it('should handle missing version with fallback to empty string', () => {
      const template = templates.find(t => t.id === 'custom-build')
      expect(template).toBeDefined()
      expect(typeof template?.initialValues.metadata.version).toBe('string')
    })

    it('should handle missing homepage with fallback to empty string', () => {
      const template = templates.find(t => t.id === 'custom-build')
      expect(template).toBeDefined()
      expect(typeof template?.initialValues.metadata.homepage).toBe('string')
    })

    it('should always have all metadata fields', () => {
      templates.forEach(template => {
        expect(template.initialValues.metadata).toHaveProperty('name')
        expect(template.initialValues.metadata).toHaveProperty('author')
        expect(template.initialValues.metadata).toHaveProperty('description')
        expect(template.initialValues.metadata).toHaveProperty('version')
        expect(template.initialValues.metadata).toHaveProperty('homepage')
      })
    })
  })

  describe('fillTemplate', () => {
    const mockMetadata: Partial<MetadataFormData> = {
      name: 'Test App',
      description: 'Test Description',
      author: 'test@example.com',
      version: '1.0.0',
      homepage: 'https://example.com',
    }

    const mockBuildData: Partial<BuildFormData> = {
      offerCpus: 4,
      offerMemory: 8192,
      offerStorage: 10240,
    }

    const mockRoflData = {
      resources: {
        cpus: 2,
        memory: 4096,
        storage: { size: 5120 },
      },
    }

    it('should fill template with metadata', () => {
      const filled = fillTemplate(
        mockRoflData as any,
        mockMetadata,
        mockBuildData,
        'testnet',
        'app-123',
        '0x1234567890abcdef1234567890abcdef12345678',
      )
      expect(filled.title).toBe('Test App')
      expect(filled.description).toBe('Test Description')
      expect(filled.author).toBe('test@example.com')
      expect(filled.version).toBe('1.0.0')
      expect(filled.homepage).toBe('https://example.com')
    })

    it('should fill template with build data resources', () => {
      const filled = fillTemplate(
        mockRoflData as any,
        mockMetadata,
        mockBuildData,
        'testnet',
        'app-123',
        '0x1234567890abcdef1234567890abcdef12345678',
      )
      expect(filled.resources?.cpus).toBe(4)
      expect(filled.resources?.memory).toBe(8192)
    })

    it('should reserve 2GB for storage (subtract 2048 from offer)', () => {
      const filled = fillTemplate(
        mockRoflData as any,
        mockMetadata,
        mockBuildData,
        'testnet',
        'app-123',
        '0x1234567890abcdef1234567890abcdef12345678',
      )
      expect(filled.resources?.storage?.size).toBe(10240 - 2048)
    })

    it('should fill template with app_id', () => {
      const filled = fillTemplate(
        mockRoflData as any,
        mockMetadata,
        mockBuildData,
        'testnet',
        'app-123',
        '0x1234567890abcdef1234567890abcdef12345678',
      )
      expect(filled.deployments?.default.app_id).toBe('app-123')
    })

    it('should fill template with network', () => {
      const filled = fillTemplate(
        mockRoflData as any,
        mockMetadata,
        mockBuildData,
        'mainnet',
        'app-123',
        '0x1234567890abcdef1234567890abcdef12345678',
      )
      expect(filled.deployments?.default.network).toBe('mainnet')
    })

    it('should support both mainnet and testnet networks', () => {
      const mainnetFilled = fillTemplate(
        mockRoflData as any,
        mockMetadata,
        mockBuildData,
        'mainnet',
        'app-123',
        '0x1234567890abcdef1234567890abcdef12345678',
      )
      const testnetFilled = fillTemplate(
        mockRoflData as any,
        mockMetadata,
        mockBuildData,
        'testnet',
        'app-456',
        '0x1234567890abcdef1234567890abcdef12345678',
      )
      expect(mainnetFilled.deployments?.default.network).toBe('mainnet')
      expect(testnetFilled.deployments?.default.network).toBe('testnet')
    })
  })
})
