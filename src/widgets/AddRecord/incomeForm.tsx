import { z } from 'zod'
import { useAppForm } from '../Form/useAppForm'

const schema = z.object({
  amount: z.number('Amount is required'),
  account_to_id: z.string().min(1, 'Account To is required'),
  category_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
})

export function IncomeForm() {
  const form = useAppForm({
    validators: {
      onBlur: schema,
      onSubmit: schema,
    },
  })
  return (
    <div className="mx-auto w-full max-w-md p-4 sm:p-6 lg:p-8">
      <form className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <form.AppField name="amount">
            {(field) => (
              <field.Input
                name={field.name}
                label="Amount"
                type="number"
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            )}
          </form.AppField>
          <form.AppField name="date">
            {(field) => (
              <field.Input
                name={field.name}
                label="Date"
                type="date"
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="account_to_id">
          {(field) => (
            <field.Input
              name={field.name}
              label="Account To"
              type="text"
              className="transition-all duration-200 focus:scale-[1.02]"
            />
          )}
        </form.AppField>

        <form.AppField name="category_id">
          {(field) => (
            <field.Input
              name={field.name}
              label="Category"
              type="text"
              className="transition-all duration-200 focus:scale-[1.02]"
            />
          )}
        </form.AppField>

        <form.AppField name="description">
          {(field) => (
            <field.Textarea
              name={field.name}
              label="Description"
              className="min-h-[100px] resize-none transition-all duration-200 focus:scale-[1.02]"
            />
          )}
        </form.AppField>

        <form.AppForm>
          <form.FormButton
            label="Add Income"
            className="mt-8 w-full py-3 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          />
        </form.AppForm>
      </form>
    </div>
  )
}
