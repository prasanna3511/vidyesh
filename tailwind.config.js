/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        fadeOut: 'fadeOut 4s ease-in forwards',
        slideDown: 'slideDown 4s ease-in-out forwards', // 👈 NEW
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
