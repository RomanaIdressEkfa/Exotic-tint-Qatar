/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./dist/**/*.html', './src/assets/js/**/*.js', './src/build.js'],
  theme: {
    extend: {
      colors: {
        // Deep Navy #071D38 · Royal Blue #0878E8 · Ice Blue #EAF5FF · Slate #64748B
        ink: { DEFAULT: '#071D38', 2: '#0C2A50', 3: '#163B69' },
        muted: '#64748B',
        line: '#E3ECF7',
        tint: { DEFAULT: '#EAF5FF', 2: '#F4F9FF' },
        gold: {
          50: '#EAF5FF',
          100: '#D3E8FD',
          200: '#A8D0FB',
          300: '#6FB0F6',
          400: '#3592EF',
          500: '#0878E8',
          600: '#0666C7',
          700: '#0553A3',
          800: '#064282',
        },
      },
      fontFamily: {
        head: ['Urbanist', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '82rem' },
      boxShadow: {
        soft: '0 20px 40px -15px rgba(7,29,56,.18)',
        card: '0 10px 30px -12px rgba(7,29,56,.12)',
        float: '0 20px 40px -15px rgba(7,29,56,.3)',
        gold: '0 10px 25px -8px rgba(8,120,232,.5)',
        glow: '0 30px 60px -25px rgba(8,120,232,.35)',
      },
    },
  },
  plugins: [],
};
