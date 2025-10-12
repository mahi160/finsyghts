import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppBottomBar } from '@/components/AppBottomBar'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from '@/integrations/supabase/provider'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="h-vh w-full p-8 pb-20 sm:pb-8">
          <Outlet />
        </main>
        <AppBottomBar />
      </SidebarProvider>
    </AuthProvider>
  )
}
