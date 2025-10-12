import { DialogTrigger } from '@radix-ui/react-dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { signInWithEmail } from '@/integrations/supabase/auth'
import { useAppStore } from '@/stores/useAppStore'
import { useAppForm } from '@/widgets/Form/useAppForm'

const schema = z.object({
  email: z.email('Invalid email address'),
  password: z.string('Password must be at least 6 characters').min(6),
})

export function LoginDialog() {
  const [open, setOpen] = useState(false)
  const { syncing, setSyncing } = useAppStore()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    setError(null)
    setSyncing(true)

    try {
      await signInWithEmail(email, password)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSyncing(false)
      setOpen(false)
      toast.success('Logged in and synced successfully!')
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to login. Please check your credentials.')
      setSyncing(false)
    }
  }

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async (values) => {
      const { email, password } = values.value
      await handleLogin(email, password)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!syncing) setOpen(isOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Cloud sync</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to enable cloud sync</DialogTitle>
          <DialogDescription>
            Access your financial data securely across all your devices
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.AppField name="email">
            {(field) => (
              <field.Input
                name={field.name}
                label="Email"
                type="email"
                placeholder="john.doe@example.com"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.Input
                type="password"
                minLength={6}
                label="Password"
                name={field.name}
                placeholder="Your secure password"
              />
            )}
          </form.AppField>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || syncing}
                >
                  {syncing ? 'Processing...' : 'Login & Sync'}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
