import { createFormHook } from '@tanstack/react-form'
import { FormButton } from './fields/button'
import { FormCheckbox } from './fields/checkbox'
import { FormInput } from './fields/input'
import { FormSelect } from './fields/select'
import { FormTextarea } from './fields/textarea'
import { fieldContext, formContext } from './useFormContext'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Textarea: FormTextarea,
    Select: FormSelect,
    Checkbox: FormCheckbox,
  },
  formComponents: {
    FormButton,
  },
  fieldContext,
  formContext,
})
