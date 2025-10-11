import Dexie from 'dexie'
import { ulid } from 'ulid'
import { defaultAccounts, defaultCategories } from './db.seed'
import type {
  IAccount,
  IBudget,
  ICategory,
  ICurrency,
  IDailySummary,
  IMetaData,
  ITransaction,
} from './db.type'
import type { EntityTable } from 'dexie'

function seedWithMeta<T>(items: Array<T>): Array<T & IMetaData> {
  const now = new Date()
  return items.map((item) => ({
    ...item,
    id: ulid(now.getTime()),
    user_id: localStorage.getItem('user_id') as string,
    created_at: now,
    updated_at: now,
    sync_status: 'pending' as const,
  }))
}

class FinancialDatabase extends Dexie {
  transactions!: EntityTable<ITransaction, 'id'>
  accounts!: EntityTable<IAccount, 'id'>
  categories!: EntityTable<ICategory, 'id'>
  budgets!: EntityTable<IBudget, 'id'>
  daily_summaries!: EntityTable<IDailySummary, 'id'>
  currencies!: EntityTable<ICurrency, 'id'>

  constructor() {
    super('FinancialDatabase')
    this.version(1).stores({
      transactions:
        '&id, user_id, date, type, account_from_id, account_to_id, category_id, amount, sync_status, currency, [user_id+date], [user_id+sync_status], [date+type], [account_from_id+date], [category_id+date], [user_id+date+type]',
      accounts:
        '&id, user_id, name, type, currency, balance, is_archived, sync_status, [user_id+type], [user_id+sync_status], [user_id+is_archived], [type+is_archived]',
      categories:
        '&id, user_id, name, transaction_type, parent_category_id, is_archived, sync_status, [user_id+transaction_type], [user_id+sync_status], [user_id+is_archived], [parent_category_id+transaction_type]',
      budgets:
        '&id, user_id, category_id, period_start, period_end, period_key, amount, currency, is_archived, sync_status, [user_id+category_id], [user_id+sync_status], [user_id+period_key], [category_id+period_key]',
      daily_summaries:
        '&id, user_id, date, total_income, total_expense, currency, sync_status, [user_id+date], [user_id+sync_status], [date+currency]',
      currencies:
        '&id, &code, name, symbol, updated_at, is_default, user_id, [id+user_id]',
    })

    this.on('populate', async () => {
      const seededCategories = seedWithMeta(defaultCategories)
      await this.categories.bulkPut(seededCategories)

      const seedAccounts = seedWithMeta(defaultAccounts)
      await this.accounts.bulkPut(seedAccounts)
    })
  }
}

export const db = new FinancialDatabase()
