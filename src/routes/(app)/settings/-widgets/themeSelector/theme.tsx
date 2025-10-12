import { RefreshCcw, Shuffle } from 'lucide-react'
import React from 'react'
import DarkModeToggle from './mode'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ThemeOption {
  name: string
  id: string
}

const THEME_OPTIONS: Array<ThemeOption> = [
  { name: 'Default', id: 'gray' },
  { name: 'Default Blue', id: 'blue' },
  { name: 'Default Red', id: 'red' },
  { name: 'Default Green', id: 'green' },
  { name: 'Arctic Forest', id: 'arctic-forest' },
  { name: 'Bubble Gum', id: 'bubble-gum' },
  { name: 'Cosmic Dust', id: 'cosmic-dust' },
  { name: 'Desert Mirage', id: 'desert-mirage' },
  { name: 'Forest Heaven', id: 'forest-heaven' },
  { name: 'Midnight Sky', id: 'midnight-sky' },
  { name: 'Neon Pulse', id: 'neon-pulse' },
  { name: 'Ocean Breeze', id: 'ocean-breeze' },
  { name: 'Default Orange', id: 'orange' },
  { name: 'Sunset Glow', id: 'sunset-glow' },
  { name: 'Twilight Bloom', id: 'twilight-bloom' },
  { name: 'Vintage Sepia', id: 'vintage-sepia' },
]

function applyTheme(theme: string) {
  if (typeof document === 'undefined') return
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

export default function ThemeSelector() {
  const [theme, setTheme] = React.useState<string>('')

  React.useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
      document.body.setAttribute('data-theme', stored)
    }
  }, [])

  const handleChange = React.useCallback(
    (value: string) => {
      if (value === theme) return
      setTheme(value)
      applyTheme(value)
    },
    [theme],
  )
  const randomTheme = React.useCallback(() => {
    const t = THEME_OPTIONS[Math.floor(Math.random() * THEME_OPTIONS.length)].id
    handleChange(t)
  }, [handleChange])

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium sm:text-xl">Color Theme</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={theme} onValueChange={handleChange}>
          <SelectTrigger
            id="theme-selector"
            aria-label="Select color theme"
            className="flex-1 min-w-[180px] h-10"
          >
            <SelectValue placeholder="Choose a theme" />
          </SelectTrigger>
          <SelectContent className="max-h-80" hideScrollButtons>
            {THEME_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id} className="gap-3">
                <div className="flex items-center gap-2" data-theme={opt.id}>
                  <div className="relative grid grid-cols-4 items-center gap-1">
                    <div className="size-2 rounded-full border border-border bg-primary" />
                    <div className="size-2 rounded-full border border-border bg-secondary" />
                    <div className="size-2 rounded-full border border-border bg-accent" />
                    <div className="size-2 rounded-full border border-border bg-background" />
                  </div>
                  <span className="font-medium">{opt.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <DarkModeToggle />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleChange('gray')}
            aria-label="Reset to default theme"
            disabled={theme === ''}
            className="h-10 w-10"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={randomTheme}
            aria-label="Random theme"
            className="h-10 w-10"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
