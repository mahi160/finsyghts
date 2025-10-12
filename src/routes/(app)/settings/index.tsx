import { createFileRoute } from '@tanstack/react-router'
import { CurrencySettings } from './-widgets/currency'
import ThemeSelector from './-widgets/themeSelector/theme'
import { SyncSettings } from './-widgets/sync/syncSettings'

export const Route = createFileRoute('/(app)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-8">
      <h1 className="font-bold text-2xl">Settings</h1>
      <ThemeSelector />
      <CurrencySettings />
      <SyncSettings />
    </div>
  )
}
