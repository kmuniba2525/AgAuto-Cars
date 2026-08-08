import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Vite 8 / rolldown requires manualChunks as a function, not an
        // object map. Given a module id, return the chunk name it
        // belongs to, or undefined to let it fall into the default chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('@stripe')) {
            return 'stripe-vendor';
          }
          if (id.includes('@react-oauth') || id.includes('google-auth-library')) {
            return 'google-vendor';
          }
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }
        },
      },
    },
  },
})