import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirige les appels API vers le backend AdonisJS en local
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      }
    }
  }
})