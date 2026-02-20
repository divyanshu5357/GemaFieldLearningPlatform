/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#ec4899',
        dark: '#1e293b',
        'dark-light': '#334155',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}
