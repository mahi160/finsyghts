import { LogOut, Mail } from 'lucide-react'
import { useAuth } from '@/integrations/supabase/useAuth'
import { signOut } from '@/integrations/supabase/auth'
import { db } from '@/integrations/db/db'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { PageHeading } from '@/components/PageHeading'

export function ProfileWidget() {
  const { user } = useAuth()

  if (!user) return null

  const handleLogout = async () => {
    try {
      await Promise.all([
        db.accounts.clear(),
        db.categories.clear(),
        db.transactions.clear(),
        db.budgets.clear(),
        db.daily_summaries.clear(),
        db.currencies.clear(),
      ])
      localStorage.removeItem('user_id')
      await signOut()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }
  const username = user.email?.split('@')[0] || 'User'

  return (
    <div className="flex justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
      <PageHeading title="Settings"></PageHeading>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 h-10 px-3 rounded-lg"
            size="sm"
          >
            <span className="hidden sm:inline font-medium">{username}</span>
            <Avatar className="h-6 w-6 border border-primary/50">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.email || '')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 rounded-lg shadow-md"
          align="end"
          sideOffset={4}
        >
          <div className="p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-primary/50">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user.email || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{username}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-1 h-3 w-3" />
                  {user.email}
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/20 text-xs px-2 py-0.5"
              >
                Online
              </Badge>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full mt-2"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout & Clear Data
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
