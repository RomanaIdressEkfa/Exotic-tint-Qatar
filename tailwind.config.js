/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./dist/**/*.html', './src/assets/js/**/*.js', './src/build.js'],
  theme: {
    extend: {
      colors: {
        // From the logo: navy + Exotic sky blue + silver
        ink: { DEFAULT: '#12233D', 2: '#1D3150', 3: '#2A4066' },
        muted: '#5B6B82',
        line: '#ECEEF3',
        tint: { DEFAULT: '#EFF8FD', 2: '#F6FBFE' },
        gold: {
          50: '#EEF8FD',
          100: '#D6EFFA',
          200: '#A9DDF4',
          300: '#6FC8EE',
          400: '#2FB2E6',
          500: '#00A0DC',
          600: '#0089C2',
          700: '#006E9C',
          800: '#05577A',
        },
      },
      fontFamily: {
        head: ['Urbanist', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '82rem' },
      boxShadow: {
        soft: '0 20px 40px -15px rgba(18,35,61,.18)',
        card: '0 10px 30px -12px rgba(18,35,61,.12)',
        float: '0 20px 40px -15px rgba(18,35,61,.3)',
        gold: '0 10px 25px -8px rgba(0,137,194,.5)',
        glow: '0 30px 60px -25px rgba(0,160,220,.38)',
      },
    },
  },
  plugins: [],
};
