/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,html}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        card: '#ffffff',
        dark: {
          DEFAULT: '#18181b',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        accent: {
          income: '#10b981', // Emerald green
          expense: '#ef4444', // Rose red
          due: '#f59e0b', // Amber orange
          primary: '#18181b', // Charcoal black primary
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        'elevated': '0 12px 32px -4px rgba(15, 23, 42, 0.1)',
        'dock': '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
