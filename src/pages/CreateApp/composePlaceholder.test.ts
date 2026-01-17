import { describe, it, expect } from 'vitest'
import { composePlaceholder } from './composePlaceholder'

describe('composePlaceholder', () => {
  it('should be defined', () => {
    expect(composePlaceholder).toBeDefined()
  })

  it('should be a string', () => {
    expect(typeof composePlaceholder).toBe('string')
  })

  it('should contain a comment explaining what to paste', () => {
    expect(composePlaceholder).toContain('# Paste your Compose file')
  })

  it('should mention docker-compose.yaml', () => {
    expect(composePlaceholder).toContain('docker-compose.yaml')
  })

  it('should contain an example with 3 services', () => {
    expect(composePlaceholder).toContain('3 services')
  })

  it('should have a services section', () => {
    expect(composePlaceholder).toContain('services:')
  })

  it('should include a db service', () => {
    expect(composePlaceholder).toContain('db:')
  })

  it('should include a backend service', () => {
    expect(composePlaceholder).toContain('backend:')
  })

  it('should include a frontend service', () => {
    expect(composePlaceholder).toContain('frontend:')
  })

  it('should use postgres:18-alpine for db', () => {
    expect(composePlaceholder).toContain('postgres:18-alpine')
  })

  it('should use python:3.14-slim for backend', () => {
    expect(composePlaceholder).toContain('python:3.14-slim')
  })

  it('should use node:20-alpine for frontend', () => {
    expect(composePlaceholder).toContain('node:20-alpine')
  })

  it('should include environment variables for db', () => {
    expect(composePlaceholder).toContain('POSTGRES_DB')
    expect(composePlaceholder).toContain('POSTGRES_USER')
    expect(composePlaceholder).toContain('POSTGRES_PASSWORD')
  })

  it('should use environment variable placeholders', () => {
    expect(composePlaceholder).toContain('${DB_NAME}')
    expect(composePlaceholder).toContain('${DB_USER}')
    expect(composePlaceholder).toContain('${DB_PASSWORD}')
  })

  it('should include volumes section', () => {
    expect(composePlaceholder).toContain('volumes:')
  })

  it('should include pg_data volume', () => {
    expect(composePlaceholder).toContain('pg_data:')
  })

  it('should mount pg_data volume for db', () => {
    expect(composePlaceholder).toContain('- pg_data:/var/lib/postgresql/data')
  })

  it('should include ROFL socket mount for backend', () => {
    expect(composePlaceholder).toContain('/run/rofl-appd.sock:/run/rofl-appd.sock')
  })

  it('should include comment about ROFL socket', () => {
    expect(composePlaceholder).toContain('ROFL Python Client')
    expect(composePlaceholder).toContain('ROFL appd REST API')
  })

  it('should expose port 8000 for backend', () => {
    expect(composePlaceholder).toContain('"8000:8000"')
  })

  it('should expose port 5173 for frontend', () => {
    expect(composePlaceholder).toContain('"5173:5173"')
  })

  it('should include depends_on for backend', () => {
    expect(composePlaceholder).toContain('depends_on:')
  })

  it('should make backend depend on db', () => {
    expect(composePlaceholder).toContain('- db')
  })

  it('should include build context for backend', () => {
    expect(composePlaceholder).toContain('build: ./backend')
  })

  it('should include build context for frontend', () => {
    expect(composePlaceholder).toContain('build: ./frontend')
  })

  it('should include Django runserver command for backend', () => {
    expect(composePlaceholder).toContain('python manage.py runserver 0.0.0.0:8000')
  })

  it('should include pnpm dev command for frontend', () => {
    expect(composePlaceholder).toContain('pnpm dev')
  })

  it('should include Django database environment variables', () => {
    expect(composePlaceholder).toContain('DB_ENGINE=django.db.backends.postgresql')
    expect(composePlaceholder).toContain('DB_HOST=db')
    expect(composePlaceholder).toContain('DB_PORT=5432')
  })

  it('should be valid YAML format', () => {
    // Check for basic YAML structure
    expect(composePlaceholder.trim().startsWith('#')).toBe(true)
    expect(composePlaceholder).toContain('services:')
    expect(composePlaceholder).toContain('volumes:')
  })

  it('should contain helpful comments', () => {
    expect(composePlaceholder).toMatch(/#.*/).toBeTruthy()
  })
})
