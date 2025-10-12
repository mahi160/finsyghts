import { createFileRoute } from '@tanstack/react-router'
import { CurrencySettings } from './-widgets/currency'
import ThemeSelector from './-widgets/themeSelector/theme'
import { SyncSettings } from './-widgets/sync/syncSettings'
import { ProfileWidget } from './-widgets/profile'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/(app)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
      <ProfileWidget />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-0">
          <CardContent className="p-6">
            <ThemeSelector />
          </CardContent>
        </Card>
        <Card className="p-0">
          <CardContent className="p-6">
            <SyncSettings />
          </CardContent>
        </Card>
      </div>
      <Card className="p-0">
        <CardContent className="p-6">
          <CurrencySettings />
        </CardContent>
      </Card>
    </div>
  )
}
