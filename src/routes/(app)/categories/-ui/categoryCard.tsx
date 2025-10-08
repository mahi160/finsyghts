import { DynamicIcon } from 'lucide-react/dynamic'
import { AddCategoryForm } from './categoryForm'
import type { ICategory } from '@/integrations/db/db.type'
import { cn, formatCurrency } from '@/lib/utils'

export function CategoryCard({ category }: { category: ICategory }) {
  const { name, transaction_type, icon, is_archived, count, total_cost } =
    category

  return (
    <div
      className={cn(
        'group flex rounded-md border border-b-2 p-2 text-sm',
        is_archived && 'opacity-50 grayscale-100',
        transaction_type === 'income' && 'border-b-emerald-400',
        transaction_type === 'expense' && 'border-b-rose-400',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
          <DynamicIcon name={icon as any} size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">
            {count && `${formatCurrency(total_cost || 0)} (${count || 0})`}
            {!count && transaction_type}
          </p>
        </div>
      </div>
      <div className="shrink-0 md:opacity-0 transition-opacity md:group-hover:opacity-100">
        <AddCategoryForm initial={category} />
      </div>
    </div>
  )
}
