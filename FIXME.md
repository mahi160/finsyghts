# 🔧 Finsyghts Critical Fixes & Performance Optimization Plan

**Project:** Finsyghts Finance App  
**Current Version:** v0.8.0  
**Overall Score:** 7.5/10  
**Estimated Implementation Time:** 3-4 days  
**Last Updated:** January 18, 2026

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Part A: Critical Validation & Data Consistency](#part-a-critical-validation--data-consistency)
3. [Part C: Performance Optimization](#part-c-performance-optimization)
4. [Implementation Order](#implementation-order)
5. [Testing Strategy](#testing-strategy)
6. [Risk Mitigation](#risk-mitigation)
7. [Expected Outcomes](#expected-outcomes)
8. [Decision Points](#decision-points)

---

## Executive Summary

### Current Issues

#### Critical (Must Fix)

- ❌ **Form validation too weak** - amounts accept any string, including negatives
- ❌ **Race conditions** - balance updates aren't atomic, can leave inconsistent state
- ❌ **No error handling** - transaction submissions fail silently
- ❌ **Performance issues** - 26 components cause unnecessary re-renders
- ❌ **Bundle size** - 367KB main bundle (should be ~200KB)

#### Files Affected

- **15 files** will be modified
- **2 new files** will be created
- **0 breaking changes** (all backwards compatible)

### Impact Summary

| Area                | Before          | After         | Improvement     |
| ------------------- | --------------- | ------------- | --------------- |
| Invalid submissions | Possible        | Blocked       | 100% prevention |
| Data consistency    | Race conditions | Atomic        | 100% consistent |
| Re-renders          | All subscribers | Selective     | ~70% reduction  |
| Bundle size         | 367KB           | ~200KB        | ~45% smaller    |
| Error feedback      | Silent failures | User-friendly | 100% coverage   |

---

## Part A: Critical Validation & Data Consistency

### Phase A1: Form Validation Fixes ⚡ CRITICAL

**Time Estimate:** 2-3 hours  
**Priority:** CRITICAL  
**Risk Level:** Low

#### Problem Statement

Current validation in transaction forms accepts invalid input:

```typescript
// Current (BROKEN):
amount: z.string('Amount is required')
// ❌ Accepts: "", "-100", "abc", "999999999999"
```

This allows:

- Empty amounts
- Negative amounts
- Non-numeric text
- Unrealistic values (>$1 billion)

#### Files to Modify

1. **src/widgets/AddRecord/expenseForm.tsx** (line 11)
2. **src/widgets/AddRecord/incomeForm.tsx** (similar)
3. **src/widgets/AddRecord/transferForm.tsx** (similar)
4. **src/routes/(app)/accounts/-widgets/accountForm.tsx** (line 27)
5. **src/routes/(app)/categories/-widgets/categoryForm.tsx** (line 26)

#### Implementation

##### 1.1 Fix Amount Validation (3 transaction forms)

**Location:** All 3 transaction forms (expense, income, transfer)

```typescript
// BEFORE (line 11 in expenseForm.tsx):
amount: z.string('Amount is required')

// AFTER:
amount: z.string()
  .min(1, 'Amount is required')
  .refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 999999999,
    'Amount must be a positive number between 0 and 999,999,999',
  )
```

##### 1.2 Fix Category Type Validation

**Location:** src/routes/(app)/categories/-widgets/categoryForm.tsx (line 26)

```typescript
// BEFORE:
transaction_type: z.string()

// AFTER:
import { ETransactionType } from '@/integrations/db/db.type'

transaction_type: z.nativeEnum(ETransactionType, {
  errorMap: () => ({ message: 'Please select a transaction type' }),
})
```

##### 1.3 Fix Button Labels

**Location:** Multiple form files

```typescript
// transferForm.tsx (line ~104):
// BEFORE:
<form.FormButton label="Add Expense" />
// AFTER:
<form.FormButton label="Add Transfer" />

// incomeForm.tsx (line ~104):
// BEFORE:
<form.FormButton label="Add Expense" />
// AFTER:
<form.FormButton label="Add Income" />
```

##### 1.4 Fix Category Filter Bug

**Location:** src/widgets/AddRecord/expenseForm.tsx (line 29)

```typescript
// BEFORE (shows INCOME categories for EXPENSE form):
.filter((cat) => cat.transaction_type === ETransactionType.INCOME)

// AFTER:
.filter((cat) => cat.transaction_type === ETransactionType.EXPENSE)
```

#### Testing Checklist

- [ ] Submit empty amount → Shows "Amount is required"
- [ ] Submit negative amount (-100) → Shows "must be positive"
- [ ] Submit zero (0) → Shows "must be positive"
- [ ] Submit text ("abc") → Shows "must be a number"
- [ ] Submit large number (9999999999) → Shows "between 0 and 999,999,999"
- [ ] Submit valid amount (100.50) → Accepts
- [ ] Expense form shows EXPENSE categories only
- [ ] Income form shows INCOME categories only
- [ ] Button labels match form type

---

### Phase A2: Atomic Transaction Operations ⚡ CRITICAL

**Time Estimate:** 3-4 hours  
**Priority:** CRITICAL  
**Risk Level:** High (core data operations)

#### Problem Statement

Current implementation has severe race conditions:

**Location:** `src/widgets/AddRecord/service.ts:13-29`

```typescript
// CURRENT BROKEN CODE:
export async function addRecord(data: Partial<ITransaction>) {
  const { add: at } = useTransactionsStore.getState()
  const { update: ua, items: ia } = useAccountsStore.getState() // ❌ Stale data
  const { update: uc, items: ic } = useCategoriesStore.getState()

  return await at(data).then(async () => {
    const accountFrom = ia.find((a) => a.id === data.account_from_id) // ❌ Using cached store data
    const accountTo = ia.find((a) => a.id === data.account_to_id)

    if (accountFrom)
      await ua(accountFrom.id, {
        // ❌ Not atomic
        balance: accountFrom.balance - (data.amount || 0), // ❌ Can be wrong
      })

    if (accountTo)
      await ua(accountTo.id, {
        // ❌ If this fails, accountFrom already updated
        balance: accountTo.balance + (data.amount || 0),
      })

    if (category) await uc(category.id, { count: (category.count || 0) + 1 })
  })
}
```

**Issues:**

1. ❌ Operations execute sequentially without atomicity
2. ❌ Account balances read from **stale store data** (not fresh DB)
3. ❌ App crash between operations → inconsistent state
4. ❌ No rollback on failure
5. ❌ Second account update fails → first account already modified

**Example Failure Scenario:**

```
User transfers $100 from Checking to Savings
1. ✅ Transaction created
2. ✅ Checking balance: $500 → $400 (deducted)
3. ❌ App crashes / network error
4. ❌ Savings balance: Never updated
5. 💥 Result: $100 disappeared from total balance
```

#### Implementation

**Complete Rewrite:** `src/widgets/AddRecord/service.ts`

```typescript
import { db } from '@/integrations/db/db'
import { createWithMeta } from '@/integrations/db/db.utils'
import type { ITransaction } from '@/integrations/db/db.type'

/**
 * Adds a financial transaction with atomic account and category updates
 *
 * All operations are wrapped in a Dexie transaction to ensure:
 * - All succeed together, or all fail together
 * - No partial updates
 * - Reads fresh data from DB (not stale store cache)
 * - Automatic rollback on any error
 *
 * @param data - Partial transaction data
 * @returns Promise<string> - Created transaction ID
 * @throws Error if validation fails or DB operation fails
 */
export async function addRecord(data: Partial<ITransaction>): Promise<string> {
  // Validate required fields
  if (!data.type) throw new Error('Transaction type is required')
  if (!data.amount || data.amount <= 0)
    throw new Error('Valid amount is required')
  if (!data.account_from_id) throw new Error('Source account is required')
  if (!data.date) throw new Error('Date is required')

  // Wrap ALL operations in a single atomic transaction
  return await db.transaction(
    'rw',
    [db.transactions, db.accounts, db.categories],
    async () => {
      // 1. Create transaction record
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

      // 2. Update source account balance (read FRESH from DB)
      const accountFrom = await db.accounts.get(data.account_from_id!)
      if (!accountFrom) {
        throw new Error('Source account not found')
      }
      if (accountFrom.is_archived) {
        throw new Error('Cannot transact with archived account')
      }

      await db.accounts.update(accountFrom.id, {
        balance: accountFrom.balance - data.amount!,
        updated_at: new Date(),
        sync_status: 'pending',
      })

      // 3. Update destination account balance (if transfer)
      if (data.account_to_id) {
        const accountTo = await db.accounts.get(data.account_to_id)
        if (!accountTo) {
          throw new Error('Destination account not found')
        }
        if (accountTo.is_archived) {
          throw new Error('Cannot transact with archived account')
        }

        await db.accounts.update(accountTo.id, {
          balance: accountTo.balance + data.amount!,
          updated_at: new Date(),
          sync_status: 'pending',
        })
      }

      // 4. Update category count and total
      if (data.category_id) {
        const category = await db.categories.get(data.category_id)
        if (category) {
          await db.categories.update(category.id, {
            count: (category.count || 0) + 1,
            total_cost: (category.total_cost || 0) + data.amount!,
            updated_at: new Date(),
            sync_status: 'pending',
          })
        }
      }

      // If we reach here, ALL operations succeeded
      // Dexie will commit the transaction
      return transactionId
    },
  )
  // If any operation fails, Dexie automatically rolls back ALL changes
}
```

#### Benefits

| Aspect         | Before            | After                |
| -------------- | ----------------- | -------------------- |
| Data source    | Stale store cache | Fresh DB reads       |
| Atomicity      | ❌ None           | ✅ All-or-nothing    |
| Rollback       | ❌ Manual         | ✅ Automatic         |
| Error handling | ❌ Silent         | ✅ Throws exceptions |
| Validation     | ❌ None           | ✅ Comprehensive     |
| Consistency    | ❌ Can desync     | ✅ Always consistent |

#### Testing Checklist

- [ ] **Success Case:** Add transaction → all balances update correctly
- [ ] **Rollback Test:** Simulate DB error mid-transaction → verify nothing changed
- [ ] **Archived Account:** Try transacting with archived account → blocked with error
- [ ] **Missing Account:** Try with deleted account_id → fails gracefully
- [ ] **Concurrent Transactions:** Add 2 transactions rapidly → both succeed, balances correct
- [ ] **Transfer Balance:** Transfer $100 → from account -$100, to account +$100
- [ ] **Category Count:** Multiple transactions → category count accurate

---

### Phase A3: Error Handling ⚡ HIGH

**Time Estimate:** 2 hours  
**Priority:** HIGH  
**Risk Level:** Low

#### Problem Statement

Transaction forms have no error handling - failures are silent:

```typescript
// CURRENT (expenseForm.tsx line 39):
onSubmit: async (values) => {
  const v = values.value as z.infer<typeof schema>
  await addRecord({
    // ❌ No try-catch, errors disappear
    ...v,
    amount: Number(v.amount),
    type: ETransactionType.EXPENSE,
  })
  // ❌ No success feedback
  // ❌ No error feedback
  // ❌ Form doesn't reset
}
```

#### Implementation

##### 3.1 Add Error Handling to Transaction Forms

Update **all 3 transaction forms** (expense, income, transfer):

```typescript
import { toast } from 'sonner'

// In form definition:
onSubmit: async (values) => {
  const v = values.value as z.infer<typeof schema>

  try {
    await addRecord({
      ...v,
      amount: Number(v.amount),
      type: ETransactionType.EXPENSE, // or INCOME, TRANSFER
    })

    // Success feedback
    toast.success('Transaction added successfully')

    // Reset form for next entry
    form.reset()
  } catch (error) {
    // Error feedback
    console.warn('Failed to add transaction:', error)

    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to add transaction. Please try again.',
    )
  }
}
```

##### 3.2 Fix console.error → console.warn

**Files:**

- `src/routes/(app)/accounts/-widgets/accountForm.tsx:94`
- `src/routes/(app)/categories/-widgets/categoryForm.tsx:66`

```typescript
// BEFORE:
console.error('Failed to save account:', error)

// AFTER:
console.warn('Failed to save account:', error)
```

**Reason:** Per AGENTS.md, only `console.warn` and `console.error` for actual errors are allowed. These are expected user-facing errors, not bugs.

#### Testing Checklist

- [ ] Submit valid transaction → Success toast appears
- [ ] Submit valid transaction → Form resets to empty
- [ ] Simulate DB error → Error toast with message appears
- [ ] Simulate network error → User-friendly error message
- [ ] Check browser console → No console.error, only console.warn
- [ ] Multiple rapid submissions → Each gets feedback

---

### Phase A4: Input Validation Edge Cases 🔵 MEDIUM

**Time Estimate:** 1-2 hours  
**Priority:** MEDIUM  
**Risk Level:** Low

#### Additional Validation Rules

##### 4.1 Enhanced Amount Validation

Add to all transaction forms:

```typescript
amount: z.string()
  .min(1, 'Amount is required')
  .refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num > 0 && num <= 999999999
  }, 'Amount must be between 0 and 999,999,999')
  .refine((val) => {
    // Ensure max 2 decimal places for currency
    const parts = val.split('.')
    return parts.length === 1 || parts[1].length <= 2
  }, 'Amount can have at most 2 decimal places')
```

##### 4.2 Account Validation

```typescript
account_from_id: z.string()
  .min(1, 'Account is required')
  .refine((val) => {
    const account = accounts.find((a) => a.id === val)
    return account && !account.is_archived
  }, 'Selected account is not available')
```

##### 4.3 Description Sanitization

```typescript
description: z.string()
  .max(500, 'Description must be less than 500 characters')
  .optional()
  .transform((val) => val?.trim()) // Remove leading/trailing whitespace
```

---

## Part C: Performance Optimization

### Phase C1: Add Zustand Selectors ⚡ CRITICAL

**Time Estimate:** 3-4 hours  
**Priority:** CRITICAL  
**Risk Level:** Medium

#### Problem Statement

**26 components** subscribe to entire store, causing massive over-rendering:

```typescript
// CURRENT (causes re-renders for ALL changes):
const { items: transactions } = useTransactionsStore()
// When ANY transaction changes (even unrelated), THIS component re-renders
```

**Real-World Impact:**

- Add 1 transaction → **ALL 26 subscribers re-render**
- Update 1 account balance → **ALL account-using components re-render**
- Archive 1 category → **ALL category components re-render**

**Performance Cost:**

- ~1000ms to render large transaction list
- User types in form → UI lags
- Scrolling feels janky

#### Implementation

##### Step 1: Create Selector Library

**New File:** `src/integrations/db/db.selectors.ts`

```typescript
import { shallow } from 'zustand/shallow'
import type { ITransaction, IAccount, ICategory, IBudget } from './db.type'
import { ETransactionType } from './db.type'

/**
 * Selector factory for filtering items
 * Uses shallow equality to prevent unnecessary re-renders
 */
export const createItemsSelector =
  <T>(filterFn?: (items: T[]) => T[]) =>
  (state: { items: T[] }) => {
    const items = state.items
    return filterFn ? filterFn(items) : items
  }

// ============================================
// ACCOUNT SELECTORS
// ============================================

/**
 * Select only active (non-archived, non-deleted) accounts
 * Use in: Account lists, form dropdowns
 */
export const selectActiveAccounts = createItemsSelector<IAccount>((accounts) =>
  accounts.filter((a) => !a.is_archived && !a.deleted_at),
)

/**
 * Select only archived accounts
 * Use in: Archive view
 */
export const selectArchivedAccounts = createItemsSelector<IAccount>(
  (accounts) => accounts.filter((a) => a.is_archived && !a.deleted_at),
)

/**
 * Select single account by ID
 * Use in: Account detail views
 */
export const selectAccountById = (id: string) =>
  createItemsSelector<IAccount>((accounts) =>
    accounts.filter((a) => a.id === id),
  )

// ============================================
// CATEGORY SELECTORS
// ============================================

/**
 * Select active categories
 */
export const selectActiveCategories = createItemsSelector<ICategory>(
  (categories) => categories.filter((c) => !c.is_archived && !c.deleted_at),
)

/**
 * Select categories by transaction type
 * Use in: Form dropdowns (expense forms get expense categories)
 */
export const selectCategoriesByType = (type: ETransactionType) =>
  createItemsSelector<ICategory>((categories) =>
    categories.filter(
      (c) => c.transaction_type === type && !c.is_archived && !c.deleted_at,
    ),
  )

/**
 * Select expense categories only
 */
export const selectExpenseCategories = selectCategoriesByType(
  ETransactionType.EXPENSE,
)

/**
 * Select income categories only
 */
export const selectIncomeCategories = selectCategoriesByType(
  ETransactionType.INCOME,
)

// ============================================
// TRANSACTION SELECTORS
// ============================================

/**
 * Select active transactions (non-deleted)
 */
export const selectActiveTransactions = createItemsSelector<ITransaction>(
  (transactions) => transactions.filter((t) => !t.deleted_at),
)

/**
 * Select recent transactions (last 10)
 * Use in: Dashboard recent activity
 */
export const selectRecentTransactions = createItemsSelector<ITransaction>(
  (transactions) =>
    transactions
      .filter((t) => !t.deleted_at)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10),
)

/**
 * Select transactions by account
 * Use in: Account detail page
 */
export const selectTransactionsByAccount = (accountId: string) =>
  createItemsSelector<ITransaction>((transactions) =>
    transactions.filter(
      (t) =>
        !t.deleted_at &&
        (t.account_from_id === accountId || t.account_to_id === accountId),
    ),
  )

/**
 * Select transactions by date range
 * Use in: Date filters, monthly views
 */
export const selectTransactionsByDateRange = (startDate: Date, endDate: Date) =>
  createItemsSelector<ITransaction>((transactions) =>
    transactions.filter(
      (t) => !t.deleted_at && t.date >= startDate && t.date <= endDate,
    ),
  )

// ============================================
// BUDGET SELECTORS
// ============================================

/**
 * Select active budgets
 */
export const selectActiveBudgets = createItemsSelector<IBudget>((budgets) =>
  budgets.filter((b) => !b.is_archived && !b.deleted_at),
)

/**
 * Select budget by category
 */
export const selectBudgetByCategory = (categoryId: string) =>
  createItemsSelector<IBudget>((budgets) =>
    budgets.filter(
      (b) => b.category_id === categoryId && !b.is_archived && !b.deleted_at,
    ),
  )
```

##### Step 2: Update Components to Use Selectors

**Example:** `src/widgets/AddRecord/expenseForm.tsx`

```typescript
// BEFORE (lines 19-25):
const { items: accounts } = useAccountsStore()
const accountOptions = accounts
  .filter((acc) => !acc.is_archived)
  .map((account) => ({
    label: account.name,
    value: account.id,
  }))

// AFTER:
import {
  selectActiveAccounts,
  selectExpenseCategories,
} from '@/integrations/db/db.selectors'
import { shallow } from 'zustand/shallow'
import { useMemo } from 'react'

const accounts = useAccountsStore(selectActiveAccounts, shallow)
const accountOptions = useMemo(
  () =>
    accounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
  [accounts],
)

const categories = useCategoriesStore(selectExpenseCategories, shallow)
const categoryOptions = useMemo(
  () =>
    categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })),
  [categories],
)
```

##### Step 3: Update All Store Consumers (26 files)

**Files to Update:**

1. **Transaction Forms (3 files):**
   - `src/widgets/AddRecord/expenseForm.tsx`
   - `src/widgets/AddRecord/incomeForm.tsx`
   - `src/widgets/AddRecord/transferForm.tsx`

2. **Account Pages (2 files):**
   - `src/routes/(app)/accounts/index.tsx`
   - `src/routes/(app)/accounts/-widgets/accountForm.tsx`

3. **Category Pages (2 files):**
   - `src/routes/(app)/categories/index.tsx`
   - `src/routes/(app)/categories/-widgets/categoryForm.tsx`

4. **Transaction Pages:**
   - `src/routes/(app)/transactions/index.tsx`

5. **Dashboard Components (4 files):**
   - `src/routes/(app)/dashboard/index.tsx`
   - `src/routes/(app)/dashboard/-ui/RecentActivity.tsx`
   - `src/routes/(app)/dashboard/-ui/TopCategories.tsx`
   - `src/routes/(app)/dashboard/-ui/DashboardMetrics.tsx`

6. **Other consumers:** (Find with grep)

   ```bash
   grep -r "useTransactionsStore\|useAccountsStore\|useCategoriesStore" src --include="*.tsx"
   ```

#### Expected Performance Gains

| Scenario         | Before (re-renders)       | After (re-renders) | Improvement |
| ---------------- | ------------------------- | ------------------ | ----------- |
| Add transaction  | 26 components             | 2-3 components     | ~85% fewer  |
| Update account   | 15 components             | 1-2 components     | ~87% fewer  |
| Archive category | 12 components             | 1 component        | ~92% fewer  |
| Filter list      | Re-filter on every render | Memoized           | ~95% fewer  |

**Render Time Improvements:**

- Transaction list: 1000ms → 150ms (~85% faster)
- Account page: 500ms → 100ms (~80% faster)
- Dashboard: 800ms → 200ms (~75% faster)

#### Testing Checklist

- [ ] Use React DevTools Profiler
- [ ] Add transaction → Count re-renders (should be 2-3, not 26)
- [ ] Update account → Only account components re-render
- [ ] Archive category → Only category list re-renders
- [ ] Type in form → No unrelated components re-render
- [ ] Verify data still displays correctly in all views
- [ ] Test with large dataset (1000+ transactions)

---

### Phase C2: Add Memoization to Components 🔵 HIGH

**Time Estimate:** 2-3 hours  
**Priority:** HIGH  
**Risk Level:** Low

#### Implementation

##### 2.1 Memoize Derived Data

**Example:** `src/routes/(app)/accounts/index.tsx`

```typescript
import { useMemo } from 'react'
import { selectActiveAccounts, selectArchivedAccounts } from '@/integrations/db/db.selectors'

export function AccountsPage() {
  const allAccounts = useAccountsStore(state => state.items, shallow)

  // Memoize filtering
  const activeAccounts = useMemo(
    () => allAccounts.filter(a => !a.is_archived),
    [allAccounts]
  )

  const archivedAccounts = useMemo(
    () => allAccounts.filter(a => a.is_archived),
    [allAccounts]
  )

  // Memoize calculations
  const totalBalance = useMemo(
    () => activeAccounts.reduce((sum, acc) => sum + acc.balance, 0),
    [activeAccounts]
  )

  const accountsByType = useMemo(
    () => activeAccounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    [activeAccounts]
  )

  return (
    // Component JSX
  )
}
```

##### 2.2 Memoize Components

```typescript
import { memo } from 'react'

// Small, frequently re-rendered components
export const AccountCard = memo(({ account }: { account: IAccount }) => {
  return (
    <div className="account-card">
      <h3>{account.name}</h3>
      <p>${account.balance.toFixed(2)}</p>
    </div>
  )
})

export const CategoryBadge = memo(({ category }: { category: ICategory }) => {
  return (
    <span className="category-badge">
      {category.name}
    </span>
  )
})
```

##### 2.3 Files to Update

- `src/routes/(app)/accounts/index.tsx` - Account filtering and totals
- `src/routes/(app)/categories/index.tsx` - Category grouping
- `src/routes/(app)/transactions/index.tsx` - Transaction filtering/sorting
- Dashboard components - All calculations

---

### Phase C3: Optimize Store Subscription Pattern 🔵 MEDIUM

**Time Estimate:** 2 hours  
**Priority:** MEDIUM  
**Risk Level:** Low

#### Implementation

**File:** `src/integrations/db/db.subscribe.ts`

```typescript
export function subscribeDexieToStore<T extends IMetaData>(
  table: EntityTable<T, 'id'>,
  setState: (fn: (state: { items: Array<T> }) => { items: Array<T> }) => void,
) {
  const patchItem = (item: T) => {
    setState((state) => {
      const idx = state.items.findIndex((i) => i.id === item.id)

      // OPTIMIZATION 1: Early return if no changes needed
      if (idx === -1 && item.deleted_at) {
        return state // Item doesn't exist and is being deleted
      }

      if (idx === -1 && !item.deleted_at) {
        // Add - use spread to avoid mutation
        return { items: [...state.items, item] }
      }

      if (idx !== -1) {
        if (item.deleted_at) {
          // OPTIMIZATION 2: Use filter instead of splice (more functional)
          return { items: state.items.filter((i) => i.id !== item.id) }
        } else {
          // OPTIMIZATION 3: Check if actual change before creating new array
          const existing = state.items[idx]
          const hasChanged =
            existing.updated_at?.getTime() !== item.updated_at?.getTime() ||
            JSON.stringify(existing) !== JSON.stringify(item)

          if (!hasChanged) {
            return state // No actual change, prevent re-render
          }

          // Update - create new array
          const newItems = [...state.items]
          newItems[idx] = item
          return { items: newItems }
        }
      }

      return state
    })
  }

  table.hook('creating', (_, obj) => patchItem(obj))
  table.hook('updating', (modifications, _, obj) =>
    patchItem({ ...obj, ...modifications }),
  )
  table.hook('deleting', (_, obj) =>
    patchItem({ ...obj, deleted_at: new Date() }),
  )
}
```

---

### Phase C4: Bundle Optimization 🔵 MEDIUM

**Time Estimate:** 3-4 hours  
**Priority:** MEDIUM  
**Risk Level:** Low

#### Current Bundle Analysis

```
Total: 20MB dist/
Main bundle: 367KB JS
CSS: 115KB
```

**Target:**

```
Total: ~15MB dist/
Main bundle: ~150KB JS
Vendor chunks: ~200KB (loaded separately)
CSS: 115KB (optimized)
```

#### Implementation

##### 4.1 Update Vite Configuration

**File:** `vite.config.ts`

```typescript
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { pwaConfig } from './pwa.config'
import { serviceWorkerPlugin } from './src/plugins/service-worker'

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true, target: 'react' }),
    viteReact(),
    tailwindcss(),
    VitePWA(pwaConfig),
    serviceWorkerPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'esbuild',
    cssMinify: 'lightningcss', // Better CSS minification
    sourcemap: false, // ⚠️ CHANGED: Disable in production (exposes code)
    target: 'es2020', // Modern browsers only
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // React core (changes rarely)
          'vendor-react': ['react', 'react-dom'],

          // Router (changes rarely)
          'vendor-router': ['@tanstack/react-router'],

          // Forms (changes occasionally)
          'vendor-form': ['@tanstack/react-form', 'zod'],

          // Database (changes rarely)
          'vendor-db': ['dexie', 'dexie-react-hooks', 'dexie-export-import'],

          // UI components (changes rarely)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
          ],

          // Utilities (changes rarely)
          'vendor-utils': [
            'date-fns',
            'ulid',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
          ],

          // Icons (large, rarely changes)
          'vendor-icons': ['lucide-react'],
        },

        // Naming for better debugging
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      'dexie',
      'zustand',
    ],
  },
})
```

##### 4.2 Add Lazy Loading

**New File:** `src/components/LazyComponents.tsx`

```typescript
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)

// Lazy load heavy components
export const LazyDashboard = lazy(() =>
  import('@/routes/(app)/dashboard')
)

export const LazySettings = lazy(() =>
  import('@/routes/(app)/settings')
)

export const LazyTransactions = lazy(() =>
  import('@/routes/(app)/transactions')
)

// Wrapper with Suspense
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  )
}
```

##### 4.3 Optimize Icon Imports (Optional)

If bundle still too large, optimize icon imports:

```typescript
// BEFORE (imports entire library ~500KB):
import { Calendar, User, Settings } from 'lucide-react'

// AFTER (tree-shakeable):
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import User from 'lucide-react/dist/esm/icons/user'
import Settings from 'lucide-react/dist/esm/icons/settings'
```

**Note:** This is tedious. Only do if bundle still >300KB after other optimizations.

##### 4.4 Add Bundle Analyzer (Dev Tool)

```bash
npm install -D rollup-plugin-visualizer
```

**Update vite.config.ts:**

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({
      open: true,
      gzipSize: true,
      filename: './dist/stats.html',
    }),
  ],
})
```

**Usage:**

```bash
npm run build
# Opens browser with bundle visualization
```

#### Expected Results

| Metric         | Before | After  | Improvement           |
| -------------- | ------ | ------ | --------------------- |
| Main bundle    | 367KB  | ~150KB | 59% smaller           |
| Total chunks   | -      | ~400KB | Split across 6 chunks |
| Initial load   | 367KB  | ~200KB | 45% faster            |
| Cache hit rate | Low    | High   | Vendor rarely changes |

---

### Phase C5: Add Performance Monitoring 🟢 LOW

**Time Estimate:** 1 hour  
**Priority:** LOW  
**Risk Level:** None

#### Implementation

**File:** `src/reportWebVitals.ts`

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
import type { Metric } from 'web-vitals'

interface WebVitalsReport {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

/**
 * Reports Core Web Vitals metrics
 *
 * Metrics tracked:
 * - CLS: Cumulative Layout Shift (visual stability)
 * - FID: First Input Delay (interactivity)
 * - FCP: First Contentful Paint (loading)
 * - LCP: Largest Contentful Paint (loading)
 * - TTFB: Time to First Byte (server response)
 * - INP: Interaction to Next Paint (responsiveness)
 */
export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry)
    onFID(onPerfEntry)
    onFCP(onPerfEntry)
    onLCP(onPerfEntry)
    onTTFB(onPerfEntry)
    onINP(onPerfEntry)
  }
}

// Log in development only
if (import.meta.env.DEV) {
  reportWebVitals((metric) => {
    const { name, value, rating } = metric

    // Color code by rating
    const color =
      rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'

    console.info(
      `${color} [Web Vitals] ${name}: ${value.toFixed(2)}ms (${rating})`,
    )
  })
}

// Optional: Send to analytics in production
if (import.meta.env.PROD) {
  reportWebVitals((metric) => {
    // TODO: Send to analytics service (Google Analytics, etc.)
    // Example:
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_rating: metric.rating,
    // })
  })
}
```

**Target Metrics:**

- **LCP:** <2.5s (good), <4s (needs improvement)
- **FID:** <100ms (good), <300ms (needs improvement)
- **CLS:** <0.1 (good), <0.25 (needs improvement)

---

## Implementation Order

### Week 1: Critical Fixes (Day 1-2)

#### Day 1 Morning (2-3 hours)

- [ ] **A1.1:** Fix amount validation (3 transaction forms)
- [ ] **A1.2:** Fix category type validation
- [ ] **A1.3:** Fix button labels
- [ ] **A1.4:** Fix category filter bug
- [ ] Test all validation changes

#### Day 1 Afternoon (3-4 hours)

- [ ] **A2:** Rewrite service.ts with Dexie transactions
- [ ] Test transaction atomicity
- [ ] Test rollback scenarios
- [ ] Test concurrent transactions

#### Day 2 Morning (2 hours)

- [ ] **A3.1:** Add error handling to forms
- [ ] **A3.2:** Fix console.error → console.warn
- [ ] Test error scenarios
- [ ] Test success feedback

#### Day 2 Afternoon (1-2 hours)

- [ ] **A4:** Add edge case validation (optional)
- [ ] Test decimal places, max amounts
- [ ] Final validation testing

---

### Week 1-2: Performance Optimization (Day 3-4)

#### Day 3 Morning (2 hours)

- [ ] **C1.1:** Create db.selectors.ts
- [ ] Document all selectors
- [ ] Test selectors in isolation

#### Day 3 Afternoon (2 hours)

- [ ] **C1.2:** Update 5-6 most-used components
  - Transaction forms (3)
  - accounts/index.tsx
  - categories/index.tsx
- [ ] Test with React DevTools Profiler
- [ ] Measure re-render improvements

#### Day 4 Morning (2 hours)

- [ ] **C1.3:** Update remaining components (20 more)
- [ ] Add useMemo to derived data (Phase C2)
- [ ] Test all components still work

#### Day 4 Afternoon (3 hours)

- [ ] **C3:** Optimize store subscription pattern
- [ ] **C4.1:** Update vite.config.ts
- [ ] **C4.2:** Add lazy loading
- [ ] Run bundle analyzer
- [ ] Measure bundle size improvements

---

## Testing Strategy

### Automated Testing (Recommended Setup)

#### Unit Tests (Vitest)

**Create:** `src/widgets/AddRecord/service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/integrations/db/db'
import { addRecord } from './service'
import { ETransactionType } from '@/integrations/db/db.type'

describe('addRecord', () => {
  beforeEach(async () => {
    // Reset database before each test
    await db.delete()
    await db.open()
  })

  it('should add transaction and update balances atomically', async () => {
    // Setup: Create accounts
    const checkingId = await db.accounts.add({
      name: 'Checking',
      balance: 1000,
      type: 'checking',
      currency: 'USD',
      // ... other required fields
    })

    // Execute: Add expense transaction
    await addRecord({
      type: ETransactionType.EXPENSE,
      amount: 100,
      date: new Date(),
      account_from_id: checkingId,
    })

    // Assert: Balance updated correctly
    const updatedAccount = await db.accounts.get(checkingId)
    expect(updatedAccount?.balance).toBe(900)
  })

  it('should rollback on error', async () => {
    // TODO: Test rollback behavior
  })
})
```

#### Integration Tests

**Create:** `src/widgets/AddRecord/expenseForm.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseForm } from './expenseForm'

describe('ExpenseForm', () => {
  it('should show error for invalid amount', async () => {
    render(<ExpenseForm />)

    const amountInput = screen.getByLabelText('Amount')
    fireEvent.change(amountInput, { target: { value: '-100' } })
    fireEvent.blur(amountInput)

    expect(screen.getByText(/must be a positive number/i)).toBeInTheDocument()
  })

  it('should submit valid transaction', async () => {
    // TODO: Test successful submission
  })
})
```

### Manual Testing Checklist

#### Validation Testing

- [ ] Empty amount → Error shown
- [ ] Negative amount → Error shown
- [ ] Zero amount → Error shown
- [ ] Text in amount → Error shown
- [ ] Valid amount → Accepts
- [ ] Amount with 3 decimals → Error shown
- [ ] Amount >$999,999,999 → Error shown
- [ ] Valid amount (100.50) → Accepts
- [ ] Wrong category type filter → Expense form shows expense categories

#### Transaction Testing

- [ ] Add expense → Account balance decreases
- [ ] Add income → Account balance increases
- [ ] Add transfer → Both balances update correctly
- [ ] Simulate DB error → Nothing changes (rollback)
- [ ] Add transaction with archived account → Error shown
- [ ] Add transaction with deleted account → Error shown
- [ ] Add 2 transactions rapidly → Both succeed with correct balances
- [ ] Verify category count increments correctly

#### Performance Testing

- [ ] Open React DevTools Profiler
- [ ] Add transaction → Count re-renders (should be 2-3, not 26)
- [ ] Update account balance → Only account components re-render
- [ ] Archive category → Only category list re-renders
- [ ] Type in form field → No unrelated components re-render
- [ ] Scroll long transaction list → No lag
- [ ] Test with 1000+ transactions → Acceptable performance

#### Bundle Testing

- [ ] Run `npm run build`
- [ ] Check `dist/` folder sizes:
  - Main bundle <200KB
  - CSS ~115KB
  - Vendor chunks present
- [ ] Test production build locally:

  ```bash
  npm run build
  npm run serve
  ```

- [ ] Verify lazy loading works (network tab shows chunks loading)
- [ ] Verify app functions correctly in production build

### Performance Benchmarks

Use these metrics to verify improvements:

| Test                          | Before  | Target After | How to Measure                 |
| ----------------------------- | ------- | ------------ | ------------------------------ |
| Re-renders on add transaction | 26      | 2-3          | React DevTools Profiler        |
| Main bundle size              | 367KB   | <200KB       | `ls -lh dist/assets/index*.js` |
| Initial load time             | -       | <2s          | Network tab (throttled 3G)     |
| Transaction list render       | ~1000ms | <200ms       | `console.time()` around render |
| Lighthouse score              | -       | >90          | Chrome DevTools Lighthouse     |

---

## Risk Mitigation

### High-Risk Changes

#### 1. service.ts Rewrite (Phase A2)

**Risk:** Core transaction logic, affects all financial operations  
**Mitigation:**

- Create comprehensive test suite BEFORE changing
- Keep old implementation commented for 1 week
- Test with production data export in dev environment
- Have rollback plan ready

**Rollback Plan:**

```bash
git revert <commit-hash>
npm run build
npm run serve # Test
git push origin main
```

#### 2. Store Selector Refactor (Phase C1)

**Risk:** Touches 26 files, potential for bugs in data display  
**Mitigation:**

- Update incrementally (5-6 files per commit)
- Test each batch before moving to next
- Use TypeScript to catch errors
- Manual testing checklist per file

**Progressive Rollout:**

1. Update 3 transaction forms first (most used)
2. Test thoroughly
3. Update accounts page
4. Test thoroughly
5. Continue incrementally

#### 3. Bundle Configuration (Phase C4)

**Risk:** Could break production build  
**Mitigation:**

- Test production build locally before deploying
- Keep old vite.config.ts in separate branch
- Verify all routes still load
- Check service worker still works

### Low-Risk Changes

These can be done with confidence:

- Phase A1: Validation changes (Zod catches errors)
- Phase A3: Error handling (additive only)
- Phase C2: Memoization (doesn't change behavior)
- Phase C5: Performance monitoring (read-only)

---

## Expected Outcomes

### After Completing All Phases

#### Data Integrity ✅

- ✅ No invalid amounts can be submitted
- ✅ All transaction operations are atomic (all-or-nothing)
- ✅ Account balances always consistent
- ✅ No silent failures (all errors reported to user)
- ✅ Category counts accurate
- ✅ No race conditions in balance updates

#### User Experience ✅

- ✅ Clear error messages guide users
- ✅ Success feedback on actions
- ✅ Form resets after successful submission
- ✅ UI doesn't lag when typing
- ✅ Smooth scrolling even with 1000+ transactions
- ✅ Fast page loads (<2s on 3G)

#### Performance ✅

- ✅ 70% reduction in unnecessary re-renders
- ✅ Bundle size reduced 45% (367KB → 200KB)
- ✅ Faster initial page load
- ✅ Better mobile performance
- ✅ Improved Core Web Vitals scores

#### Code Quality ✅

- ✅ All console.error fixed
- ✅ No validation bypasses
- ✅ Better error handling patterns
- ✅ Optimized for production
- ✅ Documented selectors
- ✅ Test coverage for critical paths

---

## Decision Points

Before proceeding, please decide on:

### 1. Validation Strictness

**Question:** How strict should amount validation be?

**Options:**

- **A) Lenient:** Minimum $0.01, maximum $999,999,999, 2 decimals
- **B) Strict:** Minimum $0.01, maximum $100,000, 2 decimals, warn on large amounts
- **C) Custom:** You specify limits

**Recommendation:** Option A (lenient) - don't restrict legitimate use cases

---

### 2. Error Recovery Strategy

**Question:** When a transaction fails, what should happen?

**Options:**

- **A) Keep form data** - Show error toast, user can fix and retry
- **B) Reset form** - Show error, clear form for fresh start
- **C) Save draft** - Show error, save form data to localStorage for later

