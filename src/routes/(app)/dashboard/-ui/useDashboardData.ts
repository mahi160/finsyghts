import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '@/integrations/db/db'
import { ETransactionType } from '@/integrations/db/db.type'

export function useDashboardData() {
  const transactions = useLiveQuery(() => db.transactions.toArray()) ?? []
  const accounts = useLiveQuery(() => db.accounts.toArray()) ?? []
  const categories = useLiveQuery(() => db.categories.toArray()) ?? []

  const metrics = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())

    // Pre-filter once for performance
    const validTransactions = transactions.filter((t) => !t.deleted_at)
    const validAccounts = accounts.filter(
      (a) => !a.deleted_at && !a.is_archived,
    )

    // Time-based groups
    const monthlyTransactions = validTransactions.filter(
      (t) => new Date(t.date) >= startOfMonth,
    )
    const weeklyTransactions = validTransactions.filter(
      (t) => new Date(t.date) >= startOfWeek,
    )

    // Summaries
    const sumByType = (tx: typeof transactions, type: ETransactionType) =>
      tx.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0)

    const monthlyIncome = sumByType(
      monthlyTransactions,
      ETransactionType.INCOME,
    )
    const monthlyExpenses = sumByType(
      monthlyTransactions,
      ETransactionType.EXPENSE,
    )
    const weeklyExpenses = sumByType(
      weeklyTransactions,
      ETransactionType.EXPENSE,
    )

    const totalBalance = validAccounts.reduce((sum, a) => sum + a.balance, 0)

    const topExpenseCategories = categories
      .map((cat) => {
        const amount = monthlyTransactions
          .filter(
            (t) =>
              t.category_id === cat.id && t.type === ETransactionType.EXPENSE,
          )
          .reduce((sum, t) => sum + t.amount, 0)
        return { name: cat.name, amount }
      })
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    const recentTransactions = validTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet: monthlyIncome - monthlyExpenses,
      weeklyExpenses,
      topExpenseCategories,
      recentTransactions,
      totalTransactions: validTransactions.length,
      totalAccounts: validAccounts.length,
    }
  }, [transactions, accounts, categories])

  return metrics
}
