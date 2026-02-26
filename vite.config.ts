import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/renderer/components'),
      '@engine': path.resolve(__dirname, './src/renderer/engine'),
      '@store': path.resolve(__dirname, './src/renderer/store'),
      '@utils': path.resolve(__dirname, './src/renderer/utils'),
      '@types': path.resolve(__dirname, './src/renderer/types'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