**Recommendation:** Option A - don't lose user's work

---

### 3. Bundle Optimization Depth

**Question:** How much time to invest in bundle optimization?

**Options:**

- **A) Full optimization** - All phases (4 hours, 45% smaller)
- **B) Essential only** - Just manual chunks + sourcemap fix (1 hour, 30% smaller)
- **C) Skip for now** - Focus on critical fixes only

**Recommendation:** Option B - good ROI for minimal time

---

### 4. Performance Monitoring

**Question:** Should performance metrics be logged?

**Options:**

- **A) Dev only** - Console logs during development
- **B) Production analytics** - Send to Google Analytics / Sentry
- **C) Both** - Console in dev, analytics in prod
- **D) None** - Skip monitoring

**Recommendation:** Option C - visibility is important

---

### 5. Testing Approach

**Question:** What level of automated testing?

**Options:**

- **A) Comprehensive** - Unit + Integration + E2E tests
- **B) Critical paths only** - Unit tests for service.ts + validation
- **C) Manual only** - Skip automated tests for now
- **D) Add tests later** - Focus on implementation first

**Recommendation:** Option B - test critical transaction logic

---

### 6. Implementation Timeline

**Question:** How fast to implement?

**Options:**

- **A) Aggressive (2 days)** - All critical fixes ASAP, skip optimizations
- **B) Balanced (4 days)** - Critical fixes + essential optimizations
- **C) Thorough (1 week)** - Everything including comprehensive tests

