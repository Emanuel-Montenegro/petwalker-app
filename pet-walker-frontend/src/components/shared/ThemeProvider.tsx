'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode, setDarkMode } = useThemeStore();

  useEffect(() => {
    // Función para aplicar el tema al DOM
    const applyTheme = (isDark: boolean) => {
      const html = document.documentElement;
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    // Verificar si hay preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        const savedIsDark = parsed.state?.isDarkMode || false;
        setDarkMode(savedIsDark);
        applyTheme(savedIsDark);
      } catch (error) {
        console.error('Error parsing theme from localStorage:', error);
        // Si hay error, usar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        applyTheme(prefersDark);
      }
    } else {
      // Si no hay preferencia guardada, usar la preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      applyTheme(prefersDark);
    }

    // Escuchar cambios en el store y aplicar al DOM
    const unsubscribe = useThemeStore.subscribe((state) => {
      applyTheme(state.isDarkMode);
    });

    return () => {
      unsubscribe();
    };
  }, [setDarkMode]);

  // También aplicar el tema actual al montar
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
} 