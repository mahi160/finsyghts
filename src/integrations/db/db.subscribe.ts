import type { EntityTable } from 'dexie'
import type { IMetaData } from './db.type'

export function subscribeDexieToStore<T extends IMetaData>(
  table: EntityTable<T, 'id'>,
  setState: (fn: (state: { items: Array<T> }) => { items: Array<T> }) => void,
) {
  const patchItem = (item: T) => {
    setState((state) => {
      const idx = state.items.findIndex((i) => i.id === item.id)
      if (idx === -1 && !item.deleted_at) {
        return { items: [...state.items, item] }
      } else if (idx !== -1) {
        if (item.deleted_at) {
          const newItems = [...state.items]
          newItems.splice(idx, 1)
          return { items: newItems }
        } else {
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
