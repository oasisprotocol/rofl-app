import { vi } from 'vitest'

// Create a consistent axios mock that can be shared across tests
const createAxiosMock = () => {
  const axiosMock = vi.fn()

  return {
    default: Object.assign(axiosMock, {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      create: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(),
  }
}

// Export a mock factory function
export const mockAxios = () => createAxiosMock()

// Re-export for convenience
export { vi }
