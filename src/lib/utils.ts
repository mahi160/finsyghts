import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
export function formatDate(
  dateString: string | Date,
  formatStr = 'MMM dd, yyyy',
) {
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString
  return format(d, formatStr)
}
