import { AddAccountForm } from './accountForm'
import type { IAccount } from '@/integrations/db/db.type'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import './accountCard.css'

interface AccountCardProps {
  account: IAccount
  balanceTrend?: Array<number>
}

export function AccountCard({ account }: AccountCardProps) {
  const { name, balance, currency, type, is_archived, created_at } = account
  const [intPart, decPart] = formatCurrency(balance, currency).split('.')

  return (
    <div
      className={cn(
        'account-card relative w-full min-w-60 rounded-xl p-4 sm:p-6 font-sans flex flex-col justify-between',
        'h-32 sm:h-40 shadow-sm sm:shadow-md overflow-hidden',
        is_archived && 'opacity-80 grayscale',
      )}
      style={{
        background: `var(--bg-${type.toLowerCase()})`,
        transition: 'background 0.3s ease-in-out',
      }}
    >
      {is_archived && (
        <span className="absolute right-6 bottom-5 sm:bottom-7 grayscale-0 z-10 text-sm bg-foreground text-background rounded-[100svh] font-semibold px-2 py-1">
          Archived
        </span>
      )}
      <header className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-foreground/70 text-[10px] sm:text-xs uppercase tracking-wide mb-0.5">
            {type}
          </p>
          <h2 className="font-semibold text-sm sm:text-lg tracking-tight truncate max-w-[140px]">
            {name}
          </h2>
        </div>
        <AddAccountForm initial={account} />
      </header>

      {/* Balance */}
      <main className="relative z-10 mt-1 sm:mt-3">
        <p className="text-muted-foreground text-xs">Current Balance</p>
        <p className="font-semibold text-xl sm:text-2xl tracking-tight">
          {type === 'credit' && '-'}
          {intPart}
          <span className="text-xs sm:text-sm font-normal text-foreground/70">
            .{decPart}
          </span>
        </p>
      </main>

      {/* Footer + archived badge */}
      <footer className="flex items-center justify-between mt-1 text-muted-foreground text-xs font-semibold absolute bottom-5 sm:bottom-7 right-6">
        <span>{`Since ${formatDate(created_at, 'MM/yy')}`}</span>
      </footer>
    </div>
  )
}
