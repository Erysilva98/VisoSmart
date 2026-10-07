/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#F4F1FF', 100: '#EAE4FF', 200: '#D1C7FF', 300: '#AFA1FF', 400: '#748CFF', 500: '#426BFF', 600: '#3C53D9', 700: '#3246B8', 800: '#26368C', 900: '#202D7D' },
        income: '#0B784B', expense: '#C92E3A',
        ink: { 50: '#F4F7FB', 100: '#EDF1F7', 200: '#E3E9F2', 300: '#CDD6E5', 400: '#99A6BC', 500: '#67758F', 600: '#4E5E78', 700: '#33435F', 800: '#1B2B4A', 900: '#102A5C' },
        success: '#19B36B', warning: '#E5AD27', danger: '#F04D4D',
        accent: { 50: '#ECF8FF', 100: '#DDF3FF', 200: '#BCE9FF', 300: '#91D8FF', 400: '#6AC5FF', 500: '#6EC5FF', 600: '#318FD6', 700: '#206FAF' },
        violet: { 50: '#F4F0FF', 100: '#EAE2FF', 200: '#D2C2FF', 300: '#B49AFF', 400: '#9574FF', 500: '#7C6BFF', 600: '#7C6BFF', 700: '#6047DE' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], display: ['Sora', 'Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.25rem' },
      boxShadow: { card: '0 10px 24px -14px rgba(9,20,51,0.28), 0 2px 7px rgba(9,20,51,0.04)', 'card-hover': '0 14px 28px -12px rgba(79,109,255,0.22)', soft: '0 10px 30px -13px rgba(9,20,51,0.18)' },
      animation: { 'fade-in': 'fadeIn 0.3s ease-out', 'slide-up': 'slideUp 0.35s ease-out', 'scale-in': 'scaleIn 0.2s ease-out' },
      keyframes: { fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }, slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }, scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } } },
    },
  },
  plugins: [],
};
