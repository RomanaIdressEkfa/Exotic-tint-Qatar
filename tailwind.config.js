/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./dist/**/*.html', './src/assets/js/**/*.js', './src/build.js'],
  theme: {
    extend: {
      colors: {
        // From the logo: navy shield + warm sunlight gold
        ink: { DEFAULT: '#12233D', 2: '#1D3150', 3: '#2A4066' },
        muted: '#5B6B82',
        line: '#ECEEF3',
        tint: { DEFAULT: '#FFF8EC', 2: '#FDFAF4' },
        gold: {
          50: '#FFF8EC',
          100: '#FDEFD4',
          200: '#F9DDA6',
          300: '#F6C766',
          400: '#EDB24C',
          500: '#E9A63B',
          600: '#D08A22',
          700: '#B7741A',
          800: '#8E5915',
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
        gold: '0 10px 25px -8px rgba(217,147,42,.55)',
        glow: '0 30px 60px -25px rgba(233,166,59,.45)',
      },
    },
  },
  plugins: [],
};
