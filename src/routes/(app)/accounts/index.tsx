import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Package, PackageOpen } from 'lucide-react'
import { AccountCard } from './-ui/accountCard'
import { AddAccountForm } from './-ui/accountForm'
import { useAccountsStore } from '@/integrations/db/db.store'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/(app)/accounts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showArchived, setShowArchived] = useState(false)
  const { items: allAccounts } = useAccountsStore()

  const archivedAccounts = allAccounts.filter((account) => account.is_archived)
  const activeAccounts = allAccounts.filter((account) => !account.is_archived)

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Accounts Summary</h1>
        <div className="flex items-center gap-2">
          {archivedAccounts.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-1"
            >
              {showArchived ? (
                <PackageOpen className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {showArchived ? 'Hide' : 'Show'} Archived
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {archivedAccounts.length}
                </span>
              </span>
            </Button>
          )}
          <AddAccountForm />
        </div>
      </div>

      {/* Active Accounts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {activeAccounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
        {activeAccounts.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No accounts found. Create your first account to get started.
          </div>
        )}
      </div>

      {/* Archived Accounts Section */}
      {showArchived && archivedAccounts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Archived Accounts</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {archivedAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
