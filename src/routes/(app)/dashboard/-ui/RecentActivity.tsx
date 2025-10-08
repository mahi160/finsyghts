import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { ITransaction } from '@/integrations/db/db.type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ETransactionType } from '@/integrations/db/db.type'

interface RecentActivityProps {
  transactions: Array<ITransaction>
}

const typeConfig = {
  [ETransactionType.INCOME]: {
    icon: ArrowUpRight,
    color: 'text-primary',
    sign: '+',
  },
  [ETransactionType.EXPENSE]: {
    icon: ArrowDownRight,
    color: 'text-destructive',
    sign: '-',
  },
  [ETransactionType.TRANSFER]: {
    icon: Activity,
    color: 'text-accent',
    sign: '',
  },
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 md:px-6">
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const { icon: Icon, color, sign } = typeConfig[tx.type]

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm leading-none">
                        {tx.description || 'Transaction'}
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className={`flex-shrink-0 font-medium text-sm ${color}`}>
                    {sign}
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="py-8 text-center text-muted-foreground text-sm">
              No transactions yet. Start by adding your first transaction!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
