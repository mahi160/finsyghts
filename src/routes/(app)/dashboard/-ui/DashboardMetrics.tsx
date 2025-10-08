import { DollarSign, PlusCircle, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface DashboardMetricsProps {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyNet: number
  totalAccounts: number
}

const metricsConfig = [
  {
    title: 'Total Balance',
    icon: DollarSign,
    valueKey: 'totalBalance',
    subtext: (data: DashboardMetricsProps) => `${data.totalAccounts} accounts`,
    color: 'text-foreground',
  },
  {
    title: 'Monthly Income',
    icon: TrendingUp,
    valueKey: 'monthlyIncome',
    subtext: () => 'This month',
    color: 'text-primary',
  },
  {
    title: 'Monthly Expenses',
    icon: TrendingDown,
    valueKey: 'monthlyExpenses',
    subtext: () => 'This month',
    color: 'text-destructive',
  },
  {
    title: 'Monthly Net',
    icon: PlusCircle,
    valueKey: 'monthlyNet',
    subtext: () => 'Income - Expenses',
    color: (data: DashboardMetricsProps) =>
      data.monthlyNet >= 0 ? 'text-primary' : 'text-destructive',
  },
]

export function DashboardMetrics(props: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {metricsConfig.map(({ title, icon: Icon, valueKey, subtext, color }) => {
        const value = props[valueKey as keyof DashboardMetricsProps]
        const colorClass = typeof color === 'function' ? color(props) : color

        return (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-xs md:text-sm">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-lg md:text-2xl ${colorClass}`}>
                {formatCurrency(value)}
              </div>
              <p className="text-muted-foreground text-xs">{subtext(props)}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
