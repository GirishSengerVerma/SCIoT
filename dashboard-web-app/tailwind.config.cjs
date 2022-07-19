/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary': '#00D1FF',
        'accentLight': '#DBDBDB',
        'accentDark': '#6D6D6D',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
  darkMode: 'class',
  variants: {
    scrollbar: ['dark']
  }
}
