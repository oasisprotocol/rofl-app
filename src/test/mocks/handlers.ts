import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock backend API base URL
const BACKEND_URL = import.meta.env.VITE_ROFL_APP_BACKEND || 'http://localhost:3000'

// Mock handlers for backend API
export const handlers = [
  // Auth endpoints
  http.post(`${BACKEND_URL}/api/auth/nonce`, () => {
    return HttpResponse.json({ nonce: 'test-nonce' })
  }),

  http.post(`${BACKEND_URL}/api/auth/login`, () => {
    return HttpResponse.json({ token: 'test-token' })
  }),

  http.get(`${BACKEND_URL}/api/auth/me`, () => {
    return HttpResponse.json({
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    })
  }),

  // ROFL build endpoints
  http.post(`${BACKEND_URL}/api/rofl/build`, () => {
    return HttpResponse.json({
      task_id: 'test-task-id',
      status: 'pending',
    })
  }),

  http.get(`${BACKEND_URL}/api/rofl/build/:taskId`, () => {
    return HttpResponse.json({
      task_id: 'test-task-id',
      status: 'success',
      manifest: 'test-manifest',
    })
  }),

  // App endpoints
  http.get(`${BACKEND_URL}/api/apps`, () => {
    return HttpResponse.json({
      apps: [],
      total: 0,
    })
  }),

  http.get(`${BACKEND_URL}/api/apps/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test App',
      description: 'Test Description',
      owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      createdAt: new Date().toISOString(),
    })
  }),

  // Machine endpoints
  http.get(`${BACKEND_URL}/api/machines`, () => {
    return HttpResponse.json({
      machines: [],
      total: 0,
    })
  }),

  http.get(`${BACKEND_URL}/api/machines/:provider/instances/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      provider: params.provider,
      status: 'running',
      createdAt: new Date().toISOString(),
    })
  }),

  // Templates endpoint
  http.get(`${BACKEND_URL}/api/templates`, () => {
    return HttpResponse.json({
      templates: [],
    })
  }),

  // Secrets endpoint
  http.get(`${BACKEND_URL}/api/apps/:id/secrets`, () => {
    return HttpResponse.json({
      secrets: [],
    })
  }),

  http.put(`${BACKEND_URL}/api/apps/:id/secrets`, () => {
    return HttpResponse.json({
      success: true,
    })
  }),

  // Metadata endpoint
  http.get(`${BACKEND_URL}/api/apps/:id/metadata`, () => {
    return HttpResponse.json({
      metadata: {},
    })
  }),

  http.put(`${BACKEND_URL}/api/apps/:id/metadata`, () => {
    return HttpResponse.json({
      success: true,
    })
  }),

  // Logs endpoint
  http.get(`${BACKEND_URL}/api/machines/:provider/instances/:id/logs`, () => {
    return HttpResponse.json({
      logs: [],
      total: 0,
    })
  }),
]

// Setup MSW server
export const server = setupServer(...handlers)
