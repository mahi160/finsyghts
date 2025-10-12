import { useState } from 'react'
import { ArrowRight, Edit, Trash } from 'lucide-react'
import type {
  IAccount,
  ICategory,
  ITransaction,
} from '@/integrations/db/db.type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTransactionsStore } from '@/integrations/db/db.store'
import { cn, formatCurrency } from '@/lib/utils'

interface TransactionCardProps {
  transaction: ITransaction
  accounts: Array<IAccount>
  categories: Array<ICategory>
}

export function TransactionCard({
  transaction,
  accounts,
  categories,
}: TransactionCardProps) {
  const { remove } = useTransactionsStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const accountFrom = accounts.find((a) => a.id === transaction.account_from_id)
  const accountTo = accounts.find((a) => a.id === transaction.account_to_id)
  const category = categories.find((c) => c.id === transaction.category_id)

  const handleDelete = async () => {
    await remove(transaction.id)
    setConfirmDelete(false)
  }

  return (
    <>
      <div
        className={cn(
          'p-4 border rounded-lg flex items-center justify-between',
          transaction.type === 'income' && 'border-l-4 border-l-green-500',
          transaction.type === 'expense' && 'border-l-4 border-l-red-500',
          transaction.type === 'transfer' && 'border-l-4 border-l-blue-500',
        )}
      >
        <div className="flex-1">
          <div className="flex items-center">
            <div
              className={cn(
                'w-2 h-2 rounded-full mr-2',
                transaction.type === 'income' && 'bg-green-500',
                transaction.type === 'expense' && 'bg-red-500',
                transaction.type === 'transfer' && 'bg-blue-500',
              )}
            />
            <span className="font-medium">
              {transaction.description || transaction.type}
            </span>
          </div>

          <div className="text-sm text-muted-foreground mt-1">
            {transaction.type === 'transfer' ? (
              <div className="flex items-center gap-1">
                <span>{accountFrom?.name}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{accountTo?.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span>{accountFrom?.name || accountTo?.name}</span>
                {category && <span>• {category.name}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              'font-medium',
              transaction.type === 'income' &&
                'text-green-600 dark:text-green-400',
              transaction.type === 'expense' &&
                'text-red-600 dark:text-red-400',
            )}
          >
            {transaction.type === 'income'
              ? '+'
              : transaction.type === 'expense'
                ? '-'
                : ''}
            {formatCurrency(
              transaction.amount,
              transaction.currency || accountFrom?.currency || 'USD',
            )}
          </span>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
