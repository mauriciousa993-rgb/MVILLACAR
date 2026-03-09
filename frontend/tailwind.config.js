/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffe9ea',
          100: '#ffcfd2',
          200: '#ff9ea4',
          300: '#ff6972',
          400: '#ff3b47',
          500: '#e31b23',
          600: '#c3131b',
          700: '#a10f16',
          800: '#7f0b11',
          900: '#5e070c',
        },
        surface: {
          900: '#121212',
          800: '#1a1a1b',
          700: '#1e1e1e',
          600: '#252528',
        },
        ink: {
          50: '#f7f7f8',
          100: '#e4e4e4',
          200: '#b8b9bf',
          300: '#8f9096',
        },
        silver: '#c8ccd1',
        signal: '#ff3b30',
      },
    },
  },
  plugins: [],
}
