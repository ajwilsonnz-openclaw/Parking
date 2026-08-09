/**
 * Design Tokens - Millennium Village Parking
 *
 * Single source of truth for all colors. Consumed by:
 *   1. globals.css  (as CSS custom properties)
 *   2. tailwind.config.ts (as Tailwind utilities referencing the CSS vars)
 *
 * Light theme: crisp, airy, iOS-like - the look from the mockup.
 * Dark theme:  deep navy glass - sophisticated, not inverted.
 */

export const tokens = {
  light: {
    // Backgrounds
    bgApp: '#f1f5f9',           // slate-100, subtle blue-grey wash
    bgSurface: '#ffffff',       // cards
    bgGlass: 'rgba(255,255,255,0.82)',
    bgElevated: '#ffffff',

    // Borders & dividers
    border1: '#e2e8f0',         // slate-200
    border2: '#f1f5f9',         // slate-100

    // Text
    text1: '#0f172a',           // slate-900
    text2: '#475569',           // slate-600
    text3: '#94a3b8',           // slate-400

    // Accent - electric blue
    accent: '#0066ff',
    accentHover: '#0058e6',
    accentSoft: '#e8f0ff',      // tinted bg for chips
    accentBorder: '#bfdbfe',

    // Semantic
    success: '#059669',         // emerald-600
    successSoft: '#d1fae5',
    warning: '#d97706',         // amber-600
    warningSoft: '#fef3c7',
    danger: '#dc2626',          // red-600
    dangerSoft: '#fee2e2',
    info: '#0284c7',            // sky-600
    infoSoft: '#e0f2fe',

    // Specialty
    themeColor: '#f8fafc',      // browser chrome light
  },
  dark: {
    bgApp: '#070b12',
    bgSurface: '#0e1522',
    bgGlass: 'rgba(14,21,34,0.86)',
    bgElevated: '#141d2e',

    border1: 'rgba(148,163,184,0.14)',
    border2: 'rgba(148,163,184,0.08)',

    text1: '#f1f5f9',
    text2: '#a8b6c8',
    text3: '#64748b',

    // Dark mode accent is a touch brighter to read well on dark bg
    accent: '#3b82f6',
    accentHover: '#60a5fa',
    accentSoft: 'rgba(59,130,246,0.16)',
    accentBorder: 'rgba(59,130,246,0.35)',

    success: '#34d399',
    successSoft: 'rgba(52,211,153,0.14)',
    warning: '#fbbf24',
    warningSoft: 'rgba(251,191,36,0.14)',
    danger: '#f87171',
    dangerSoft: 'rgba(248,113,113,0.14)',
    info: '#38bdf8',
    infoSoft: 'rgba(56,189,248,0.14)',

    themeColor: '#090d16',
  },
} as const;

export type ThemeMode = 'light' | 'dark' | 'system';
export const THEME_STORAGE_KEY = 'mvp-theme';
