/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: {
          100: '#FDF2E9',
          200: '#FBEADB',
          300: '#F4B183',
          400: '#E59C6B',
          600: '#D2691E',
        },
        mint: {
          100: '#E6F0ED',
          200: '#D1E0DB',
          600: '#3D7A68',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              color: '#3D7A68',
              '&:hover': {
                color: '#2A5A48',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
}