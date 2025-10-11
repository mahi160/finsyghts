import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

let deferredPrompt: any

export function PWAInstallPrompt() {
  const [installable, setInstallable] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e
      // Update UI to notify the user they can install the PWA
      setInstallable(true)
    })

    window.addEventListener('appinstalled', () => {
      // Log install to analytics
      // PWA was successfully installed
      // Clear the deferredPrompt so it can be garbage collected
      deferredPrompt = null
      // Hide the install button
      setInstallable(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {})
      window.removeEventListener('appinstalled', () => {})
    }
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.warn('User accepted the install prompt')
      } else {
        console.warn('User dismissed the install prompt')
      }
      // We no longer need the prompt. Clear it up.
      deferredPrompt = null
      setInstallable(false)
    })
  }

  if (!installable) return null

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:max-w-sm sm:left-auto sm:right-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg flex items-center justify-between z-50 transition-all duration-300">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">Install Finsyghts</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          Add to your device for quick access
        </p>
      </div>
      <div className="flex gap-1.5 pl-2">
        <Button
          variant="outline"
          className="text-xs py-1 px-2"
          onClick={() => setInstallable(false)}
        >
          Not now
        </Button>
        <Button className="text-xs py-1 px-2" onClick={handleInstallClick}>
          Install
        </Button>
      </div>
    </div>
  )
}
