/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Warm paper backgrounds
        paper: {
          DEFAULT: '#FDFCF8',
          50: '#FEFDFB',
          100: '#FDFCF8',
          200: '#F9F7F1',
          300: '#F5F2EA',
        },
        // Rich ink colors
        ink: {
          DEFAULT: '#1C1917',
          50: '#F5F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#292524',
          800: '#1C1917',
          900: '#0C0A09',
        },
        // Warm amber accent (Renaissance feel)
        amber: {
          DEFAULT: '#78350F',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Terracotta accent
        terra: {
          DEFAULT: '#9A3412',
          light: '#C2410C',
          dark: '#7C2D12',
        },
        // Category colors (muted, elegant)
        category: {
          voeding: '#4D7C0F',      // Olive green
          supplement: '#7E22CE',   // Deep purple
          beweging: '#B45309',     // Warm amber
          slaap: '#1E40AF',        // Deep blue
          welzijn: '#BE185D',      // Rose
          overig: '#57534E',       // Stone
        },
        // Status colors (muted versions)
        success: '#4D7C0F',
        warning: '#B45309',
        error: '#B91C1C',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['System', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'headline': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'title': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'micro': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.02)',
        'soft': '0 2px 8px -2px rgba(28, 25, 23, 0.08)',
        'elevated': '0 8px 24px -4px rgba(28, 25, 23, 0.12)',
      },
      opacity: {
        '3': '0.03',
        '6': '0.06',
        '8': '0.08',
      },
    },
  },
  plugins: [],
};
