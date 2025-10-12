import { useMemo } from 'react'
import { TransactionCard } from './transactionCard'
import type {
  IAccount,
  ICategory,
  ITransaction,
} from '@/integrations/db/db.type'
import { formatDate } from '@/lib/utils'

type GroupedTransactions = Record<string, Array<ITransaction>>

interface TransactionListProps {
  transactions: Array<ITransaction>
  accounts: Array<IAccount>
  categories: Array<ICategory>
}

export function TransactionList({
  transactions,
  accounts,
  categories,
}: TransactionListProps) {
  const groupedTransactions = useMemo(() => {
    const grouped: GroupedTransactions = {}

    transactions.forEach((transaction) => {
      const dateKey = formatDate(transaction.date, 'yyyy-MM-dd')
      grouped[dateKey].push(transaction)
    })

    return grouped
  }, [transactions])

  const sortedDateKeys = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )

  return (
    <div className="space-y-6 mt-6">
      {sortedDateKeys.map((dateKey) => (
        <div key={dateKey} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-2">
            {formatDate(dateKey, 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {groupedTransactions[dateKey].map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                accounts={accounts}
                categories={categories}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
