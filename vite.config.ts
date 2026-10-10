import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // relative paths: works on GitHub Pages (/badminton-daily-coach/) and on a root domain
  base: './',
  build: { chunkSizeWarningLimit: 800 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/b3.svg', 'icons/b3-32.png', 'icons/b1-180.png'],
      manifest: {
        name: 'Badminton Daily Coach',
        short_name: 'Daily Coach',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#2E6A52',
        theme_color: '#2E6A52',
        icons: [
          { src: 'icons/b1-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/b1-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/b3.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // the privacy page is a separate static page, not the app
        navigateFallbackDenylist: [/datenschutz/],
        runtimeCaching: [
          {
            // bundled fonts: only the subsets a page needs are downloaded, then kept offline
            urlPattern: /\.woff2?$/,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
});
