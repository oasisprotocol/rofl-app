import { describe, it, expect } from 'vitest'
import { ViewMetadataState, ViewSecretsState } from './types'
import { RoflAppSecrets } from '../../../nexus/api'

describe('Dashboard/AppDetails/types', () => {
  describe('ViewMetadataState', () => {
    it('should define correct structure', () => {
      const state: ViewMetadataState = {
        isDirty: true,
        metadata: {
          name: 'Test App',
          description: 'Test Description',
          image: 'https://example.com/image.png',
          repository: 'https://github.com/test/repo',
          template: 'test-template',
        },
      }

      expect(state.isDirty).toBe(true)
      expect(state.metadata.name).toBe('Test App')
    })

    it('should accept false for isDirty', () => {
      const state: ViewMetadataState = {
        isDirty: false,
        metadata: {
          name: 'Test App',
          description: '',
          image: '',
          repository: '',
          template: 'test-template',
        },
      }

      expect(state.isDirty).toBe(false)
    })

    it('should require both properties', () => {
      // TypeScript should enforce that both isDirty and metadata are present
      const state: ViewMetadataState = {
        isDirty: false,
        metadata: {
          name: '',
          description: '',
          image: '',
          repository: '',
          template: '',
        },
      }

      expect(typeof state.isDirty).toBe('boolean')
      expect(typeof state.metadata).toBe('object')
    })
  })

  describe('ViewSecretsState', () => {
    it('should define correct structure', () => {
      const state: ViewSecretsState = {
        isDirty: true,
        secrets: {
          SECRET_KEY: 'secret-value',
          API_KEY: 'api-key-value',
        },
      }

      expect(state.isDirty).toBe(true)
      expect(state.secrets.SECRET_KEY).toBe('secret-value')
    })

    it('should accept empty secrets', () => {
      const state: ViewSecretsState = {
        isDirty: false,
        secrets: {},
      }

      expect(state.isDirty).toBe(false)
      expect(Object.keys(state.secrets).length).toBe(0)
    })

    it('should accept multiple secrets', () => {
      const state: ViewSecretsState = {
        isDirty: true,
        secrets: {
          SECRET1: 'value1',
          SECRET2: 'value2',
          SECRET3: 'value3',
          SECRET4: 'value4',
          SECRET5: 'value5',
        },
      }

      expect(Object.keys(state.secrets).length).toBe(5)
    })

    it('should require both properties', () => {
      // TypeScript should enforce that both isDirty and secrets are present
      const state: ViewSecretsState = {
        isDirty: false,
        secrets: {},
      }

      expect(typeof state.isDirty).toBe('boolean')
      expect(typeof state.secrets).toBe('object')
    })
  })

  describe('type compatibility', () => {
    it('should allow metadata with all optional fields', () => {
      const state: ViewMetadataState = {
        isDirty: false,
        metadata: {
          name: 'App',
          description: undefined,
          image: undefined,
          repository: undefined,
          template: 'template',
        },
      }

      expect(state.metadata.name).toBe('App')
    })

    it('should allow secrets with special characters in keys', () => {
      const state: ViewSecretsState = {
        isDirty: true,
        secrets: {
          SECRET_KEY_123: 'value',
          'API-KEY-2': 'value2',
          'DB.CONNECTION.STRING': 'value3',
        },
      }

      expect(state.secrets['SECRET_KEY_123']).toBe('value')
    })
  })
})
