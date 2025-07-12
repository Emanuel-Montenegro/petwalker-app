import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores del diseño de Behance
        primary: '#336666', // Verde/Azul Oscuro principal
        accent: '#26CC90', // Verde vibrante
        highlight: '#FF6B35', // Naranja/Rojo para acciones
        // Colores para modo oscuro - tonos que matchean la paleta
        dark: {
          bg: '#0f1419', // Azul muy oscuro
          surface: '#1a2332', // Azul oscuro para cards
          border: '#2d3748', // Borde sutil
          text: '#e2e8f0', // Texto claro
          muted: '#718096', // Texto secundario
          accent: '#4fd1c7', // Verde-azul brillante para modo oscuro
          primary: '#4a9eff', // Azul brillante
          highlight: '#ff8a65', // Naranja suave
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'dark-glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config; 