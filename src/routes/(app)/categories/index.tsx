import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { CategoryCard } from './-ui/categoryCard'
import { AddCategoryForm } from './-ui/categoryForm'
import { PageHeading } from '@/components/PageHeading'
import { db } from '@/integrations/db/db'

export const Route = createFileRoute('/(app)/categories/')({
  component: RouteComponent,
})

function RouteComponent() {
  const categories = useLiveQuery(() => db.categories.toArray(), [])
  const incomes = categories?.filter((c) => c.transaction_type === 'income')
  const expenses = categories?.filter((c) => c.transaction_type === 'expense')
  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeading
          title="Categories"
          subtitle="Manage your income and expense categories"
        />
        <AddCategoryForm />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-10">
        <section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {incomes?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
        <section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {expenses?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
