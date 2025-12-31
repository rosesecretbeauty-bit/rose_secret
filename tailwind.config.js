/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // New Premium Palette
        rose: {
          50: '#FFF0F5', // Lavender Blush
          100: '#FFE4E1', // Misty Rose
          200: '#FFC0CB', // Pink
          300: '#FFB6C1', // Light Pink
          400: '#FF69B4', // Hot Pink (accent)
          500: '#DB7093', // Pale Violet Red
          600: '#C71585', // Medium Violet Red
          700: '#800080', // Purple
          800: '#4B0082', // Indigo
          900: '#2D002D', // Dark Purple
        },
        lavender: {
          50: '#F8F8FF',
          100: '#F3E5F5',
          200: '#E1BEE7',
          300: '#CE93D8',
          400: '#AB47BC',
          500: '#9C27B0',
          600: '#8E24AA',
          700: '#7B1FA2',
          800: '#6A1B9A',
          900: '#4A148C',
        },
        champagne: {
          50: '#FFF8F0',
          100: '#FAEBD7',
          200: '#F5DEB3',
          300: '#DEB887',
          400: '#D2B48C',
          500: '#C19A6B',
          600: '#A08055',
          700: '#8B4513',
          800: '#654321',
          900: '#3E2723',
        },
        cream: {
          50: '#FFFAF0',
          100: '#FFF8DC',
          200: '#EEE8AA',
        },
        charcoal: {
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#BDBDBD',
          300: '#9E9E9E',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#2D2D2D', // Primary Text
          800: '#212121',
          900: '#121212',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(219, 112, 147, 0.1)',
        'medium': '0 4px 20px rgba(219, 112, 147, 0.15)',
        'hard': '0 8px 30px rgba(219, 112, 147, 0.2)',
        'glow': '0 0 15px rgba(255, 182, 193, 0.5)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #FFF0F5 0%, #F3E5F5 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FAEBD7 0%, #F5DEB3 100%)',
        'gradient-rose': 'linear-gradient(135deg, #FFC0CB 0%, #DB7093 100%)',
        'glass': 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}