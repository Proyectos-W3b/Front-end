/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Figtree', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Remapea la escala `blue` completa a un cobalto profundo con matiz
        // violeta: todos los bg-blue-*/text-blue-* existentes adoptan la nueva
        // identidad sin tocar cada componente.
        blue: {
          50:  '#f4f6fb',
          100: '#e8edf8',
          200: '#cdd8f0',
          300: '#a4b7e4',
          400: '#7590d5',
          500: '#4f6cc7',
          600: '#3d55b8',
          700: '#33459c',
          800: '#2d3b7e',
          900: '#293464',
          950: '#1c2242',
        },
        brand: {
          50:  '#f4f6fb',
          100: '#e8edf8',
          500: '#4f6cc7',
          600: '#3d55b8',
          700: '#33459c',
          900: '#293464',
        },
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        border:      'var(--border)',
        input:       'var(--input)',
        ring:        'var(--ring)',
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive:  'var(--destructive)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
    },
  },
  plugins: [],
};
