import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F3EF',
        primary: {
          DEFAULT: '#1B4FD8',
          50: '#EEF2FD',
          100: '#D5E0FA',
          600: '#1B4FD8',
          700: '#1540B8',
        },
        health: {
          DEFAULT: '#059669',
          50: '#ECFDF5',
          100: '#D1FAE5',
          600: '#059669',
          700: '#047857',
        },
        signal: {
          new:      '#F59E0B',
          stress:   '#EF4444',
          tender:   '#8B5CF6',
          permit:   '#3B82F6',
          acquisition: '#EC4899',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
