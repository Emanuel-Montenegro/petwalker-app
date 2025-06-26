import type { Config } from 'tailwindcss';

const config: Config = {
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
        // Puedes añadir más tonos si es necesario, por ejemplo:
        // gray: {
        //   100: '#f4f4f4',
        //   200: '#e5e5e5',
        //   // ... otros tonos de gris
        // },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
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
      },
    },
  },
  plugins: [],
};
export default config; 