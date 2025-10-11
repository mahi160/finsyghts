import type { ITransaction } from '@/integrations/db/db.type'
import {
  useAccountsStore,
  useCategoriesStore,
  useTransactionsStore,
} from '@/integrations/db/db.store'

export async function addTransactionService(data: ITransaction) {
  const { add: at } = useTransactionsStore.getState()
  const { update: ua, items: ia } = useAccountsStore.getState()
  const { update: uc, items: ic } = useCategoriesStore.getState()
  return await at(data).then(async () => {
    const accountFrom = ia.find((a) => a.id === data.account_from_id)
    const accountTo = ia.find((a) => a.id === data.account_to_id)
    const category = ic.find((c) => c.id === data.category_id)

    if (accountFrom)
      await ua(accountFrom.id, { balance: accountFrom.balance - data.amount })

    if (accountTo)
      await ua(accountTo.id, { balance: accountTo.balance + data.amount })

    if (category) await uc(category.id, { count: (category.count || 0) + 1 })
  })
}
