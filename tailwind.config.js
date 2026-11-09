/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#102a43',
          900: '#0b192c',
          950: '#060d17',
        },
        gold: {
          light: '#f9f1d0',
          DEFAULT: '#d4af37',
          dark: '#aa820a',
        },
        y2k: {
          pink: '#ff70a6',
          purple: '#70d6ff',
          silver: '#e2e8f0',
        }
      },
      fontFamily: {
        serif: ['"Black Mango"', '"Playfair Display"', 'Georgia', 'serif'],
        mango: ['"Black Mango"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
        cursive: ['"Dancing Script"', 'cursive'],
        mono: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg) scale(1.02)' },
          '50%': { transform: 'rotate(3deg) scale(0.98)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
