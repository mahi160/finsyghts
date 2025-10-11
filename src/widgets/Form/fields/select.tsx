import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../useFormContext'
import { FormError } from './error'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SelectOption {
  value: string
  label: string
}

export interface IFormSelectProps extends React.ComponentProps<typeof Select> {
  label: string
  placeholder?: string
  options: Array<SelectOption>
  name?: string
  Item?: (label: string, value: string) => React.ReactNode
}

export const FormSelect: React.FC<IFormSelectProps> = (props) => {
  const { name, label, placeholder, options, Item, ...rest } = props
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="relative flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select
        value={field.state.value}
        onValueChange={field.handleChange}
        name={name}
      >
        <SelectTrigger className="w-full" {...rest}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ label: itemLabel, value }) => (
            <SelectItem key={value} value={value}>
              {Item?.(itemLabel, value) || itemLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.state.meta.isTouched && <FormError errors={errors} />}
    </div>
  )
}
