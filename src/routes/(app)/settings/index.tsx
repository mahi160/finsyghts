import { createFileRoute } from '@tanstack/react-router'
import { CurrencySettings } from './-widgets/currency'
import ThemeSelector from './-widgets/themeSelector/theme'
import { SyncSettings } from './-widgets/sync/syncSettings'
import { ProfileWidget } from './-widgets/profile'

export const Route = createFileRoute('/(app)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-8">
      <ProfileWidget />
      <ThemeSelector />
      <CurrencySettings />
      <SyncSettings />
    </div>
  )
}
