import { Pencil } from 'lucide-react'
import React from 'react'
import z from 'zod'
import type { IAccount } from '@/integrations/db/db.type'
import { EAccountType } from '@/integrations/db/db.type'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/widgets/Form/useAppForm'
import { addRecord, updateRecord } from '@/integrations/db/db.utils'

export const accountSchema = z.object({
  balance: z.number(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(EAccountType),
  currency: z.string().min(1, 'Currency is required'),
  is_archived: z.boolean(),
})

const accountTypeOptions = [
  { value: EAccountType.CASH, label: 'Cash' },
  { value: EAccountType.CHECKING, label: 'Checking' },
  { value: EAccountType.SAVINGS, label: 'Savings' },
  { value: EAccountType.CREDIT, label: 'Credit' },
  { value: EAccountType.INVESTMENT, label: 'Investment' },
]

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
]

export interface IAccountFormProps {
  initial?: IAccount
}

export const AddAccountForm: React.FC<IAccountFormProps> = ({ initial }) => {
  const [open, setOpen] = React.useState(false)
  const defaultValues = {
    balance: initial?.balance || 0,
    name: initial?.name || '',
    type: initial?.type || EAccountType.CASH,
    currency: initial?.currency || 'USD',
    is_archived: initial?.is_archived || false,
  }
  const isEdit = Boolean(initial?.id)

  const form = useAppForm({
    defaultValues,
    validators: {
      onBlur: accountSchema,
      onSubmit: accountSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && initial?.id) {
          await updateRecord('accounts', initial.id, {
            name: value.name,
            type: value.type,
            currency: value.currency,
            balance: value.balance,
            is_archived: value.is_archived,
          })
        } else {
          await addRecord('accounts', {
            name: value.name,
            type: value.type,
            currency: value.currency,
            initial_balance: value.balance,
            balance: value.balance,
          })
        }
        setOpen(false)
      } catch (error) {
        console.error('Failed to save account:', error)
      }
    },
  })

  const Footer = (
    <>
      <form.AppForm>
        <form.FormButton
          label="Submit"
          className="mt-2 w-full"
          onClick={() => {
            form.handleSubmit()
            setOpen(false)
          }}
        />
      </form.AppForm>
    </>
  )
  const Trigger = isEdit ? (
    <Button size="icon" variant="ghost">
      <Pencil />
    </Button>
  ) : (
    <Button>Add Account</Button>
  )

  return (
    <ResponsiveModal
      trigger={Trigger}
      open={open}
      onOpenChange={setOpen}
      footer={Footer}
      hideHeader
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.preventDefault()
        }}
        className="grid gap-6"
      >
        <form.AppField name="name">
          {(field) => (
            <field.Input
              label="Account Name"
              placeholder="My Checking Account"
            />
          )}
        </form.AppField>

        <form.AppField name="type">
          {(field) => (
            <field.Select
              label="Account Type"
              placeholder="Select account type"
              options={accountTypeOptions}
            />
          )}
        </form.AppField>

        <form.AppField name="currency">
          {(field) => (
            <field.Select
              label="Currency"
              placeholder="Select currency"
              options={currencyOptions}
            />
          )}
        </form.AppField>

        <form.AppField name="balance">
          {(field) => (
            <field.Input
              type="number"
              step="0.01"
              label={isEdit ? 'Current Balance' : 'Initial Balance'}
              placeholder="0.00"
            />
          )}
        </form.AppField>

        {isEdit && (
          <form.AppField name="is_archived">
            {(field) => (
              <field.Checkbox label="Archive Account" name={field.name} />
            )}
          </form.AppField>
        )}
      </form>
    </ResponsiveModal>
  )
}
