import type { ICurrency } from '@/integrations/db/db.type'

export function getAllCurrencies(locale: string = 'en'): Array<ICurrency> {
  const codes: Array<string> = Intl.supportedValuesOf('currency')
  const displayNames = new Intl.DisplayNames([locale], { type: 'currency' })

  const currencyList = codes.map((code) => {
    const symbol =
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        currencyDisplay: 'symbol',
      })
        .formatToParts(1)
        .find((part) => part.type === 'currency')?.value ?? code

    const name = displayNames.of(code) ?? code
    return { code, symbol, name }
  })

  return currencyList as Array<ICurrency>
}
