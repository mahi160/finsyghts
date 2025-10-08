import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../useFormContext'
import { FormError } from './error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type IFormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
}
export const FormInput: React.FC<IFormInputProps> = (props) => {
  const { name, label, ...rest } = props
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="relative flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        name={name}
        id={rest.id ?? name}
        {...rest}
      />
      {field.state.meta.isTouched && <FormError errors={errors} />}
    </div>
  )
}
