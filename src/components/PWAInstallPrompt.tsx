import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib'

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
    <div
      className={cn(
        'fixed inset-x-3 bottom-[64px] sm:bottom-6 sm:right-6 sm:left-auto sm:w-[360px]',
        'bg-background/90 backdrop-blur-md border border-border/40 shadow-xl rounded-2xl z-50',
        'p-4 flex items-start sm:items-center justify-between gap-3',
        'animate-in fade-in slide-in-from-bottom-4 duration-300',
      )}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
          Install Finsyghts
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          Add to your home screen for quick access
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => setInstallable(false)}
        >
          Not now
        </Button>
        <Button
          size="sm"
          className="text-xs sm:text-sm"
          onClick={handleInstallClick}
        >
          Install
        </Button>
      </div>
    </div>
  )
}
