import { MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(savedDarkMode)

    if (savedDarkMode) {
      document.body.classList.add('dark')
    }
  }, [])

  const handleToggle = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)

    if (newDarkMode) {
      document.body.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.body.classList.remove('dark')
      localStorage.removeItem('darkMode')
    }
  }

  return (
    <Button
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      variant="outline"
      size="icon"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  )
}
