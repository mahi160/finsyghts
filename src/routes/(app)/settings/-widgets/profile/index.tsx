import { LogOut, Mail } from 'lucide-react'
import { useAuth } from '@/integrations/supabase/useAuth'
import { signOut } from '@/integrations/supabase/auth'
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
import { resetLocal } from '@/integrations/sync/resetLocal'

export function ProfileWidget() {
  const { user } = useAuth()

  if (!user) return null

  const handleLogout = async () => {
    await signOut()
    await resetLocal()
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
            className="flex items-center gap-2 h-8 px-3 rounded-lg"
            size="sm"
          >
            <span className="hidden sm:inline text-sm font-medium">
              {username}
            </span>
            <Avatar className="h-5 w-5 border border-primary/50">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                {getInitials(user.email || '')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-0 rounded-lg shadow-md"
          align="end"
          sideOffset={4}
        >
          <div className="p-3 bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-primary/50">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(user.email || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{username}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Mail className="mr-1 h-3 w-3" />
                  {user.email}
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-2 py-0.5"
              >
                Online
              </Badge>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full mt-2 text-xs"
              size="sm"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Logout & Clear Data
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
