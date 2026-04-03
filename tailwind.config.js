/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        brand: {
          blue: '#0ea5e9',
          cyan: '#22d3ee',
          dark: '#050505',
        }
      }
    },
  },
  plugins: [],
}
