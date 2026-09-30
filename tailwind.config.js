/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#F0F5FA', 100: '#E1EBF5', 200: '#BFD3E8', 300: '#94B4D6', 400: '#648EBB', 500: '#35699D', 600: '#245789', 700: '#1D466F', 800: '#183B5D', 900: '#142E48' },
        income: '#15803D', expense: '#B91C1C',
        ink: { 50: '#F7F8FC', 100: '#F0F2F8', 200: '#E7EAF3', 300: '#CBD2E2', 400: '#98A2B3', 500: '#657084', 600: '#4B566A', 700: '#354156', 800: '#253147', 900: '#111936' },
        success: '#16C784', warning: '#e5ad27', danger: '#dc4b59',
        accent: { 50: '#EFF7FF', 100: '#DFEFFF', 200: '#BFDEFF', 300: '#94C7FF', 400: '#70B5FF', 500: '#4FA3FF', 600: '#2476CE', 700: '#195DA8' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.25rem' },
      boxShadow: { card: '0px 4px 20px rgba(17,25,54,0.08)', 'card-hover': '0 8px 24px -8px rgb(23 34 55 / 0.13)', soft: '0 8px 30px -12px rgb(23 34 55 / 0.15)' },
      animation: { 'fade-in': 'fadeIn 0.3s ease-out', 'slide-up': 'slideUp 0.35s ease-out', 'scale-in': 'scaleIn 0.2s ease-out' },
      keyframes: { fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }, slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }, scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } } },
    },
  },
  plugins: [],
};
