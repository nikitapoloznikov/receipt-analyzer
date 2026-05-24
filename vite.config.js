import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/receipt-analyzer/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon.svg'],
      manifest: {
        name: 'Receipt Analyzer',
        short_name: 'Receipts',
        description: 'Personal finance receipt tracker',
        start_url: '/receipt-analyzer/',
        scope: '/receipt-analyzer/',
        display: 'standalone',
        background_color: '#f7f7f5',
        theme_color: '#111111',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/receipt-analyzer/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.frankfurter\.app\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'frankfurter',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
  server: { host: true, port: 5173 }
});
