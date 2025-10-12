import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { TransactionFilters } from './-ui/transactionFilters'
import { TransactionList } from './-ui/transactionList'
import type { ETransactionType } from '@/integrations/db/db.type'
import { PageHeading } from '@/components/PageHeading'
import {
  useAccountsStore,
  useCategoriesStore,
  useTransactionsStore,
} from '@/integrations/db/db.store'
import { AddRecord } from '@/widgets/AddRecord/AddRecordPopup'

export const Route = createFileRoute('/(app)/transactions/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { items: transactions } = useTransactionsStore()
  const { items: accounts } = useAccountsStore()
  const { items: categories } = useCategoriesStore()
  const [filters, setFilters] = useState({
    type: null as ETransactionType | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    accountId: null as string | null,
    categoryId: null as string | null,
  })

  const filteredTransactions = transactions
    .filter((t) => !filters.type || t.type === filters.type)
    .filter((t) => !filters.startDate || new Date(t.date) >= filters.startDate)
    .filter((t) => !filters.endDate || new Date(t.date) <= filters.endDate)
    .filter(
      (t) =>
        !filters.accountId ||
        t.account_from_id === filters.accountId ||
        t.account_to_id === filters.accountId,
    )
    .filter((t) => !filters.categoryId || t.category_id === filters.categoryId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeading
          title="Transactions"
          subtitle="View and manage all your transactions"
        />
        <AddRecord />
      </div>

      <div className="mt-6">
        <TransactionFilters
          accounts={accounts}
          categories={categories}
          filters={filters}
          onFilterChange={setFilters}
        />

        {filteredTransactions.length > 0 ? (
          <TransactionList
            transactions={filteredTransactions}
            accounts={accounts}
            categories={categories}
          />
        ) : (
          <div className="mt-8 text-center text-muted-foreground p-8 border rounded-lg flex flex-col items-center gap-4">
            <p>No transactions found matching your filters.</p>
          </div>
        )}
      </div>
    </>
  )
}
