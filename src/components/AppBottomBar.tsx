import { Link, useMatchRoute } from '@tanstack/react-router'
import { ArrowRightLeft, Home, Plus, Settings, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddRecord } from '@/widgets/AddRecord/AddRecordPopup'

export function AppBottomBar() {
  const matchRoute = useMatchRoute()
  const routes = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Add', path: '/add', icon: Plus, isAction: true },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-50 block w-full rounded-t-xl border border-primary/10 bg-background/90 shadow-xl backdrop-blur-xl sm:hidden">
      <div className="grid h-16 grid-cols-5">
        {routes.map((route) => {
          const isActive = matchRoute({ to: route.path, fuzzy: true })

          if (route.isAction) {
            return (
              <div
                key={route.name}
                className="relative flex items-center justify-center"
              >
                <AddRecord />
              </div>
            )
          }

          return (
            <Link
              key={route.name}
              to={route.path}
              className={cn(
                'group justify-baseline relative top-3 flex flex-col items-center',
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="-translate-x-1/2 absolute bottom-7 left-1/2 h-1 w-10 rounded-full bg-primary opacity-80"></span>
              )}

              <route.icon
                className={cn(
                  'size-[22px] transition-all',
                  isActive
                    ? 'stroke-[2.5px] text-primary'
                    : 'stroke-[1.5px] text-muted-foreground group-hover:stroke-[2px] group-hover:text-foreground',
                )}
              />
              {!isActive && (
                <span
                  className={cn(
                    'mt-1 font-medium text-[10px] transition-all',
                    'text-muted-foreground opacity-70 group-hover:opacity-90',
                  )}
                >
                  {route.name}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
