import { PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  name: string
  amount: number
}

interface TopCategoriesProps {
  categories: Array<CategoryData>
}

export function TopCategories({ categories }: TopCategoriesProps) {
  const hasData = categories.length > 0

  return (
    <Card className="md:col-span-1 lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Top Categories
        </CardTitle>
      </CardHeader>

      <CardContent>
        {hasData ? (
          <div className="space-y-3">
            {categories.map(({ name, amount }, index) => (
              <div
                key={name}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary/80" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{name}</p>
                    <p className="text-muted-foreground text-xs">
                      #{index + 1} this month
                    </p>
                  </div>
                </div>
                <div className="font-medium text-sm tabular-nums">
                  {formatCurrency(amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground text-sm">
            No expense categories yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
