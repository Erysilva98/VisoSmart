import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Relative paths support GitHub Pages project URLs.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      injectRegister: false,
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.ico', 'brand/nexo-favicon-v2.svg', 'brand/nexo-apple-touch-v2.png'],
      manifest: {
        id: './',
        lang: 'pt-BR',
        dir: 'ltr',
        categories: ['finance', 'productivity', 'education'],
        prefer_related_applications: false,
        launch_handler: {
          client_mode: 'navigate-existing',
        },
        name: 'Nexo',
        short_name: 'Nexo',
        description: 'Pequenos passos, grandes conquistas. Aprenda. Organize. Evolua.',
        theme_color: '#111936',
        background_color: '#111936',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        start_url: './',
        scope: './',
        shortcuts: [
          {
            name: 'Abrir painel',
            short_name: 'Painel',
            description: 'Abrir o painel financeiro do Nexo',
            url: './',
            icons: [
          { src: 'brand/nexo-trail-48-v3.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
          { src: 'brand/nexo-trail-96-v3.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: 'brand/nexo-trail-128-v3.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'brand/nexo-trail-192-v2.png', sizes: '192x192', type: 'image/png', purpose: 'any' },{ src: 'brand/nexo-trail-512-v2.png', sizes: '512x512', type: 'image/png' }],
          },
        ],
        icons: [
          { src: 'brand/nexo-trail-48-v3.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
          { src: 'brand/nexo-trail-96-v3.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: 'brand/nexo-trail-128-v3.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'brand/nexo-trail-192-v2.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          {
            src: 'brand/nexo-trail-512-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'brand/nexo-trail-maskable-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest,json}'],
        globIgnores: ['**/screenshot-dashboard.png'],
        navigateFallback: 'index.html',
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('jspdf')) return 'pdf';
          if (id.includes('html2canvas')) return 'pdf-canvas';
          if (id.includes('canvg')) return 'pdf-svg';
          if (id.includes('recharts') || id.includes('/d3-')) return 'charts';
          if (id.includes('lucide-react')) return 'icons';
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (id.includes('framer-motion')) return 'motion';
          return 'vendor';
        },
      },
    },
  },
});
