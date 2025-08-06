/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 3-Layer Background System
        background: {
          DEFAULT: '#FAFBFC', // Ultra-light with hint of blue
          dark: '#0F172A', // Deep dark slate
        },
        surface: {
          DEFAULT: '#FFFFFF', // Pure white
          dark: '#1E293B', // Elevated dark surface
        },
        'surface-elevated': {
          DEFAULT: '#FFFFFF', // Same as surface in light mode
          dark: '#334155', // Higher elevation (lighter slate)
        },
        'surface-overlay': {
          DEFAULT: 'rgba(255, 255, 255, 0.95)',
          dark: 'rgba(30, 41, 59, 0.95)',
        },
        // Valiance Media Blue Palette
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // Primary blue
          600: '#2563EB', // Valiance Media blue
          700: '#1D4ED8',
          800: '#1E40AF', // Deep blue
          900: '#1E3A8A', // Darkest blue
        },
        gray: {
          25: '#FCFCFD',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Secondary blue shades
        secondary: {
          DEFAULT: '#60A5FA',
          light: '#93C5FD',
          dark: '#3B82F6',
        },
        // Premium cyan accent
        premium: {
          DEFAULT: '#06B6D4',
          light: '#67E8F9',
          dark: '#0891B2',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}