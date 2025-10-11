import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Public VAPID key - in a real application, this would be generated
// and would need a matching private key on the server
const VAPID_PUBLIC_KEY =
  'BLBz-JqYZphTJQQH8cHi8FjtRT-KJKYaV-Gm__eo-aTZtk6W-uX6xHj3jdRiQaGU5QdWXi8bV5OzAZe_ygYk2Fo'

export interface PushNotificationOptions {
  enablePrompt?: boolean
  applicationServerKey?: string
}

export function usePushNotifications(options: PushNotificationOptions = {}) {
  const { enablePrompt = true, applicationServerKey = VAPID_PUBLIC_KEY } =
    options

  const [permission, setPermission] = useState<
    NotificationPermission | 'default'
  >('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  )
  const [supported, setSupported] = useState(false)

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported =
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window

      setSupported(isSupported)

      if (isSupported) {
        setPermission(Notification.permission)
      }
    }

    checkSupport()
  }, [])

  // Request permission and subscribe to push
  const subscribeToPush = async () => {
    if (!supported) {
      toast.error('Push notifications are not supported in this browser')
      return null
    }

    try {
      // Request notification permission
      if (Notification.permission === 'default' && enablePrompt) {
        const result = await Notification.requestPermission()
        setPermission(result)

        if (result !== 'granted') {
          toast.error('Notification permission denied')
          return null
        }
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Get push subscription
      let currentSubscription = await registration.pushManager.getSubscription()

      // If no subscription exists, create one
      if (!currentSubscription) {
        currentSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            applicationServerKey,
          ) as unknown as ArrayBuffer,
        })

        toast.success('Notifications enabled!')
      }

      // Store subscription
      setSubscription(currentSubscription)

      // Send the subscription to your server
      await sendSubscriptionToServer(currentSubscription)

      return currentSubscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Failed to enable notifications')
      return null
    }
  }

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const currentSubscription =
        await registration.pushManager.getSubscription()

      if (currentSubscription) {
        const result = await currentSubscription.unsubscribe()

        if (result) {
          setSubscription(null)
          toast.success('Notifications disabled')

          // Inform server about unsubscription
          await removeSubscriptionFromServer(currentSubscription)
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Failed to disable notifications')
      return false
    }
  }

  return {
    supported,
    permission,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
  }
}

// Helper function to convert base64 to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Function to send subscription to server
async function sendSubscriptionToServer(
  subscription: PushSubscription,
): Promise<boolean> {
  try {
    // In a real app, replace with your API endpoint
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription }),
    })

    return response.ok
  } catch (error) {
    console.error('Error sending subscription to server:', error)
    return false
  }
}

// Function to remove subscription from server
async function removeSubscriptionFromServer(
  subscription: PushSubscription,
): Promise<boolean> {
  try {
    // In a real app, replace with your API endpoint
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription }),
    })

    return response.ok
  } catch (error) {
    console.error('Error removing subscription from server:', error)
    return false
  }
}

// Component for notification permission button
export function NotificationPermissionButton() {
  const {
    supported,
    permission,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePushNotifications()

  if (!supported) {
    return null
  }

  const handleToggle = async () => {
    if (subscription) {
      await unsubscribeFromPush()
    } else {
      await subscribeToPush()
    }
  }

  return (
    <button
      onClick={handleToggle}
      className="px-4 py-2 bg-primary text-white rounded-md"
      disabled={permission === 'denied'}
    >
      {subscription ? 'Disable Notifications' : 'Enable Notifications'}
    </button>
  )
}
