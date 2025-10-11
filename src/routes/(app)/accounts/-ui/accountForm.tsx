import { Pencil, Plus } from 'lucide-react'
import React from 'react'
import z from 'zod'
import type { IAccount } from '@/integrations/db/db.type'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/widgets/Form/useAppForm'
import {
  useAccountsStore,
  useCurrenciesStore,
} from '@/integrations/db/db.store'

import { EAccountType } from '@/integrations/db/db.type'

export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  balance: z.string().refine((val) => !isNaN(Number(val))),
  currency: z.string().min(1, 'Currency is required'),
  type: z.enum(EAccountType),
  is_archived: z.boolean(),
})

const accountTypeOptions = [
  { value: EAccountType.CASH, label: 'Cash' },
  { value: EAccountType.CHECKING, label: 'Checking' },
  { value: EAccountType.SAVINGS, label: 'Savings' },
  { value: EAccountType.CREDIT, label: 'Credit' },
  { value: EAccountType.INVESTMENT, label: 'Investment' },
]

export interface IAccountFormProps {
  initial?: IAccount
}

export const AddAccountForm: React.FC<IAccountFormProps> = ({ initial }) => {
  const [open, setOpen] = React.useState(false)
  const { add, update } = useAccountsStore()
  const { items: currencies } = useCurrenciesStore()

  const isEdit = Boolean(initial?.id)

  const currencyOptions = currencies
    .map((currency) => ({
      value: currency.code,
      label: `${currency.code} - ${currency.name}`,
      is_default: currency.is_default,
    }))
    .sort((a, b) => {
      if (a.is_default && !b.is_default) return -1
      if (!a.is_default && b.is_default) return 1
      return a.label.localeCompare(b.label)
    })

  const defaultValues = {
    name: initial?.name || '',
    balance: initial?.balance.toString() || '0.00',
    type: initial?.type || EAccountType.CASH,
    currency: initial?.currency || currencyOptions[0]?.value,
    is_archived: initial?.is_archived || false,
  }

  const handleFormSubmit = React.useCallback(
    async ({ value }: { value: z.infer<typeof accountSchema> }) => {
      const signedBalance = (type: EAccountType, balance: string | number) => {
        if (type === EAccountType.CREDIT && Number(balance) !== 0) {
          return -Math.abs(Number(balance))
        } else {
          return Math.abs(Number(balance))
        }
      }

      const finalBalance = signedBalance(value.type, value.balance)

      try {
        if (isEdit && initial?.id) {
          await update(initial.id, {
            name: value.name,
            type: value.type,
            currency: value.currency,
            balance: finalBalance,
            is_archived: value.is_archived,
          })
        } else {
          await add({
            name: value.name,
            type: value.type,
            currency: value.currency,
            initial_balance: finalBalance,
            balance: finalBalance,
          })
        }
        setOpen(false)
      } catch (error) {
        console.error('Failed to save account:', error)
      }
    },
    [add, initial, isEdit, update],
  )

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: accountSchema,
    },
    onSubmit: handleFormSubmit,
  })

  const Footer = (
    <form.AppForm>
      <form.FormButton
        onClick={form.handleSubmit}
        label="Submit"
        className="mt-2 w-full"
      />
    </form.AppForm>
  )

  const Trigger = isEdit ? (
    <Button size="icon" variant="ghost" aria-label="Edit Account">
      <Pencil />
    </Button>
  ) : (
    <Button>
      <span className="hidden sm:inline">Add Account</span>
      <Plus className="sm:hidden" aria-hidden="true" />
    </Button>
  )

  return (
    <ResponsiveModal
      trigger={Trigger}
      open={open}
      onOpenChange={setOpen}
      footer={Footer}
      hideHeader
    >
      <form onSubmit={form.handleSubmit} className="grid gap-6">
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
              disabled={isEdit}
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
              step="1"
              min="0"
              label="Balance / Due"
              placeholder="0"
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
