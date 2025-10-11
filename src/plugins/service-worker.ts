// This plugin ensures that the service worker is served with the correct MIME type in development mode
import type { Plugin } from 'vite'

export function serviceWorkerPlugin(): Plugin {
  return {
    name: 'vite-plugin-service-worker',
    configureServer(server) {
      // Add middleware to handle service worker requests
      server.middlewares.use((req, res, next) => {
        // Check if the request is for the service worker
        if (req.url?.endsWith('/sw.js')) {
          res.setHeader('Content-Type', 'application/javascript')
        } else if (req.url?.endsWith('/registerSW.js')) {
          res.setHeader('Content-Type', 'application/javascript')
        } else if (
          req.url?.endsWith('/workbox-47da91e0.js') ||
          req.url?.match(/workbox-.*\.js$/)
        ) {
          res.setHeader('Content-Type', 'application/javascript')
        }
        next()
      })
    },
  }
}
