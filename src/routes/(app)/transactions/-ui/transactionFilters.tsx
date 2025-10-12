import { Calendar, Check, ChevronsUpDown, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import type {
  ETransactionType,
  IAccount,
  ICategory,
} from '@/integrations/db/db.type'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface TransactionFiltersProps {
  accounts: Array<IAccount>
  categories: Array<ICategory>
  filters: {
    type: ETransactionType | null
    startDate: Date | null
    endDate: Date | null
    accountId: string | null
    categoryId: string | null
  }
  onFilterChange: (filters: {
    type: ETransactionType | null
    startDate: Date | null
    endDate: Date | null
    accountId: string | null
    categoryId: string | null
  }) => void
}

export function TransactionFilters({
  accounts,
  categories,
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const [open, setOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
    setOpen(false)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      type: null,
      startDate: null,
      endDate: null,
      accountId: null,
      categoryId: null,
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
    setOpen(false)
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        value={filters.type || ''}
        onValueChange={(value) => {
          onFilterChange({
            ...filters,
            type: value ? (value as ETransactionType) : null,
          })
        }}
      >
        <ToggleGroupItem value="expense">Expenses</ToggleGroupItem>
        <ToggleGroupItem value="income">Income</ToggleGroupItem>
        <ToggleGroupItem value="transfer">Transfers</ToggleGroupItem>
      </ToggleGroup>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'flex items-center gap-1',
              activeFiltersCount > 0 && 'border-primary',
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Date Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 border rounded-md p-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Start Date</span>
                </div>
                <div className="flex items-center gap-2 border rounded-md p-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">End Date</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Account</h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {filters.accountId
                      ? accounts.find((a) => a.id === filters.accountId)?.name
                      : 'All Accounts'}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <div className="max-h-80 overflow-auto">
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() =>
                        setLocalFilters({ ...localFilters, accountId: null })
                      }
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !localFilters.accountId ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      All Accounts
                    </Button>
                    {accounts.map((account) => (
                      <Button
                        key={account.id}
                        variant="ghost"
                        className="w-full justify-start font-normal"
                        onClick={() =>
                          setLocalFilters({
                            ...localFilters,
                            accountId: account.id,
                          })
                        }
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            localFilters.accountId === account.id
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {account.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Category</h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {filters.categoryId
                      ? categories.find((c) => c.id === filters.categoryId)
                          ?.name
                      : 'All Categories'}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <div className="max-h-80 overflow-auto">
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() =>
                        setLocalFilters({ ...localFilters, categoryId: null })
                      }
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !localFilters.categoryId
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="w-full justify-start font-normal"
                        onClick={() =>
                          setLocalFilters({
                            ...localFilters,
                            categoryId: category.id,
                          })
                        }
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            localFilters.categoryId === category.id
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear All
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
