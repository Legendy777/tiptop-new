import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Use 5173 to align with backend Socket.IO CORS allowlist
    port: 5173,
    host: true,
    strictPort: true
  }
})
