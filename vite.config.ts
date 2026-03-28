import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/gios': {
        target: 'https://api.gios.gov.pl/pjp-api/v1/rest',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gios/, ''),
      },
      '/api/weather': {
        target: 'https://api.open-meteo.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, ''),
      },
    },
  },
})
