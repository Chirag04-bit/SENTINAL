/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1D4ED8' },
        secondary: { DEFAULT: '#4F46E5', light: '#6366F1', dark: '#4338CA' },
        accent:    { DEFAULT: '#06B6D4', light: '#22D3EE', dark: '#0891B2' },
        success:   { DEFAULT: '#10B981', light: '#34D399', dark: '#059669' },
        warning:   { DEFAULT: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
        danger:    { DEFAULT: '#EF4444', light: '#F87171', dark: '#DC2626' },
        navy: {
          50:  '#E8ECF8',
          100: '#C5CFEF',
          200: '#9FAEE4',
          300: '#798EDA',
          400: '#5B74D3',
          500: '#3D5ACC',
          600: '#2A3FA3',
          700: '#1E2F7A',
          800: '#141F52',
          900: '#0A0F1E',
          950: '#060A14',
        },
        card: 'rgba(15,22,41,0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.15), transparent)',
        'card-glow': 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(6,182,212,0.05))',
      },
      boxShadow: {
        'glow-cyan':    '0 0 20px rgba(6,182,212,0.25)',
        'glow-blue':    '0 0 20px rgba(37,99,235,0.25)',
        'glow-red':     '0 0 20px rgba(239,68,68,0.25)',
        'glow-green':   '0 0 20px rgba(16,185,129,0.25)',
        'card':         '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':   '0 8px 32px rgba(6,182,212,0.15)',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'count-up':      'countUp 1s ease-out',
        'ping-slow':     'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
