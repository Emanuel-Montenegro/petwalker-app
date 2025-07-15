'use client'

import { useThemeStore } from '@/lib/store/themeStore'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full transition-all duration-500 hover:bg-gray-700/30 flex items-center justify-center"
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <div className="relative w-6 h-6 translate-y-[1px]">
        <Sun 
          className="absolute inset-0 h-full w-full rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-400/90 stroke-[1.5]" 
          strokeLinecap="round"
        />
        <Moon 
          className="absolute inset-0 h-full w-full rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-blue-300/90 stroke-[1.5]" 
          strokeLinecap="round"
        />
      </div>
    </Button>
  )
} 