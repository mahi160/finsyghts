import { z } from 'zod'
import { useAppForm } from '../Form/useAppForm'
import { addRecord } from './service'
import {
  useAccountsStore,
  useCategoriesStore,
} from '@/integrations/db/db.store'
import { ETransactionType } from '@/integrations/db/db.type'

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) =>
        !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 999999999,
      'Amount must be a positive number between 0 and 999,999,999',
    ),
  account_to_id: z.string().min(1, 'Account From is required'),
  category_id: z.string().optional(),
  date: z.date('Date is required'),
  description: z.string().optional(),
})

export function IncomeForm() {
  const { items: accounts } = useAccountsStore()
  const accountOptions = accounts
    .filter((acc) => !acc.is_archived)
    .map((account) => ({
      label: account.name,
      value: account.id,
    }))

  const { items: category } = useCategoriesStore()
  const categoryOptions = category
    .filter((cat) => cat.transaction_type === ETransactionType.INCOME)
    .map((cat) => ({
      label: cat.name,
      value: cat.id,
    }))

  const form = useAppForm({
    validators: {
      onChange: schema,
    },
    onSubmit: async (values) => {
      const v = values.value as z.infer<typeof schema>
      await addRecord({
        ...v,
        amount: Number(v.amount),
        type: ETransactionType.INCOME,
      })
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="amount">
        {(field) => (
          <field.Input
            name={field.name}
            label="Amount"
            type="number"
            placeholder="Amount"
          />
        )}
      </form.AppField>
      <form.AppField name="date">
        {(field) => <field.DatePicker label="Date" />}
      </form.AppField>

      <form.AppField name="account_to_id">
        {(field) => (
          <field.Select
            name={field.name}
            label="Account To"
            options={accountOptions}
            placeholder="Select account"
          />
        )}
      </form.AppField>

      <form.AppField name="category_id">
        {(field) => (
          <field.Select
            name={field.name}
            label="Category"
            options={categoryOptions}
            placeholder="Select category"
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.Textarea
            name={field.name}
            label="Description"
            placeholder="Add a description"
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.FormButton label="Add Income" className="w-full" />
      </form.AppForm>
    </form>
  )
}
