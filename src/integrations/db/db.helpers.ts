import { db } from './db'

export async function updateCategoryStats(
  categoryId: string,
  amount: number,
  increment = 1,
) {
  const category = await db.categories.get(categoryId)
  if (!category) return

  await db.categories.update(category.id, {
    count: (category.count || 0) + increment,
    total_cost: (category.total_cost || 0) + amount,
    updated_at: new Date(),
    sync_status: 'pending',
  })
}
