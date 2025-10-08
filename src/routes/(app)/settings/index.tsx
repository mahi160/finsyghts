import { createFileRoute } from '@tanstack/react-router'
import ThemeSelector from '@/widgets/ThemeSelector/theme'

export const Route = createFileRoute('/(app)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="font-bold text-2xl">Settings</h1>
      <ThemeSelector />
    </div>
  )
}
