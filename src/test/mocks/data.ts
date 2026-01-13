// Mock data factories for testing

export const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const

export const mockApp = {
  id: 'test-app-id',
  name: 'Test App',
  description: 'A test application',
  owner: mockAddress,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  manifest: '{}',
  compose: '{}',
  nonces: {
    deploy: '1',
    update: '1',
  },
}

export const mockMachine = {
  id: 'test-machine-id',
  provider: 'oasis',
  status: 'running',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ipAddress: '192.168.1.1',
  resources: {
    cpu: 2,
    memory: 4096,
    disk: 100,
  },
}

export const mockBuildFormData = {
  name: 'Test Build',
  description: 'Test build description',
  templateId: 'template-1',
  composeFile: 'version: "3"\nservices:\n  test:\n    image: test',
  envVars: [],
  ports: [],
  volumes: [],
}

export const mockSecret = {
  key: 'API_KEY',
  value: 'secret-value',
  createdAt: new Date().toISOString(),
}

export const mockMetadata = {
  name: 'Test App',
  description: 'Test description',
  website: 'https://example.com',
  logo: 'https://example.com/logo.png',
  tags: ['test', 'demo'],
}

export const mockLogEntry = {
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'Test log message',
}

export const mockTemplate = {
  id: 'template-1',
  name: 'Test Template',
  description: 'A test template',
  category: 'demo',
  compose: 'version: "3"\nservices:\n  test:\n    image: test',
  readme: '# Test Template\n\nThis is a test template.',
  envVars: [],
  ports: [],
}

export const createMockApp = (overrides = {}) => ({
  ...mockApp,
  ...overrides,
})

export const createMockMachine = (overrides = {}) => ({
  ...mockMachine,
  ...overrides,
})

export const createMockSecrets = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    ...mockSecret,
    key: `SECRET_${i}`,
  }))

export const createMockLogs = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    ...mockLogEntry,
    message: `Log message ${i}`,
  }))
