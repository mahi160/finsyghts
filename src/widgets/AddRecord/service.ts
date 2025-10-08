import { add, remove } from 'dexie'
import type { ITransaction } from '@/integrations/db/db.type'
import { db } from '@/integrations/db/db'
import { addRecord, updateRecord } from '@/integrations/db/db.utils'

export async function addTransactionService(data: ITransaction) {
  return await db.transaction(
    'rw',
    db.transactions,
    db.accounts,
    db.categories,
    async () => {
      await addRecord('transactions', data)
      if (data.category_id) {
        await updateRecord('categories', data.category_id, {
          count: add(1),
        })
      }

      if (data.account_to_id) {
        await updateRecord('accounts', data.account_to_id, {
          balance: add(data.amount),
        })
      }
      if (data.account_from_id) {
        await updateRecord('accounts', data.account_from_id, {
          balance: remove(data.amount),
        })
      }
    },
  )
}
