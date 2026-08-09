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
        bg: {
          DEFAULT: "var(--bg-app)",
          app: "var(--bg-app)",
          surface: "var(--bg-surface)",
          glass: "var(--bg-glass)",
          elevated: "var(--bg-elevated)",
        },
        border: {
          DEFAULT: "var(--border-1)",
          subtle: "var(--border-2)",
        },
        ink: {
          DEFAULT: "var(--text-1)",
          secondary: "var(--text-2)",
          tertiary: "var(--text-3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          border: "var(--accent-border)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          soft: "var(--info-soft)",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15,23,42,0.04), 0 4px 24px rgba(15,23,42,0.04)',
        'card-hover': '0 2px 4px rgba(15,23,42,0.06), 0 12px 32px rgba(15,23,42,0.08)',
        'glow-accent': '0 0 0 1px var(--accent-border), 0 8px 32px rgba(0,102,255,0.18)',
        'glow-success': '0 0 0 1px rgba(5,150,105,0.25), 0 8px 32px rgba(5,150,105,0.18)',
        'glow-danger': '0 0 0 1px rgba(220,38,38,0.25), 0 8px 32px rgba(220,38,38,0.18)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.22,1,0.36,1)',
        'pop': 'pop 0.25s cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
};

export default config;
