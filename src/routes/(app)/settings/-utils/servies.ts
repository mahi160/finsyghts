import type { ICurrency } from '@/integrations/db/db.type'
import {
  addRecord,
  deleteRecord,
  getRecord,
  updateRecord,
} from '@/integrations/db/db.utils'

export const addOrDeleteCurrency = async (
  currency: Partial<ICurrency>,
  checked: boolean,
) => {
  const code = currency.code as string
  const exists = await getRecord('currencies', { key: 'code', value: code })
  if (checked) {
    if (exists) {
      await updateRecord('currencies', {
        key: 'code',
        value: code,
        updates: { deleted_at: null },
      })
    } else {
      await addRecord('currencies', { record: currency })
    }
  } else {
    await deleteRecord('currencies', { key: 'code', value: code })
  }
}
