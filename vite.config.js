import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

export default defineConfig({
  server: {
    open: true,
  },
  optimizeDeps: {
    exclude: [],
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    alias: {
      'react-mx-web-components': path.resolve('./src/__mocks__/react-mx-web-components.js'),
      'react-markdown': path.resolve('./src/__mocks__/react-markdown.js'),
      'marked': path.resolve('./src/__mocks__/marked.js'),
    },
  },
})
