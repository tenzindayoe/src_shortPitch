import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows external access
    port: 5173,
    strictPort: true,
    allowedHosts: ['shortpitchai.com', 'www.shortpitchai.com'], // Allow your domain
    hmr: {
      host: 'shortpitchai.com', // Ensures WebSocket uses correct domain
      protocol: 'ws', // Use 'wss' if you have SSL
    }
  }
})





