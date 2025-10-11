import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { pwaConfig } from './pwa.config'
import { serviceWorkerPlugin } from './src/plugins/service-worker'

// https://vitejs.dev/config/
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
    cssMinify: true,
    sourcemap: true,
  },
})
