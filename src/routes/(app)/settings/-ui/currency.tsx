import { CheckCircle, Circle, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { addOrDeleteCurrency } from '../-utils/servies'
import type { ICurrency } from '@/integrations/db/db.type'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import { getAllCurrencies } from '@/lib/constants/currencies'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { getAllRecords } from '@/integrations/db/db.utils'
import { Label } from '@/components/ui/label'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

export const CurrencySettings = () => {
  const selectedCurrencies = getAllRecords<ICurrency>('currencies')
  const currencyList = useMemo(() => getAllCurrencies('en'), [])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCurrencies = useMemo(
    () =>
      currencyList.filter(
        ({ name, code }) =>
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, currencyList],
  )

  const handleCurrencyToggle = async (
    currency: Partial<ICurrency>,
    checked: boolean,
  ) => {
    if (!selectedCurrencies.length && checked) currency['is_default'] = true
    await addOrDeleteCurrency(currency, checked)
  }

  const isCurrencySelected = (code: string) =>
    selectedCurrencies.some((c) => c.code === code)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Currency Settings
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedCurrencies.map(({ code, name, symbol, is_default }) => (
          <Item variant="outline" key={code}>
            <ItemMedia variant="default">{symbol}</ItemMedia>
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
              <ItemDescription>1 USD = 1 {code}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {is_default ? (
                <Button variant="ghost" size="icon">
                  <CheckCircle />
                </Button>
              ) : (
                <Button variant="ghost" size="icon">
                  <Circle />
                </Button>
              )}
            </ItemActions>
          </Item>
        ))}

        <ResponsiveModal
          trigger={
            <Button
              variant="outline"
              className="h-full flex flex-col items-center justify-center border-dashed hover:bg-secondary/80 transition-colors"
            >
              <Plus size={32} className="text-primary" />
              <span className="mt-2 text-primary">Add Currency</span>
            </Button>
          }
          title="Select Currencies"
        >
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="search"
              placeholder="Search currencies..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 mt-4 overflow-auto max-h-96">
            {filteredCurrencies.length ? (
              filteredCurrencies.map(({ code, name, symbol }) => (
                <Label
                  key={code}
                  htmlFor={`currency-${code}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 rounded-md transition-colors"
                >
                  <Checkbox
                    id={`currency-${code}`}
                    checked={isCurrencySelected(code)}
                    onCheckedChange={(checked) =>
                      handleCurrencyToggle({ code, name, symbol }, !!checked)
                    }
                  />
                  <div className="flex-1 font-medium">{name}</div>
                  <span className="text-muted-foreground">{symbol}</span>
                </Label>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No currencies found
              </div>
            )}
          </div>
        </ResponsiveModal>
      </div>
    </div>
  )
}
