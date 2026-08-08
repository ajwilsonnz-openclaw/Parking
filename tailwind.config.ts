import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0066ff',
          600: '#005ce6',
          700: '#0052cc',
          800: '#003d99',
          900: '#002966',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'mockup': '0 4px 20px rgba(0, 0, 0, 0.03)',
        'mockup-hover': '0 8px 30px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};

export default config;
