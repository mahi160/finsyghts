import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { pwaConfig } from './pwa.config'
import { serviceWorkerPlugin } from './src/plugins/service-worker'

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true, target: 'react' }),
    viteReact(),
    tailwindcss(),
    VitePWA(pwaConfig),
    serviceWorkerPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'esbuild',
    cssMinify: 'lightningcss', // Better CSS minification
    sourcemap: false, // ⚠️ CHANGED: Disable in production (exposes code)
    target: 'es2020', // Modern browsers only
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // React core (changes rarely)
          'vendor-react': ['react', 'react-dom'],

          // Router (changes rarely)
          'vendor-router': ['@tanstack/react-router'],

          // Forms (changes occasionally)
          'vendor-form': ['@tanstack/react-form', 'zod'],

          // Database (changes rarely)
          'vendor-db': ['dexie', 'dexie-react-hooks', 'dexie-export-import'],

          // UI components (changes rarely)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
          ],

          // Utilities (changes rarely)
          'vendor-utils': [
            'date-fns',
            'ulid',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
          ],

          // Icons (large, rarely changes)
          'vendor-icons': ['lucide-react'],
        },

        // Naming for better debugging
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      'dexie',
      'zustand',
    ],
  },
})
