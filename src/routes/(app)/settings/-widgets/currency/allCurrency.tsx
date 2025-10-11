import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { updateCurrency } from './servies'
import type { ICurrency } from '@/integrations/db/db.type'
import { Button } from '@/components/ui/button'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { getAllCurrencies } from '@/lib/constants/currencies'

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
  const isSelected = (code: string) => selected.some((c) => c.code === code)

  return (
    <ResponsiveModal
      trigger={
        <Button
          variant="outline"
          className="h-12 border-dashed hover:bg-secondary/50 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Currency
        </Button>
      }
      title="Select Currencies"
    >
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          type="search"
          placeholder="Search currencies..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-1 overflow-auto max-h-80">
        {filteredCurrencies.length ? (
          filteredCurrencies.map((currency) => (
            <Label
              key={currency.code}
              htmlFor={`currency-${currency.code}`}
              className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-md transition-colors"
            >
              <Checkbox
                id={`currency-${currency.code}`}
                checked={isSelected(currency.code)}
                onCheckedChange={async (e) =>
                  await updateCurrency(currency, !!e)
                }
              />
              <div className="flex-1">{currency.name}</div>
              <span className="text-muted-foreground">{currency.symbol}</span>
            </Label>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-3">
            No currencies found
          </div>
        )}
      </div>
    </ResponsiveModal>
  )
}
