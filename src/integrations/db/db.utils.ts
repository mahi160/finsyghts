import { ulid } from 'ulid'
import { db } from './db'
import type { IndexableType, Table } from 'dexie'
import type { IMetaData } from './db.type'

/**
 * Add a new record to a Dexie table with ID, timestamps, and sync status.
 *
 * @param tableName - Name of the table in Dexie DB
 * @param record - Object containing the data to insert
 * @returns The newly added record, including `id`, `created_at`, `updated_at`, and `sync_status` fields
 */
export async function addRecord<T>(
  tableName: keyof typeof db,
  record: T,
): Promise<T & IMetaData> {
  const table = db[tableName] as Table
  const now = new Date()
  const id = ulid(now.getTime())

  const newRecord = {
    ...record,
    id,
    user_id: localStorage.getItem('user_id') as string,
    created_at: now,
    updated_at: now,
    sync_status: 'pending' as const,
  }
  await table.add(newRecord)
  return newRecord
}

/**
 * Update an existing record in a Dexie table by ID.
 *
 * @param tableName - Name of the table in Dexie DB
 * @param id - ID of the record to update
 * @param updates - Object containing the fields to update
 * @returns The updated record object, including updated `updated_at` and `sync_status` fields
 */
export async function updateRecord<T extends IMetaData>(
  tableName: keyof typeof db,
  id: string,
  updates: Partial<Omit<T, keyof IMetaData>>,
): Promise<T | undefined> {
  const table = db[tableName] as Table
  const now = new Date()
  const updateData = {
    ...updates,
    updated_at: now,
    sync_status: 'pending' as const,
  }

  await table.where('id').equals(id).modify(updateData)
  return await table.where('id').equals(id).first()
}

/**
 * Soft-delete a record in a Dexie table by setting `deleted_at` and `sync_status` fields.
 *
 * @param tableName - Name of the table in Dexie DB
 * @param id - ID of the record to delete
 * @returns The updated record object with `sync_status` set to pending and `deleted_at` timestamp
 */
export async function deleteRecord<T extends IMetaData>(
  tableName: keyof typeof db,
  id: string,
): Promise<T | undefined> {
  const table = db[tableName] as Table
  const now = new Date()
  const updateData = {
    deleted_at: now,
    sync_status: 'pending' as const,
    updated_at: now,
  }
  await table.where('id').equals(id).modify(updateData)
  return await table.where('id').equals(id).first()
}

/**
 * Get a single record from a Dexie table by key-value pair for current user.
 *
 * @param tableName - Name of the table in Dexie DB
 * @param key - Column name to match
 * @param value - Value to match in the specified column
 * @returns The first record matching the key-value pair, or undefined if not found
 */
export async function getRecordByKey<T extends IMetaData>(
  tableName: keyof typeof db,
  key: string,
  value: IndexableType,
): Promise<T | undefined> {
  const userId = localStorage.getItem('user_id')
  if (!userId)
    return undefined

  return await (db[tableName] as Table)
    .where({ user_id: userId, [key]: value })
    .and(record => !record.deleted_at)
    .first()
}

/**
 * Get a single record from a Dexie table by ID for current user.
 *
 * @param tableName - Name of the table in Dexie DB
 * @param id - ID of the record to retrieve
 * @returns The record with the specified ID, or undefined if not found
 */
export async function getRecordById<T extends IMetaData>(
  tableName: keyof typeof db,
  id: string,
): Promise<T | undefined> {
  const userId = localStorage.getItem('user_id')
  if (!userId)
    return undefined

  const record = await (db[tableName] as Table).where('id').equals(id).first()
  return record?.user_id === userId && !record.deleted_at ? record : undefined
}

/**
 * Get all non-deleted records from a Dexie table for current user.
 *
 * @param tableName - Name of the table in Dexie DB
 * @returns An array of all non-deleted records in the specified table for current user
 */
export async function getAllRecords<T extends IMetaData>(
  tableName: keyof typeof db,
): Promise<Array<T>> {
  const userId = localStorage.getItem('user_id')
  if (!userId)
    return []

  return await (db[tableName] as Table)
    .where('user_id')
    .equals(userId)
    .filter(record => !record.deleted_at)
    .toArray()
}

/**
 * Get records pending sync for current user.
 *
 * @param tableName - Name of the table in Dexie DB
 * @returns An array of records with sync_status "pending" or "failed"
 */
export async function getPendingSyncRecords<T extends IMetaData>(
  tableName: keyof typeof db,
): Promise<Array<T>> {
  const userId = localStorage.getItem('user_id')
  if (!userId)
    return []

  return await (db[tableName] as Table)
    .where('[user_id+sync_status]')
    .anyOf([
      [userId, 'pending'],
      [userId, 'failed'],
    ])
    .toArray()
}

/**
 * Mark records as synced.
 *
 * @param tableName - Name of the table in Dexie DB
 * @param ids - Array of record IDs to mark as synced
 */
export async function markAsSynced(
  tableName: keyof typeof db,
  ids: Array<string>,
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
