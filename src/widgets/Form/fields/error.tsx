import { cn } from '@/lib/utils'

export type IFormErrorProps = React.HTMLAttributes<HTMLElement> & {
  errors: Array<string | { message: string }>
}
export const FormError: React.FC<IFormErrorProps> = (props) => {
  const { errors, className, ...rest } = props
  return (
    <>
      {errors.map((error) => (
        <em
          key={typeof error === 'string' ? error : error.message}
          className={cn(
            '-bottom-4 absolute right-1 mt-1 text-[9px] text-destructive',
            className,
          )}
          {...rest}
        >
          {typeof error === 'string' ? error : error.message}
        </em>
      ))}
    </>
  )
}
