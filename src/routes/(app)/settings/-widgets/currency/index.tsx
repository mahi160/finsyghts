import { CheckCircle } from 'lucide-react'
import { AllCurrencies } from './allCurrency'
import { markAsDefault } from './servies'
import type { ICurrency } from '@/integrations/db/db.type'
import { Button } from '@/components/ui/button'
import { useCurrenciesStore } from '@/integrations/db/db.store'

export const CurrencySettings = () => {
  const { items: selectedCurrencies } = useCurrenciesStore()

  // Sort currencies to keep default/selected at the top
  const sortedCurrencies = [...selectedCurrencies].sort((a, b) => {
    // Sort by is_default first (true values first)
    if (a.is_default && !b.is_default) return -1
    if (!a.is_default && b.is_default) return 1
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name)
  })

  const renderCurrencyItem = ({
    id,
    code,
    name,
    symbol,
    is_default,
  }: ICurrency) => (
    <Button
      variant="outline"
      key={id}
      className="flex items-center gap-4 h-12 py-0"
      onClick={async () => await markAsDefault(code)}
    >
      <span className="text-muted-foreground">{symbol}</span>
      <span className="text-sm truncate flex-1">{name}</span>
      <span className="text-xs text-muted-foreground">$0.13</span>
      {is_default && <CheckCircle size={16} className="text-primary" />}
    </Button>
  )
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Currency Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {sortedCurrencies.map((currency) => renderCurrencyItem(currency))}
        <AllCurrencies selected={selectedCurrencies} />
      </div>
    </div>
  )
}
