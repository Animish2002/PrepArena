import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PrepArena',
        short_name: 'PrepArena',
        description: 'Competitive coding practice and battles',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        start_url: 'https://prep-arena.animishchopade.in/dashboard',
        scope: 'https://prep-arena.animishchopade.in/',
        icons: [
          {
            src: '/assets/PrepArena_favicon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/PrepArena_favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
