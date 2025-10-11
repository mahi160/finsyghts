import { Pencil } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import React from 'react'
import z from 'zod'
import type { ICategory } from '@/integrations/db/db.type'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { Button } from '@/components/ui/button'
import { CATEGORY_ICONS } from '@/lib'
import { useAppForm } from '@/widgets/Form/useAppForm'
import { ETransactionType } from '@/integrations/db/db.type'
import { useCategoriesStore } from '@/integrations/db/db.store'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  transaction_type: z.string(),
  icon: z.string(),
  is_archived: z.boolean(),
})

const transactionTypeOptions = [
  { value: ETransactionType.EXPENSE, label: 'Expense' },
  { value: ETransactionType.INCOME, label: 'Income' },
]

const iconOptions = CATEGORY_ICONS

export interface ICategoryFormProps {
  initial?: ICategory
}

export const AddCategoryForm: React.FC<ICategoryFormProps> = ({ initial }) => {
  const { update, add } = useCategoriesStore()
  const [open, setOpen] = React.useState(false)
  const defaultValues = {
    name: initial?.name || '',
    transaction_type: initial?.transaction_type || '',
    icon: initial?.icon || '',
    is_archived: initial?.is_archived || false,
  }
  const isEdit = Boolean(initial?.id)

  const form = useAppForm({
    defaultValues,
    validators: {
      onBlur: categorySchema,
      onSubmit: categorySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEdit && initial?.id) {
          await update(initial.id, {
            name: value.name,
            transaction_type: value.transaction_type as ETransactionType,
            icon: value.icon,
            is_archived: value.is_archived,
          })
        } else {
          await add({
            name: value.name,
            transaction_type: value.transaction_type as ETransactionType,
            icon: value.icon,
          })
        }
        setOpen(false)
      } catch (error) {
        console.error('Failed to save category:', error)
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
    <Button>Add Category</Button>
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
        }}
        className="grid gap-6"
      >
        <form.AppField name="name">
          {(field) => (
            <field.Input label="Category Name" placeholder="Food & Dining" />
          )}
        </form.AppField>

        <form.AppField name="transaction_type">
          {(field) => (
            <field.Select
              label="Transaction Type"
              placeholder="Select transaction type"
              options={transactionTypeOptions}
            />
          )}
        </form.AppField>

        <form.AppField name="icon">
          {(field) => (
            <field.Select
              label="Icon"
              placeholder="Select an icon"
              options={iconOptions}
              Item={(label, value) => (
                <>
                  <DynamicIcon name={value as any} size={32} />{' '}
                  <span>{label}</span>
                </>
              )}
            />
          )}
        </form.AppField>

        {isEdit && (
          <form.AppField name="is_archived">
            {(field) => (
              <field.Checkbox label="Archive Category" name={field.name} />
            )}
          </form.AppField>
        )}
      </form>
    </ResponsiveModal>
  )
}
