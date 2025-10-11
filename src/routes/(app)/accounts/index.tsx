import { createFileRoute } from '@tanstack/react-router'
import { AccountCard } from './-ui/accountCard'
import { AddAccountForm } from './-ui/accountForm'
import { useAccountsStore } from '@/integrations/db/db.store'

export const Route = createFileRoute('/(app)/accounts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { items: accounts } = useAccountsStore()
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Accounts Summary</h1>
        <AddAccountForm />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No accounts found. Create your first account to get started.
          </div>
        )}
      </div>
    </>
  )
}
