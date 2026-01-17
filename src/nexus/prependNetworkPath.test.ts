import { describe, it, expect } from 'vitest'
import prependNetworkPath from './prependNetworkPath.mjs'

describe('prependNetworkPath.mjs - OpenAPI path transformer', () => {
  describe('Basic functionality', () => {
    it('should be a function', () => {
      expect(typeof prependNetworkPath).toBe('function')
    })

    it('should accept an OpenAPI schema object', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'testOperation',
              responses: { 200: { description: 'OK' } },
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should return an object with paths property', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      }

      const result = prependNetworkPath(inputSchema)
      expect(result).toHaveProperty('paths')
    })
  })

  describe('Path transformation', () => {
    it('should prepend /{network} to all paths', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: { operationId: 'getUsers', responses: {} },
          },
          '/posts': {
            get: { operationId: 'getPosts', responses: {} },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)

      expect(result.paths).toHaveProperty('/{network}/users')
      expect(result.paths).toHaveProperty('/{network}/posts')
      expect(result.paths).not.toHaveProperty('/users')
      expect(result.paths).not.toHaveProperty('/posts')
    })

    it('should handle nested paths', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/api/v1/users': {
            get: { operationId: 'getUsers', responses: {} },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)

      expect(result.paths).toHaveProperty('/{network}/api/v1/users')
    })

    it('should preserve path parameters', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users/{id}': {
            get: { operationId: 'getUser', responses: {} },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)

      expect(result.paths).toHaveProperty('/{network}/users/{id}')
    })
  })

  describe('Parameter injection', () => {
    it('should add network parameter to GET operations', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/users'].get

      expect(operation.parameters).toBeDefined()
      expect(Array.isArray(operation.parameters)).toBe(true)

      const networkParam = operation.parameters.find((p: any) => p.name === 'network')
      expect(networkParam).toBeDefined()
      expect(networkParam.in).toBe('path')
      expect(networkParam.required).toBe(true)
    })

    it('should add network parameter to POST operations', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/users'].post

      expect(operation.parameters).toBeDefined()
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')
      expect(networkParam).toBeDefined()
    })

    it('should add network parameter to PUT operations', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users/{id}': {
            put: {
              operationId: 'updateUser',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/users/{id}'].put

      expect(operation.parameters).toBeDefined()
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')
      expect(networkParam).toBeDefined()
    })

    it('should add network parameter to DELETE operations', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users/{id}': {
            delete: {
              operationId: 'deleteUser',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/users/{id}'].delete

      expect(operation.parameters).toBeDefined()
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')
      expect(networkParam).toBeDefined()
    })

    it('should preserve existing parameters', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
                },
                {
                  name: 'include',
                  in: 'query',
                  required: false,
                  schema: { type: 'string' },
                },
              ],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/users/{id}'].get

      expect(operation.parameters).toHaveLength(3)

      const idParam = operation.parameters.find((p: any) => p.name === 'id')
      const includeParam = operation.parameters.find((p: any) => p.name === 'include')
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')

      expect(idParam).toBeDefined()
      expect(includeParam).toBeDefined()
      expect(networkParam).toBeDefined()
    })

    it('should handle operations without existing parameters', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/users'].get

      expect(operation.parameters).toBeDefined()
      expect(operation.parameters).toHaveLength(1)
      expect(operation.parameters[0].name).toBe('network')
    })
  })

  describe('Network parameter schema', () => {
    it('should set network parameter as required', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/test'].get
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')

      expect(networkParam.required).toBe(true)
    })

    it('should set network parameter location to path', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/test'].get
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')

      expect(networkParam.in).toBe('path')
    })

    it('should set network parameter type to string', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/test'].get
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')

      expect(networkParam.schema).toBeDefined()
      expect(networkParam.schema.type).toBe('string')
    })

    it('should set network parameter enum to mainnet and testnet', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              parameters: [],
              responses: {},
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/test'].get
      const networkParam = operation.parameters.find((p: any) => p.name === 'network')

      expect(networkParam.schema.enum).toBeDefined()
      expect(networkParam.schema.enum).toEqual(['mainnet', 'testnet'])
    })
  })

  describe('Schema preservation', () => {
    it('should preserve non-paths properties', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              responses: {},
            },
          },
        },
        components: {
          schemas: {},
        },
      }

      const result = prependNetworkPath(inputSchema)

      expect(result.openapi).toBe('3.0.0')
      expect(result.info).toEqual(inputSchema.info)
      expect(result.components).toEqual(inputSchema.components)
    })

    it('should preserve operation properties', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              summary: 'Test operation',
              description: 'Test description',
              tags: ['test'],
              responses: {
                200: { description: 'OK' },
              },
            },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const operation = result.paths['/{network}/test'].get

      expect(operation.operationId).toBe('test')
      expect(operation.summary).toBe('Test operation')
      expect(operation.description).toBe('Test description')
      expect(operation.tags).toEqual(['test'])
      expect(operation.responses).toEqual(inputSchema.paths['/test'].get.responses)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty paths object', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      }

      const result = prependNetworkPath(inputSchema)

      expect(result.paths).toEqual({})
    })

    it('should handle paths with multiple HTTP methods', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: { operationId: 'getUsers', responses: {} },
            post: { operationId: 'createUser', responses: {} },
            put: { operationId: 'updateUser', responses: {} },
            delete: { operationId: 'deleteUser', responses: {} },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)
      const pathItem = result.paths['/{network}/users']

      expect(pathItem.get).toBeDefined()
      expect(pathItem.post).toBeDefined()
      expect(pathItem.put).toBeDefined()
      expect(pathItem.delete).toBeDefined()

      // Each method should have network parameter
      expect(pathItem.get.parameters.find((p: any) => p.name === 'network')).toBeDefined()
      expect(pathItem.post.parameters.find((p: any) => p.name === 'network')).toBeDefined()
      expect(pathItem.put.parameters.find((p: any) => p.name === 'network')).toBeDefined()
      expect(pathItem.delete.parameters.find((p: any) => p.name === 'network')).toBeDefined()
    })

    it('should handle paths with special characters', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/api/v1/users/{userId}/posts/{postId}': {
            get: { operationId: 'getUserPost', responses: {} },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)

      expect(result.paths).toHaveProperty('/{network}/api/v1/users/{userId}/posts/{postId}')
    })

    it('should handle root path', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/': {
            get: { operationId: 'getRoot', responses: {} },
          },
        },
      }

      const result = prependNetworkPath(inputSchema)

      expect(result.paths).toHaveProperty('/{network}/')
    })
  })

  describe('Input transformer contract', () => {
    it('should follow orval input transformer signature', () => {
      // Orval expects: (OpenAPIObject) => OpenAPIObject
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      }

      const result = prependNetworkPath(inputSchema)

      // Should return an object
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')

      // Should have the structure of an OpenAPI spec
      expect(result).toHaveProperty('paths')
    })

    it('should not mutate the input schema', () => {
      const inputSchema = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { operationId: 'test', responses: {} },
          },
        },
      }

      const originalPaths = { ...inputSchema.paths }
      prependNetworkPath(inputSchema)

      // Input should not be modified
      expect(inputSchema.paths).toEqual(originalPaths)
      expect(inputSchema.paths).toHaveProperty('/test')
      expect(inputSchema.paths).not.toHaveProperty('/{network}/test')
    })
  })
})
