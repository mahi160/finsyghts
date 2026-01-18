import type { ITransaction } from '@/integrations/db/db.type'
import { db } from '@/integrations/db/db'
import { createWithMeta } from '@/integrations/db/db.utils'
import { updateCategoryStats } from '@/integrations/db/db.helpers'
import { ETransactionType } from '@/integrations/db/db.type'
import {
  useAccountsStore,
  useCategoriesStore,
  useTransactionsStore,
} from '@/integrations/db/db.store'

export async function addRecord(data: Partial<ITransaction>): Promise<string> {
  return await db.transaction(
    'rw',
    [db.transactions, db.accounts, db.categories],
    async () => {
      const transactionData = createWithMeta({
        type: data.type!,
        date: data.date!,
        amount: data.amount!,
        account_from_id: data.account_from_id!,
        account_to_id: data.account_to_id,
        category_id: data.category_id,
        description: data.description,
        currency: data.currency || 'USD',
      })

      const transactionId = await db.transactions.add(transactionData)

      if (data.type === ETransactionType.EXPENSE) {
        const accountFrom = await db.accounts.get(data.account_from_id!)
        if (accountFrom) {
          await db.accounts.update(accountFrom.id, {
            balance: accountFrom.balance - data.amount!,
            updated_at: new Date(),
            sync_status: 'pending',
          })
        }
      }

      if (data.type === ETransactionType.INCOME) {
        const accountTo = await db.accounts.get(data.account_to_id!)
        if (accountTo) {
          await db.accounts.update(accountTo.id, {
            balance: accountTo.balance + data.amount!,
            updated_at: new Date(),
            sync_status: 'pending',
          })
        }
      }

      if (data.type === ETransactionType.TRANSFER) {
        const accountFrom = await db.accounts.get(data.account_from_id!)
        if (accountFrom) {
          await db.accounts.update(accountFrom.id, {
            balance: accountFrom.balance - data.amount!,
            updated_at: new Date(),
            sync_status: 'pending',
          })
        }

        if (data.account_to_id) {
          const accountTo = await db.accounts.get(data.account_to_id)
          if (accountTo) {
            await db.accounts.update(accountTo.id, {
              balance: accountTo.balance + data.amount!,
              updated_at: new Date(),
              sync_status: 'pending',
            })
          }
        }
      }

      if (data.category_id) {
        await updateCategoryStats(data.category_id, data.amount!, 1)
      }

      const { fetchAll: fetchTransactions } = useTransactionsStore.getState()
      const { fetchAll: fetchAccounts } = useAccountsStore.getState()
      const { fetchAll: fetchCategories } = useCategoriesStore.getState()

      await Promise.all([
        fetchTransactions(),
        fetchAccounts(),
        fetchCategories(),
      ])

      return transactionId
    },
  )
}
