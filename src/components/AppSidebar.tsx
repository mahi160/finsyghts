import { Link } from '@tanstack/react-router'
import {
  ArrowRightLeft,
  ChartNoAxesColumn,
  Home,
  LayoutGrid,
  Settings,
  Wallet,
} from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { AddRecord } from '@/widgets/AddRecord/AddRecordPopup'

export function AppSidebar() {
  const paths = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Categories', path: '/categories', icon: LayoutGrid },
    // { name: 'Budgets', path: '/budgets', icon: ChartNoAxesColumn },
    { name: 'Settings', path: '/settings', icon: Settings, separator: 'above' },
  ]

  return (
    <Sidebar collapsible="icon" className="hidden sm:flex">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ChartNoAxesColumn size={18} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-base tracking-wider">
                    Finsyghts
                  </span>
                  <span className="truncate text-muted-foreground text-xs">
                    Standard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <AddRecord className="mx-4 mt-4 mb-2" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {paths.map((item) => (
                <Fragment key={item.name}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.path}
                        className="h-10 px-4 [&.active]:bg-primary/10 [&.active]:text-primary"
                      >
                        <item.icon className="size-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter></SidebarFooter>
    </Sidebar>
  )
}
