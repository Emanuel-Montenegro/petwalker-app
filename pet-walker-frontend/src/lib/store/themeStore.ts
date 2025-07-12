'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const applyTheme = (isDark: boolean) => {
  if (typeof window !== 'undefined') {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        applyTheme(newMode);
      },
      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        applyTheme(isDark);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
); 