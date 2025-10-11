import { create } from 'zustand'
import { db } from './db'
import { createCrud } from './db.utils'
import { subscribeDexieToStore } from './db.subscribe'
import type { EntityTable } from 'dexie'
import type { IMetaData } from './db.type'

type GenericStore<T extends IMetaData> = {
  items: Array<T>
  fetchAll: () => Promise<void>
  fetchOne: (query: Partial<T>) => Promise<T | undefined>
  add: (record: Partial<T>) => Promise<T & IMetaData>
  update: (id: string, updates: Partial<T>) => Promise<void>
  remove: (id: string) => Promise<void>
}

function createDbStore<T extends IMetaData>(table: EntityTable<T, 'id'>) {
  const crud = createCrud<T>(table)

  const store = create<GenericStore<T>>((set) => ({
    items: [],

    async fetchAll() {
      const allItems = await crud.all()
      set({ items: allItems })
    },

    async fetchOne(query: Partial<T>) {
      return await crud.findOne(query)
    },

    async add(record: Partial<T>) {
      return await crud.add(record)
    },

    async update(id: string, updates: Partial<T>) {
      await crud.update(id, updates)
    },

    async remove(id: string) {
      await crud.remove(id)
    },
  }))

  subscribeDexieToStore(table, store.setState)
  store.getState().fetchAll()
  return store
}

// Table Stores
export const useTransactionsStore = createDbStore(db.transactions)
export const useAccountsStore = createDbStore(db.accounts)
export const useCategoriesStore = createDbStore(db.categories)
export const useBudgetsStore = createDbStore(db.budgets)
export const useDailySummariesStore = createDbStore(db.daily_summaries)
export const useCurrenciesStore = createDbStore(db.currencies)
