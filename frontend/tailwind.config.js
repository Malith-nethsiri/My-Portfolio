/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bddcff',
          300: '#8dc0ff',
          400: '#5ea1ff',
          500: '#3a7ef2',
          600: '#2d63d6',
          700: '#294dae',
          800: '#283f86',
          900: '#273a72',
        },
      },
      boxShadow: {
        glow: '0 20px 60px rgba(59, 130, 246, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        spacegrotesk: ['Space Grotesk', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        figtree: ['Figtree', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        onest: ['Onest', 'sans-serif'],
        Comfortaa: ['Comfortaa', 'cursive'],
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(96,165,250,0.35), transparent 30%), radial-gradient(circle at bottom right, rgba(168,85,247,0.18), transparent 35%)',
      },
    },
  },
  plugins: [],
}

