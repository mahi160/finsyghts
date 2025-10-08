import { useFieldContext } from '../useFormContext'
import type { CheckedState } from '@radix-ui/react-checkbox'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export type CheckboxProps = React.ComponentProps<typeof Checkbox> & {
  label: string
}
export const FormCheckbox: React.FC<CheckboxProps> = (props) => {
  const { label, ...rest } = props
  const field = useFieldContext<CheckedState>()

  return (
    <div className="relative flex gap-2">
      <Checkbox
        checked={field.state.value}
        onBlur={field.handleBlur}
        onCheckedChange={(e) => field.handleChange(e)}
        id={rest.id || rest.name}
        {...rest}
      />
      <Label htmlFor={rest.id || rest.name}>{label}</Label>
    </div>
  )
}
