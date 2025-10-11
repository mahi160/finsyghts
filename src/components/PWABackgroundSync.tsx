import { useEffect } from 'react'
import { toast } from 'sonner'

export interface SyncOptions {
  tag?: string
  // Options for customizing sync behavior
  maxRetries?: number
  // Data to sync
  data?: any
}

export const defaultSyncOptions: SyncOptions = {
  tag: 'background-sync',
  maxRetries: 5,
}

/**
 * Register background sync for offline operations
 * This allows operations to be queued when offline and synced when back online
 */
export function useBackgroundSync(options: SyncOptions = defaultSyncOptions) {
  const { tag = 'background-sync' } = options

  useEffect(() => {
    const registerBackgroundSync = async () => {
      if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
        console.warn('Background Sync is not supported in this browser')
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        // Using any to handle the Sync API which may not be in all TypeScript definitions
        await (registration as any).sync.register(tag)
        // Background sync registered successfully
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }

    registerBackgroundSync()

    // Listen for sync success events from the service worker
    const messageHandler = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === 'SYNC_COMPLETE' &&
        event.data.tag === tag
      ) {
        toast.success('Your changes have been synced', {
          description: 'All pending data has been saved to the server',
          duration: 3000,
        })
      }
    }

    navigator.serviceWorker.addEventListener('message', messageHandler)

    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler)
    }
  }, [tag])
}

/**
 * Queue data for background sync when offline
 * @param data Data to be synced
 * @param endpoint API endpoint to sync with
 */
export async function queueDataForSync(
  data: any,
  endpoint: string,
): Promise<boolean> {
  // If online, try to send directly first
  if (navigator.onLine) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) return true
    } catch (error) {
      console.warn('Failed to send directly, queueing for background sync')
    }
  }

  // If offline or request failed, queue for background sync
  try {
    // Store in IndexedDB for service worker to pick up
    const dbPromise = indexedDB.open('background-sync-store', 1)

    dbPromise.onupgradeneeded = (event: any) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', {
          keyPath: 'id',
          autoIncrement: true,
        })
      }
    }

    dbPromise.onsuccess = (event: any) => {
      const db = event.target.result
      const tx = db.transaction('sync-queue', 'readwrite')
      const store = tx.objectStore('sync-queue')

      store.add({
        endpoint,
        data,
        timestamp: new Date().getTime(),
      })

      tx.oncomplete = () => {
        // Request a background sync
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then((registration) => {
            // Using any to handle the Sync API which may not be in all TypeScript definitions
            ;(registration as any).sync
              .register('background-sync')
              .catch((err: Error) =>
                console.error('Background sync registration failed:', err),
              )
          })
        }
      }
    }

    return true
  } catch (error) {
    console.error('Error queueing for background sync:', error)
    return false
  }
}
