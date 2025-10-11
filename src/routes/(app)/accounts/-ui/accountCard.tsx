import { AddAccountForm } from './accountForm'
import type { IAccount } from '@/integrations/db/db.type'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import './accountCard.css'

export function AccountCard({ account }: { account: IAccount }) {
  const { name, balance, currency, type, is_archived, created_at } = account
  return (
    <div
      className={cn(
        'account-card relative h-48 min-w-60 w-full overflow-hidden rounded-xl p-6 font-sans',
      )}
      style={{
        background: `var(--bg-${type.toLowerCase()})`,
        transition: 'background 0.4s ease-in-out',
      }}
    >
      {is_archived && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-[2px]">
          <span className="font-meduim text-lg text-white/80 tracking-wider">
            Archived
          </span>
        </div>
      )}

      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="mb-1 text-foreground/80 text-sm uppercase tracking-wider">
            {type}
          </p>
          <h2 className="font-semibold text-xl tracking-tight">{name}</h2>
        </div>
        <AddAccountForm initial={account} />
      </header>

      <main>
        <p className="mb-1 text-foreground/70 text-xs">
          Current {type === 'credit' ? 'Due' : 'Balance'}
        </p>
        <code className="font-semibold text-3xl tracking-tight">
          {type === 'credit' && '-'}
          {formatCurrency(balance, currency).split('.')[0]}
          <span className="text-xs font-normal text-foreground/70">
            <i>.</i>
            {formatCurrency(balance, currency).split('.')[1]}
          </span>
        </code>
      </main>

      <footer className="absolute right-6 bottom-5 left-6 text-foreground/80 text-xs">
        <span>{`Since ${formatDate(created_at)}`}</span>
      </footer>
    </div>
  )
}
