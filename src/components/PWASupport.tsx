import { useEffect } from 'react'
import { PWAInstallPrompt } from './PWAInstallPrompt'
import { PWAOfflineSupport, registerServiceWorker } from './PWAOfflineSupport'

export interface PWAFeatures {
  installPrompt?: boolean
  offlineSupport?: boolean
  backgroundSync?: boolean
}

export function PWASupport({
  features = {
    installPrompt: true,
    offlineSupport: true,
    backgroundSync: true,
  },
}: {
  features?: PWAFeatures
}) {
  const { installPrompt = true, offlineSupport = true } = features

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <>
      {/* Silent components that provide functionality without UI */}
      {offlineSupport && <PWAOfflineSupport />}

      {/* Visible components */}
      {installPrompt && <PWAInstallPrompt />}
    </>
  )
}

// Main PWA integration component for your app
export function SuperPWA() {
  return (
    <PWASupport
      features={{
        installPrompt: true,
        offlineSupport: true,
        backgroundSync: true,
      }}
    />
  )
}
