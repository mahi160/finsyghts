import { z } from 'zod'
import { useAppForm } from '../Form/useAppForm'
import { addRecord } from './service'
import { useAccountsStore } from '@/integrations/db/db.store'
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
  account_from_id: z.string().min(1, 'Account From is required'),
  date: z.date('Date is required'),
  description: z.string().optional(),
})

export function TransferForm() {
  const { items: accounts } = useAccountsStore()
  const accountOptions = accounts
    .filter((acc) => !acc.is_archived)
    .map((account) => ({
      label: account.name,
      value: account.id,
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
        type: ETransactionType.TRANSFER,
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

      <form.AppField name="account_from_id">
        {(field) => (
          <field.Select
            name={field.name}
            label="Account from"
            options={accountOptions}
            placeholder="Select account"
          />
        )}
      </form.AppField>
      <form.AppField name="account_to_id">
        {(field) => (
          <field.Select
            name={field.name}
            label="Account to"
            options={accountOptions}
            placeholder="Select account"
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
        <form.FormButton label="Add Transfer" className="w-full" />
      </form.AppForm>
    </form>
  )
}
