/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./popup.html', './dashboard.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0f14',
          900: '#111820',
          800: '#1a2430',
          700: '#263241',
          600: '#3a4a5e',
        },
        risk: {
          safe: '#17a673',
          caution: '#d99b1f',
          suspicious: '#e2662c',
          danger: '#d93a36',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
