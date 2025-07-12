'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/lib/store/themeStore';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const handleToggle = () => {
    toggleDarkMode();
    
    // Forzar aplicación inmediata del tema
    setTimeout(() => {
      const html = document.documentElement;
      const newMode = !isDarkMode;
      if (newMode) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }, 0);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-200 hover:to-purple-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 shadow-lg"
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDarkMode ? (
          <Sun className="w-4 h-4 text-yellow-500 animate-in spin-in-180 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-blue-600 animate-in spin-in-180 duration-300" />
        )}
      </div>
      
      {/* Efecto de brillo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </Button>
  );
};

export default ThemeToggle; 