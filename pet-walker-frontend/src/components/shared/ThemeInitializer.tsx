'use client'

import { useThemeStore } from '@/lib/store/themeStore'
import { useEffect } from 'react'

export function ThemeInitializer() {
  const { setTheme } = useThemeStore()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-storage')
    if (savedTheme) {
      try {
        const { state } = JSON.parse(savedTheme)
        setTheme(state.theme)
      } catch (e) {
        console.error('Error al cargar el tema:', e)
      }
    }
  }, [setTheme])

  return null
} 