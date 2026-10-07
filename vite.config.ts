import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Relative paths support GitHub Pages project URLs.
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version),
    __APP_BUILD__: JSON.stringify(new Date().toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '.')),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      injectRegister: false,
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.ico', 'brand/viso-smart-icon.svg', 'brand/viso-smart-180.png'],
      manifest: {
        id: './',
        lang: 'pt-BR',
        dir: 'ltr',
        categories: ['finance', 'productivity', 'education'],
        prefer_related_applications: false,
        screenshots: [
          {
            src: 'screenshot-dashboard.png',
            sizes: '1440x900',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Tela inicial do Viso Smart em computador, com valores de exemplo',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Tela inicial do Viso Smart em celular, com valores de exemplo',
          },
        ],
        launch_handler: {
          client_mode: 'navigate-existing',
        },
        name: 'Viso Smart',
        short_name: 'Viso Smart',
        description: 'Planeje com clareza. Acompanhe com inteligência. Educação financeira e metas para jovens.',
        theme_color: '#102A5C',
        background_color: '#F4F7FB',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        start_url: './',
        scope: './',
        shortcuts: [
          {
            name: 'Abrir painel',
            short_name: 'Painel',
            description: 'Abrir o painel financeiro do Viso Smart',
            url: './',
            icons: [
          { src: 'brand/viso-smart-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
          { src: 'brand/viso-smart-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: 'brand/viso-smart-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'brand/viso-smart-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },{ src: 'brand/viso-smart-512.png', sizes: '512x512', type: 'image/png' }],
          },
        ],
        icons: [
          { src: 'brand/viso-smart-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
          { src: 'brand/viso-smart-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: 'brand/viso-smart-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'brand/viso-smart-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          {
            src: 'brand/viso-smart-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'brand/viso-smart-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest,json}'],
        globIgnores: ['**/screenshot-*.png', '**/brand/nexo-*'],
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
