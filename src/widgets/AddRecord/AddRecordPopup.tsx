import { Plus } from 'lucide-react'
import React from 'react'
import { ExpenseForm } from './expenseForm'
import { IncomeForm } from './incomeForm'
import { TransferForm } from './transferForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useIsMobile } from '@/hooks/use-mobile'

export const AddRecord: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const [type, setType] = React.useState('expense')
  const isMobile = useIsMobile()

  const RecordContent = (
    <div className="flex flex-col gap-4 p-4">
      <RecordToggle value={type} setValue={setType} />
      {type === 'expense' && <ExpenseForm />}
      {type === 'income' && <IncomeForm />}
      {type === 'transfer' && <TransferForm />}
    </div>
  )

  return isMobile ? (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="size-12 rounded-xl bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl">
          <Plus className="size-5 stroke-[2.5px]" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-svh">
        <DrawerHeader hidden>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        {RecordContent}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog>
      <DialogTrigger asChild>
        <Button {...props}>
          <Plus /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader hidden>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {RecordContent}
      </DialogContent>
    </Dialog>
  )
}

function RecordToggle({
  value,
  setValue,
}: {
  value: string
  setValue: (type: string) => void
}) {
  return (
    <ToggleGroup
      variant="outline"
      type="single"
      className="w-full"
      value={value}
      onValueChange={(val) => val && setValue(val)}
    >
      <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
      <ToggleGroupItem value="income">Income</ToggleGroupItem>
      <ToggleGroupItem value="transfer">Transfer</ToggleGroupItem>
    </ToggleGroup>
  )
}
