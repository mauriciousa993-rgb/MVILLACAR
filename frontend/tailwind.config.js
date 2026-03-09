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
          50: '#e8eefb',
          100: '#ccd9f5',
          200: '#9db6ea',
          300: '#6f93df',
          400: '#436fd2',
          500: '#184cbf',
          600: '#103b9a',
          700: '#0b2d78',
          800: '#072157',
          900: '#04183d',
        },
        surface: {
          900: '#060b1a',
          800: '#0d1630',
          700: '#101c38',
          600: '#142246',
        },
        ink: {
          50: '#f7f7f8',
          100: '#e4e4e4',
          200: '#b8b9bf',
          300: '#8f9096',
        },
        silver: '#c8ccd1',
        signal: '#436fd2',
      },
    },
  },
  plugins: [],
}
