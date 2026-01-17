import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_FEATURE_FLAG_PAYMASTER': 'true',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        'ui-library/',
        'templates/',
        'internals/',
        // Exclude auto-generated and type-only files
        'src/nexus/generated/**',
        'src/types/**',
        'src/pages/Dashboard/AppDetails/types.ts',
      ],
    },
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', 'ui-library', '.idea', '.git', '.cache'],
    // Increase timeout for React Testing Library async tests with jsdom.
    // Default 5s is insufficient for complex component mounting and state updates.
    testTimeout: 30000,
    hookTimeout: 30000,
    // Don't bail on first failure - see all results - until 100 failures
    bail: 100,
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'monaco-editor': path.resolve(__dirname, './src/test/mocks/monaco-editor.ts'),
      '@monaco-editor/react': path.resolve(__dirname, './src/test/mocks/monaco-editor-react.ts'),
      '@orval/core': path.resolve(__dirname, './src/test/mocks/orval-core.ts'),
      'react-hook-form': path.resolve(__dirname, './src/test/mocks/react-hook-form.ts'),
    },
  },
})
