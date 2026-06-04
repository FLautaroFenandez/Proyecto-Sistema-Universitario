/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          azul:       '#1B3A6B',
          'azul-dark':'#0F2040',
          'azul-mid': '#2B5298',
          naranja:    '#E8612C',
          verde:      '#4CAF50',
          rosa:       '#D63384',
          celeste:    '#29ABE2',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body:    ['Source Sans 3', 'sans-serif'],
        sans:    ['Source Sans 3', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':      { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':      { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      animation: {
        'fade-in-up':    'fadeInUp 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        blob:            'blob 8s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-pattern': "url('/assets/hero-bg.jpg')",
      },
    },
  },
  plugins: [],
}

