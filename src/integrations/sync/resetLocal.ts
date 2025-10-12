import { db } from '../db/db'

/**
 * Danger zone: Clears all local data and pulls everything from Supabase
 * Use with extreme caution as this will delete all local data
 */
export async function resetLocal(): Promise<boolean> {
  try {
    await Promise.all([
      db.accounts.clear(),
      db.categories.clear(),
      db.transactions.clear(),
      db.budgets.clear(),
      db.daily_summaries.clear(),
      db.currencies.clear(),
    ])
    localStorage.removeItem('user_id')
    return true
  } catch (err) {
    console.error('Error during clear and pull operation:', err)
    return false
  }
}
