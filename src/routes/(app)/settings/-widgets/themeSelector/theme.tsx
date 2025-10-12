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
    <div className="space-y-2">
      <h2 className="text-base font-medium">Color Theme</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={theme} onValueChange={handleChange}>
          <SelectTrigger
            id="theme-selector"
            aria-label="Select color theme"
            className="flex-1 min-w-[180px]"
          >
            <SelectValue placeholder="Choose a theme" />
          </SelectTrigger>
          <SelectContent className="max-h-80" hideScrollButtons>
            {THEME_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id} className="gap-4">
                <div className="flex items-center gap-2" data-theme={opt.id}>
                  <div className="relative grid grid-cols-4 items-center gap-0.5">
                    <div className="size-1.5 rounded-full border border-border bg-primary" />
                    <div className="size-1.5 rounded-full border border-border bg-secondary" />
                    <div className="size-1.5 rounded-full border border-border bg-accent" />
                    <div className="size-1.5 rounded-full border border-border bg-background" />
                  </div>
                  <span>{opt.name}</span>
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
            className="h-8 w-8"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={randomTheme}
            aria-label="Random theme"
            className="h-8 w-8"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
