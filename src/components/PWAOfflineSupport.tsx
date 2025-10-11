import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function PWAOfflineSupport() {
  // Track online status, could be used for conditional rendering if needed
  const [_isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning(
        'You are currently offline. Some features may be limited.',
        {
          duration: 5000,
          id: 'offline-toast',
        },
      )
    }

    const handleOnline = () => {
      setIsOnline(true)
      toast.success('You are back online!', {
        duration: 3000,
        id: 'online-toast',
      })
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // Could display a persistent offline banner if needed
  return null
}

// Service worker registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Check if we're in development mode
      const isDev = import.meta.env.DEV

      // In development, we'll still try to register but won't show errors
      // as Vite's dev server doesn't always serve the SW correctly
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.warn('SW registered: ', registration)

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing

            newWorker?.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                toast('App update available!', {
                  description: 'Reload to update to the latest version',
                  action: {
                    label: 'Reload',
                    onClick: () => window.location.reload(),
                  },
                  duration: 10000,
                })
              }
            })
          })
        })
        .catch((error) => {
          // In production, show errors
          // In development, only log the error without showing to user
          if (!isDev) {
            console.error('SW registration failed:', error)
          } else {
            console.warn(
              'SW registration failed (expected in dev mode):',
              error,
            )
          }
        })

      // Handle service worker updates
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
      })
    })
  }
}
