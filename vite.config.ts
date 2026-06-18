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
      includeAssets: ['pwa-icon.svg', 'favicon.ico'],
      manifest: {
        name: 'FAIRPLAY — Referee Engine',
        short_name: 'FAIRPLAY',
        description: 'The soccer referee app for everyone — call fouls, compare with fans, follow every league.',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        categories: ['sports', 'entertainment'],
        shortcuts: [
          {
            name: 'Referee a Match',
            short_name: 'Referee',
            description: 'Jump straight to the referee panel',
            url: '/?tab=referee',
            icons: [{ src: '/pwa-icon.svg', sizes: 'any' }],
          },
        ],
      },
      workbox: {
        // Cache ESPN API responses for 2 minutes so offline still shows last data
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/site\.api\.espn\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'espn-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 2 * 60,
              },
              networkTimeoutSeconds: 8,
            },
          },
          {
            urlPattern: /^https:\/\/a\.espncdn\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'espn-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/ipapi\.co\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'geo-ip',
              expiration: { maxEntries: 1, maxAgeSeconds: 24 * 60 * 60 },
              networkTimeoutSeconds: 4,
            },
          },
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: false,
  },
})
