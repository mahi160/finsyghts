import { createFileRoute } from '@tanstack/react-router'
import { ChartPlaceholders } from './-ui/ChartPlaceholders'
import { DashboardMetrics } from './-ui/DashboardMetrics'
import { RecentActivity } from './-ui/RecentActivity'
import { TopCategories } from './-ui/TopCategories'
import { useDashboardData } from './-ui/useDashboardData'
import { PageHeading } from '@/components/PageHeading'

export const Route = createFileRoute('/(app)/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const metrics = useDashboardData()

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeading
        title="Dashboard"
        subtitle="Your financial overview at a glance"
      />

      {/* Key Metrics */}
      <DashboardMetrics
        totalBalance={metrics.totalBalance}
        monthlyIncome={metrics.monthlyIncome}
        monthlyExpenses={metrics.monthlyExpenses}
        monthlyNet={metrics.monthlyNet}
        totalAccounts={metrics.totalAccounts}
      />

      {/* Main Content - Mobile responsive layout */}
      <div className="grid gap-4 md:gap-3 lg:grid-cols-6">
        <RecentActivity transactions={metrics.recentTransactions} />
        <TopCategories categories={metrics.topExpenseCategories} />
      </div>

      {/* Chart Placeholders and Additional Stats */}
      <ChartPlaceholders
        weeklyExpenses={metrics.weeklyExpenses}
        totalTransactions={metrics.totalTransactions}
      />
    </div>
  )
}
