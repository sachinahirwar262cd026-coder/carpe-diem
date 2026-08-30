/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        aqi: {
          good: '#10b981',        // 0-50 Green
          moderate: '#f59e0b',    // 51-100 Yellow/Amber
          poor: '#f97316',        // 101-200 Orange
          veryPoor: '#ef4444',    // 201-300 Red
          severe: '#7c3aed',      // 301-400 Purple
          hazardous: '#831843',   // 400+ Maroon
        },
        noise: {
          quiet: '#10b981',       // < 50 dB
          moderate: '#3b82f6',    // 50-65 dB
          loud: '#f59e0b',        // 65-75 dB
          veryLoud: '#ef4444',    // 75-85 dB
          hazardous: '#7c3aed',   // > 85 dB
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sound-wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { height: '15%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}
