import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { AccountCard } from './-ui/accountCard'
import { AddAccountForm } from './-ui/accountForm'
import { db } from '@/integrations/db/db'

export const Route = createFileRoute('/(app)/accounts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const data = useLiveQuery(() => db.accounts.toArray()) ?? []
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Accounts Summary</h1>
        <AddAccountForm />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
        {data.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No accounts found. Create your first account to get started.
          </div>
        )}
      </div>
    </>
  )
}