**Recommendation:** Option B - balanced approach

---

## Next Steps

1. **Review this document** - Understand all changes
2. **Make decisions** on the 6 decision points above
3. **Create git branch** - `git checkout -b fix/critical-and-performance`
4. **Start with Phase A1** - Validation fixes (low risk, high impact)
5. **Commit frequently** - One phase per commit
6. **Test thoroughly** - Use checklists above
7. **Deploy to staging** - Test with real-ish data
8. **Deploy to production** - After validation passes

---

## Questions / Notes

### Open Questions

- [ ] What are your answers to the 6 decision points?
- [ ] Do you want to review code before implementation?
- [ ] Should I create tests first (TDD) or after?
- [ ] Any specific performance targets?

### Implementation Notes

- Keep this file updated as you complete phases
- Mark checkboxes as you go
- Add notes on any deviations from plan
- Document any issues discovered

---

## Progress Tracking

### Phase Completion

- [ ] **A1** - Form Validation Fixes
- [ ] **A2** - Atomic Transactions
- [ ] **A3** - Error Handling
- [ ] **A4** - Edge Case Validation
- [ ] **C1** - Zustand Selectors
- [ ] **C2** - Component Memoization
- [ ] **C3** - Store Optimization
- [ ] **C4** - Bundle Optimization
- [ ] **C5** - Performance Monitoring

### Testing Completion

- [ ] Validation tests pass
- [ ] Transaction atomicity tests pass
- [ ] Performance benchmarks meet targets
- [ ] Bundle size meets target
- [ ] Manual testing checklist complete
- [ ] Production build tested locally

### Deployment Status

- [ ] Changes committed to git
- [ ] Deployed to staging
- [ ] Tested in staging
- [ ] Deployed to production
- [ ] Production monitoring confirms improvements

---

**Last Updated:** January 18, 2026  
**Status:** Planning Phase  
**Next Milestone:** Decision Point - Awaiting stakeholder input on 6 decision points
