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
        primary: { DEFAULT: '#3B82F6', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
        secondary: { DEFAULT: '#8B5CF6', 400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9' },
        accent: { DEFAULT: '#06B6D4', 400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 700: '#0E7490' },
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
