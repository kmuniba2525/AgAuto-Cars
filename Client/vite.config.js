import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — needed everywhere, but at least isolated
          // so it's cached separately and doesn't get re-downloaded when
          // your own app code changes between deploys.
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Stripe is only needed on /checkout — splitting it out means
          // shoppers browsing products never download it.
          'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js'],

          // Google OAuth is only needed on the login modal — same idea.
          'google-vendor': ['@react-oauth/google', 'google-auth-library'],

          // Charting library — already isolated to Analytics via lazy(),
          // but explicitly chunking it too keeps it out of shared code.
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
})