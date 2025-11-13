import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,         // Vite padrão (evita conflito com backend 3000)
    host: 'localhost',
    // Remova o hmr.clientPort personalizado para evitar 'undefined'
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // não inclua /api aqui
        changeOrigin: true,
      },
      '/ws-status': {
        target: 'ws://localhost:3000',   // não inclua o path aqui
        ws: true,
        changeOrigin: true,
      },
    },
  },
})