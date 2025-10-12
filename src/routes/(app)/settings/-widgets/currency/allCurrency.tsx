import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { updateCurrency } from './servies'
import type { ICurrency } from '@/integrations/db/db.type'
import { Button } from '@/components/ui/button'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { getAllCurrencies } from '@/lib/constants/currencies'
import { cn } from '@/lib'

export const AllCurrencies: React.FC<{ selected: Array<ICurrency> }> = ({
  selected,
}) => {
  const allCurrencies = getAllCurrencies('en')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCurrencies = allCurrencies.filter(({ name, code }) => {
    const search = searchTerm.toLowerCase().trim()
    return (
      search === '' ||
      name.toLowerCase().includes(search) ||
      code.toLowerCase().includes(search)
    )
  })

  const isDefaultCode = selected.find((c) => c.is_default)?.code
  const unselectedCurrencies = filteredCurrencies.filter(
    (currency) => !selected.some((s) => s.code === currency.code),
  )

  const filteredSelected = selected.filter(({ name, code }) => {
    const search = searchTerm.toLowerCase().trim()
    return (
      search === '' ||
      name.toLowerCase().includes(search) ||
      code.toLowerCase().includes(search)
    )
  })

  const sortedSelected = [...filteredSelected].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1
    if (!a.is_default && b.is_default) return 1
    return a.name.localeCompare(b.name)
  })

  const renderCurrencyItem = (
    currency: (typeof allCurrencies)[0],
    isChecked: boolean,
  ) => (
    <Label
      key={currency.code}
      htmlFor={`currency-${currency.code}`}
      className={cn(
        'flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-md transition-colors',
        currency.code === isDefaultCode && 'opacity-50',
      )}
    >
      <Checkbox
        id={`currency-${currency.code}`}
        checked={isChecked}
        onCheckedChange={async (e) => await updateCurrency(currency, !!e)}
        disabled={currency.code === isDefaultCode}
        className="h-4 w-4"
      />
      <div className="flex-1 text-sm">{currency.name}</div>
      <span className="text-sm text-muted-foreground">{currency.symbol}</span>
    </Label>
  )

  return (
    <ResponsiveModal
      trigger={
        <Button
          variant="outline"
          className="h-12 w-full border-dashed hover:bg-secondary/50 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          <span className="text-sm">Add Currency</span>
        </Button>
      }
      title="Select Currencies"
    >
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          type="search"
          placeholder="Search currencies..."
          className="pl-9 h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-1 overflow-auto max-h-[60vh] md:max-h-80">
        {sortedSelected.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm font-medium px-2 py-1">
              Selected Currencies
            </div>
            {sortedSelected.map((currency) =>
              renderCurrencyItem(currency, true),
            )}
            <Separator className="my-3" />
          </div>
        )}

        <div className="space-y-1">
          {sortedSelected.length > 0 && (
            <div className="text-sm font-medium px-2 py-1">
              Available Currencies
            </div>
          )}

          {searchTerm && !filteredCurrencies.length ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              No currencies found
            </div>
          ) : unselectedCurrencies.length ? (
            unselectedCurrencies.map((currency) =>
              renderCurrencyItem(currency, false),
            )
          ) : searchTerm ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              No more currencies found
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4 text-sm">
              All currencies have been selected
            </div>
          )}
        </div>
      </div>
    </ResponsiveModal>
  )
}
