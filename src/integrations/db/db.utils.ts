import { ulid } from 'ulid'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { IndexableType, Table } from 'dexie'
import type { IMetaData } from './db.type'

/**
 * Retrieves the current user's ID from localStorage.
 * @throws {Error} If the user ID is not found.
 * @returns {string} The user ID.
 */
function getUserId(): string {
  const id = localStorage.getItem('user_id')
  if (!id) throw new Error('User ID not found in localStorage')
  return id
}

/**
 * Adds a new record to the specified table.
 *
 * Automatically injects metadata fields (`id`, `user_id`, timestamps, and sync status`).
 *
 * @param {string} tableName - Name of the table.
 * @param {{ record: Omit<T, keyof IMetaData> }} params - Record data excluding metadata fields.
 * @returns {Promise<T & IMetaData>} The inserted record with metadata included.
 */
export async function addRecord<T>(
  tableName: keyof typeof db,
  { record }: { record: Omit<T, keyof IMetaData> },
): Promise<T & IMetaData> {
  const table = db[tableName] as Table
  const now = new Date()
  const id = ulid(now.getTime())

  const newRecord = {
    ...record,
    id,
    user_id: getUserId(),
    created_at: now,
    updated_at: now,
    sync_status: 'pending' as const,
  }

  await table.add(newRecord)
  return newRecord as T & IMetaData
}

/**
 * Updates an existing record by key.
 *
 * Automatically sets `updated_at` and marks the record as `pending` for sync.
 *
 * @param {string} tableName - Name of the table.
 * @param {{ value: IndexableType, key?: string, updates: Partial<T> }} params - Key-value to match and updates to apply.
 * @returns {Promise<T | undefined>} The updated record, or undefined if not found.
 */
export async function updateRecord<T>(
  tableName: keyof typeof db,
  {
    value,
    key = 'id',
    updates,
  }: {
    value: IndexableType
    key?: string
    updates: Partial<T>
  },
): Promise<T | undefined> {
  const table = db[tableName] as Table
  const now = new Date()
  const updateData = {
    ...updates,
    updated_at: now,
    sync_status: 'pending' as const,
  }

  await table.where(key).equals(value).modify(updateData)
  return await table.where(key).equals(value).first()
}

/**
 * Soft-deletes a record by setting `deleted_at` and marking sync status as `pending`.
 *
 * @param {string} tableName - Name of the table.
 * @param {{ value: IndexableType, key?: string }} params - Key-value to identify the record.
 * @returns {Promise<T | undefined>} The deleted record, or undefined if not found.
 */
export async function deleteRecord<T>(
  tableName: keyof typeof db,
  {
    value,
    key = 'id',
  }: {
    value: IndexableType
    key?: string
  },
): Promise<T | undefined> {
  const table = db[tableName] as Table
  const now = new Date()
  const updateData = {
    deleted_at: now,
    sync_status: 'pending' as const,
    updated_at: now,
  }

  await table.where(key).equals(value).modify(updateData)
  return await table.where(key).equals(value).first()
}

/**
 * Retrieves a single record by key for the current user.
 *
 * Automatically filters out soft-deleted records.
 *
 * @param {string} tableName - Name of the table.
 * @param {{ value: IndexableType, key?: string }} params - Key-value pair for lookup.
 * @returns {Promise<T | undefined>} The record if found, otherwise undefined.
 */
export async function getRecord<T>(
  tableName: keyof typeof db,
  {
    value,
    key = 'id',
  }: {
    value: IndexableType
    key?: string
  },
): Promise<T | undefined> {
  const userId = getUserId()
  return await (db[tableName] as Table)
    .where({ user_id: userId, [key]: value })
    .and((record) => !record.deleted_at)
    .first()
}

/**
 * Retrieves all non-deleted records for the current user as a live query.
 *
 * This hook auto-updates whenever the table changes.
 *
 * @param {string} tableName - Name of the table.
 * @returns {T[]} A reactive array of all non-deleted records.
 */
export function getAllRecords<T>(tableName: keyof typeof db): Array<T> {
  const userId = getUserId()
  return (
    useLiveQuery(
      () =>
        (db[tableName] as Table)
          .where('user_id')
          .equals(userId)
          .filter((record) => !record.deleted_at)
          .toArray(),
      [tableName, userId],
    ) || []
  )
}

/**
 * Retrieves all records marked as pending or failed for synchronization.
 *
 * Useful for offline-first sync implementations.
 *
 * @param {string} tableName - Name of the table.
 * @returns {Promise<T[]>} Array of pending or failed sync records.
 */
export async function getPendingSyncRecords<T>(
  tableName: keyof typeof db,
): Promise<Array<T>> {
  const userId = getUserId()
  return await (db[tableName] as Table)
    .where('[user_id+sync_status]')
    .anyOf([
      [userId, 'pending'],
      [userId, 'failed'],
    ])
    .toArray()
}

/**
 * Marks a list of records as synced by their IDs.
 *
 * Sets `sync_status` to 'synced' and updates `synced_at` timestamp.
 *
 * @param {string} tableName - Name of the table.
 * @param {{ ids: string[] }} params - List of record IDs to mark as synced.
 * @returns {Promise<void>} Resolves when update is complete.
 */
export async function markAsSynced(
  tableName: keyof typeof db,
  { ids }: { ids: Array<string> },
): Promise<void> {
  const table = db[tableName] as Table
  const now = new Date()

  await table
    .where('id')
    .anyOf(ids)
    .modify({
      sync_status: 'synced' as const,
      synced_at: now,
    })
}
