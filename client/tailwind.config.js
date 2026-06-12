/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        calm: '#eef4ff',
        civic: '#155eef',
        mint: '#0e9384',
        coral: '#e31b54'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(16, 24, 40, 0.10)'
      }
    }
  },
  plugins: []
};
