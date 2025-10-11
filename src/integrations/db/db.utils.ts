import { ulid } from 'ulid'
import type { EntityTable } from 'dexie'
import type { IMetaData } from './db.type'

function getUserId(): string {
  const id = localStorage.getItem('user_id')
  if (!id) throw new Error('User ID not found')
  return id
}

export function createWithMeta<T>(record: Partial<T>): T & IMetaData {
  const now = new Date()
  const user_id = getUserId()
  return {
    ...record,
    user_id,
    id: ulid(now.getTime()),
    created_at: now,
    updated_at: now,
    sync_status: 'pending',
  } as T & IMetaData
}

export function createCrud<T extends IMetaData>(table: EntityTable<T, 'id'>) {
  return {
    async add(record: Partial<T>): Promise<T & IMetaData> {
      const recordWithMeta = createWithMeta<T>(record)
      await table.add(recordWithMeta)
      return recordWithMeta
    },

    async update(id: string, updates: Partial<T>) {
      const user_id = getUserId()
      await table.where({ id, user_id }).modify((obj) => {
        Object.assign(obj, updates, {
          updated_at: new Date(),
          sync_status: 'pending',
        })
      })
    },

    async remove(id: string) {
      const user_id = getUserId()
      await table.where({ id, user_id }).modify((obj) => {
        obj.deleted_at = new Date()
        obj.sync_status = 'pending'
      })
    },

    async all(): Promise<Array<T>> {
      const user_id = getUserId()
      return await table
        .where({ user_id })
        .filter((x) => !x.deleted_at)
        .toArray()
    },

    async get(id: string): Promise<T | undefined> {
      const user_id = getUserId()
      return await table.where({ id, user_id }).first()
    },

    async findOne(query: Partial<T>): Promise<T | undefined> {
      const user_id = getUserId()
      return await table.where({ ...query, user_id }).first()
    },
  }
}
