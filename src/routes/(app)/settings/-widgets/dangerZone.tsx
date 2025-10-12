import React from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { resetLocal } from '@/integrations/sync/resetLocal'

export function DangerZone() {
  const [isResetting, setIsResetting] = React.useState(false)

  const handleResetData = async () => {
    try {
      setIsResetting(true)
      toast.info('Clearing local data and pulling from cloud...')

      const result = await resetLocal()

      if (result) {
        toast.success('Successfully reset and restored data from cloud')
      } else {
        toast.error('Failed to reset data. Please try again.')
      }
    } catch (err) {
      console.error('Error during data reset:', err)
      toast.error('Failed to reset data. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Actions here can cause data loss. Use with extreme caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Reset Local Data</h3>
            <p className="text-xs text-muted-foreground">
              Deletes all local data and pulls fresh copy from the cloud.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Reset Data'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all data stored on this device
                  and replace it with data from the cloud.
                  <br />
                  <br />
                  <span className="font-bold text-destructive">
                    Any local changes that haven't been synced will be lost
                    forever!
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetData}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Reset Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
