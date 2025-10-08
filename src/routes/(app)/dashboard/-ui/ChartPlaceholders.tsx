import { BarChart3, Calendar, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface ChartPlaceholdersProps {
  weeklyExpenses: number
  totalTransactions: number
}

const chartConfigs = [
  {
    title: 'Monthly Trend',
    icon: BarChart3,
    type: 'placeholder',
  },
  {
    title: 'Spending Breakdown',
    icon: PieChart,
    type: 'placeholder',
  },
  {
    title: 'This Week',
    icon: Calendar,
    type: 'summary',
  },
]

export function ChartPlaceholders({
  weeklyExpenses,
  totalTransactions,
}: ChartPlaceholdersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chartConfigs.map(({ title, icon: Icon, type }) => (
        <Card
          key={title}
          className={title === 'This Week' ? 'md:col-span-2 lg:col-span-1' : ''}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {type === 'placeholder' ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/30">
                <div className="text-center">
                  <Icon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-xs">
                    Chart coming soon
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-bold text-2xl">
                  {formatCurrency(weeklyExpenses)}
                </div>
                <p className="text-muted-foreground text-xs">Total spending</p>
                <div className="text-muted-foreground text-sm">
                  {totalTransactions} total transactions
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
