export interface IMetaData {
  id: string
  user_id: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  sync_status: 'synced' | 'pending' | 'failed'
  synced_at?: Date
}

export enum ETransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}
export interface ITransaction extends IMetaData {
  date: Date
  amount: number
  description?: string
  type: ETransactionType
  account_from_id: string
  account_to_id?: string
  category_id?: string
  currency?: string
}

export enum EAccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
  CASH = 'cash',
  INVESTMENT = 'investment',
}
export interface IAccount extends IMetaData {
  initial_balance: number
  balance: number
  name: string
  type: EAccountType
  currency: string
  color?: string
  is_archived?: boolean
}

export interface ICategory extends IMetaData {
  name: string
  transaction_type: ETransactionType
  color?: string
  icon?: string
  parent_category_id?: string
  is_archived?: boolean
  count?: number
  total_cost?: number
}

export interface IBudget extends IMetaData {
  category_id: string
  amount: number
  period_start: Date
  period_end: Date
  period_key: string
  currency: string
  is_archived?: boolean
  warn_threshold_percent?: number
  recurring?: 'monthly' | 'quarterly' | 'yearly' | number
}

export interface IDailySummary extends IMetaData {
  date: string
  total_income: number
  total_expense: number
  by_category: Record<string, number>
  by_account: Record<string, number>
  currency: string
}

export interface IMeta {
  key: string
  value: string
  updated_at: Date
}

export interface ICurrency extends IMetaData {
  code: string
  name: string
  symbol: string
  is_default?: boolean
}
