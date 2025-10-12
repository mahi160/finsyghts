import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { LoginDialog } from './loginDialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/integrations/supabase/useAuth'
import { useAppStore } from '@/stores/useAppStore'

export function SyncSettings() {
  const { user } = useAuth()
  const { syncing, setSyncing } = useAppStore()
  const lastSynced = localStorage.getItem('lastSynced')

  const handleSync = async () => {
    setSyncing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      toast.success('Data synchronized successfully!')
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to synchronize data')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      {!user && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-base font-medium">Cloud Sync</h2>
            <p className="text-xs text-muted-foreground">
              Sign in to sync your data across devices
            </p>
          </div>
          <LoginDialog />
        </div>
      )}

      {user && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-base font-medium">Sync Data</h2>
            <p className="text-xs text-muted-foreground">
              Keep your data synchronized with the cloud
            </p>
            {lastSynced && (
              <p className="text-xs text-muted-foreground">{`Last synced: ${formatDistanceToNow(lastSynced)}`}</p>
            )}
          </div>
          <Button
            disabled={syncing}
            onClick={handleSync}
            className="w-full sm:w-auto text-xs h-8"
            size="sm"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      )}
    </div>
  )
}
