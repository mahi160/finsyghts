import type { ICurrency } from '@/integrations/db/db.type'
import { useCurrenciesStore } from '@/integrations/db/db.store'

export const updateCurrency = async (
  currency: Partial<ICurrency>,
  checked: boolean,
) => {
  const { add, remove, update, items } = useCurrenciesStore.getState()
  const id = items.find((c) => c.code === currency.code)?.id
  if (!id) {
    if (checked) return await add({ ...currency })
  } else {
    if (!checked) {
      return await remove(id)
    } else {
      return await update(id, {
        deleted_at: undefined,
      })
    }
  }
}

export const markAsDefault = async (code: string) => {
  const { items, update } = useCurrenciesStore.getState()
  for (const currency of items) {
    if (currency.code === code && !currency.is_default)
      await update(currency.id, { is_default: true })
    if (currency.code !== code && currency.is_default)
      await update(currency.id, { is_default: false })
  }
}
