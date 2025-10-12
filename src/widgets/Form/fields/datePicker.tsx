import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../useFormContext'
import { FormError } from './error'
import { DatePicker } from '@/components/DatePicker'
import { Label } from '@/components/ui/label'

export type IFormDatePickerProps = {
  label: string
}
export const FormDatePicker: React.FC<IFormDatePickerProps> = (props) => {
  const { label } = props
  const field = useFieldContext<Date>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="relative flex flex-col gap-2">
      <Label htmlFor="date-picker">{label}</Label>
      <DatePicker date={field.state.value} setDate={field.handleChange} />
      {field.state.meta.isTouched && <FormError errors={errors} />}
    </div>
  )
}
