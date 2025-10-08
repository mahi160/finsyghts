import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../useFormContext'
import { FormError } from './error'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type IFormTextarea =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string
  }
export const FormTextarea: React.FC<IFormTextarea> = (props) => {
  const { label, name, rows = 3, ...rest } = props
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="relative flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        name={name}
        id={rest.id ?? name}
        {...rest}
      />
      {field.state.meta.isTouched && <FormError errors={errors} />}
    </div>
  )
}
