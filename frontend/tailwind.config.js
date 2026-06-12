/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        surface: { DEFAULT: '#0F172A', light: '#1E293B' },
        primary: { DEFAULT: '#6366F1', 400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA' },
        secondary: { DEFAULT: '#8B5CF6', 400: '#A78BFA', 500: '#8B5CF6' },
        accent: { DEFAULT: '#22D3EE', 400: '#22D3EE', 500: '#06B6D4' },
        border: 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: { '2xl': '16px', '3xl': '20px', '4xl': '24px' },
    },
  },
  plugins: [],
};
