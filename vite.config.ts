import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { version } from './package.json';
import { execSync } from 'node:child_process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    APP_VERSION: JSON.stringify(version),
    BUILD_COMMIT: JSON.stringify(execSync('git rev-parse HEAD').toString()),
  },
});
