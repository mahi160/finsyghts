import { useFormContext } from '../useFormContext'
import { Button } from '@/components/ui/button'

export type IFormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}
export const FormButton: React.FC<IFormButtonProps> = (props) => {
  const { label, ...rest } = props
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting} {...rest}>
          {isSubmitting ? 'isSubmitting' : label}
        </Button>
      )}
    </form.Subscribe>
  )
}
