import { EAccountType, ETransactionType } from './db.type'

export const defaultCategories = [
  {
    name: 'Food & Drinks',
    icon: 'utensils',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Transport',
    icon: 'bus',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Shopping',
    icon: 'shopping-bag',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Bills & Utilities',
    icon: 'plug',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Entertainment',
    icon: 'music',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Health & Fitness',
    icon: 'heart-pulse',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Education',
    icon: 'book-open',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Home',
    icon: 'home',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Travel',
    icon: 'plane',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Gifts & Donations',
    icon: 'gift',
    transaction_type: ETransactionType.EXPENSE,
  },
  {
    name: 'Subscriptions',
    icon: 'credit-card',
    transaction_type: ETransactionType.EXPENSE,
  },

  {
    name: 'Salary',
    icon: 'wallet',
    transaction_type: ETransactionType.INCOME,
  },
  {
    name: 'Investments',
    icon: 'trending-up',
    transaction_type: ETransactionType.INCOME,
  },
  {
    name: 'Savings',
    icon: 'piggy-bank',
    transaction_type: ETransactionType.INCOME,
  },
  {
    name: 'Others',
    icon: 'ellipsis',
    color: '#E5E5E5',
    transaction_type: ETransactionType.EXPENSE,
  },
]

export const defaultAccounts = [
  {
    name: 'Cash',
    type: EAccountType.CASH,
    currency: 'USD',
    initial_balance: 0,
    balance: 0,
    color: '#A2D2FF',
    is_archived: false,
  },
]
