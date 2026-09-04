import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#07111e',
          900: '#0b192c',
          800: '#14273e',
          700: '#1e385b',
          600: '#2b4d77',
          500: '#38669b',
          400: '#4e85c5',
          300: '#7cb1eb',
          200: '#b8d5f7',
          100: '#e1eeff',
        },
        card: {
          bg: '#252e39',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
