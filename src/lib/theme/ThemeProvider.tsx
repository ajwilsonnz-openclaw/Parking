'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type PaletteId = 'emerald' | 'olive' | 'steel' | 'taupe' | 'terracotta';

export interface PaletteConfig {
  id: PaletteId;
  name: string;
  subtitle: string;
  swatches: string[];
  bgApp: string;
  bgCard: string;
  bgCardElevated: string;
  borderPrimary: string;
  accentPrimary: string;
  accentSecondary: string;
  accentGradient: string;
  ambientGlow: string;
  textHeading: string;
  textMuted: string;
}

export const PALETTES: Record<PaletteId, PaletteConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Glow',
    subtitle: 'Linksy Obsidian & Mint',
    swatches: ['#07130D', '#0C1F16', '#10B981', '#34D399'],
    bgApp: '#07130D',
    bgCard: '#0C1F16',
    bgCardElevated: '#0E2319',
    borderPrimary: 'rgba(16, 185, 129, 0.25)',
    accentPrimary: '#10B981',
    accentSecondary: '#34D399',
    accentGradient: 'linear-gradient(to right, #10B981, #34D399, #2DD4BF)',
    ambientGlow: 'rgba(16, 185, 129, 0.22)',
    textHeading: '#FFFFFF',
    textMuted: '#6EE7B7',
  },
  olive: {
    id: 'olive',
    name: 'Olive Grove',
    subtitle: 'Forest Olive & Sage Mist',
    swatches: ['#1C1F13', '#252919', '#636B2F', '#BAC095'],
    bgApp: '#181A10',
    bgCard: '#242818',
    bgCardElevated: '#2D321F',
    borderPrimary: 'rgba(186, 192, 149, 0.28)',
    accentPrimary: '#BAC095',
    accentSecondary: '#D4DE95',
    accentGradient: 'linear-gradient(to right, #8C9848, #BAC095, #D4DE95)',
    ambientGlow: 'rgba(186, 192, 149, 0.24)',
    textHeading: '#FFFFFF',
    textMuted: '#D4DE95',
  },
  steel: {
    id: 'steel',
    name: 'Steel Slate',
    subtitle: 'Nordic Steel & Ivory Cream',
    swatches: ['#11161B', '#1C242C', '#6D8196', '#FFFFE3'],
    bgApp: '#10151A',
    bgCard: '#182028',
    bgCardElevated: '#202A34',
    borderPrimary: 'rgba(109, 129, 150, 0.32)',
    accentPrimary: '#6D8196',
    accentSecondary: '#94A3B8',
    accentGradient: 'linear-gradient(to right, #6D8196, #8FA5BD, #CBCBCB)',
    ambientGlow: 'rgba(109, 129, 150, 0.26)',
    textHeading: '#FFFFE3',
    textMuted: '#CBCBCB',
  },
  taupe: {
    id: 'taupe',
    name: 'Obsidian Taupe',
    subtitle: 'Espresso Black & Warm Mauve',
    swatches: ['#0E0B0C', '#1D1718', '#5C4E4E', '#988686'],
    bgApp: '#0E0B0C',
    bgCard: '#1C1617',
    bgCardElevated: '#261F20',
    borderPrimary: 'rgba(152, 134, 134, 0.32)',
    accentPrimary: '#988686',
    accentSecondary: '#D1D0D0',
    accentGradient: 'linear-gradient(to right, #7A6969, #988686, #D1D0D0)',
    ambientGlow: 'rgba(152, 134, 134, 0.24)',
    textHeading: '#FFFFFF',
    textMuted: '#D1D0D0',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta Rust',
    subtitle: 'Midnight Ember & Warm Copper',
    swatches: ['#0E0B0A', '#1C1513', '#A35E47', '#FFA488'],
    bgApp: '#0E0B0A',
    bgCard: '#1C1412',
    bgCardElevated: '#271C19',
    borderPrimary: 'rgba(163, 94, 71, 0.35)',
    accentPrimary: '#A35E47',
    accentSecondary: '#FFA488',
    accentGradient: 'linear-gradient(to right, #A35E47, #C87558, #FFA488)',
    ambientGlow: 'rgba(163, 94, 71, 0.28)',
    textHeading: '#FFF5F2',
    textMuted: '#FFA488',
  },
};

const STORAGE_KEY = 'mvp-palette';

interface ThemeContextValue {
  palette: PaletteId;
  paletteConfig: PaletteConfig;
  setPalette: (paletteId: PaletteId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyPaletteToDOM(paletteId: PaletteId) {
  if (typeof document === 'undefined') return;
  const cfg = PALETTES[paletteId] || PALETTES.emerald;
  const root = document.documentElement;

  root.setAttribute('data-theme', paletteId);
  root.style.setProperty('--app-bg', cfg.bgApp);
  root.style.setProperty('--card-bg', cfg.bgCard);
  root.style.setProperty('--card-elevated', cfg.bgCardElevated);
  root.style.setProperty('--card-border', cfg.borderPrimary);
  root.style.setProperty('--accent-primary', cfg.accentPrimary);
  root.style.setProperty('--accent-secondary', cfg.accentSecondary);
  root.style.setProperty('--accent-gradient', cfg.accentGradient);
  root.style.setProperty('--ambient-glow', cfg.ambientGlow);
  root.style.setProperty('--text-heading', cfg.textHeading);
  root.style.setProperty('--text-muted', cfg.textMuted);

  document.body.style.backgroundColor = cfg.bgApp;

  // Dynamically create or update theme-color meta tag for Android status & navigation bar
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', cfg.bgApp);

  // Update apple mobile status bar style
  let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!metaStatusBar) {
    metaStatusBar = document.createElement('meta');
    metaStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    document.head.appendChild(metaStatusBar);
  }
  metaStatusBar.setAttribute('content', 'black-translucent');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>('steel');

  useEffect(() => {
    let stored: PaletteId = 'steel';
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as PaletteId;
      if (raw && PALETTES[raw]) stored = raw;
    } catch {}
    setPaletteState(stored);
    applyPaletteToDOM(stored);
  }, []);

  const setPalette = useCallback((paletteId: PaletteId) => {
    if (!PALETTES[paletteId]) return;
    setPaletteState(paletteId);
    try {
      localStorage.setItem(STORAGE_KEY, paletteId);
    } catch {}
    applyPaletteToDOM(paletteId);
  }, []);

  const paletteConfig = PALETTES[palette] || PALETTES.steel;

  return (
    <ThemeContext.Provider value={{ palette, paletteConfig, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}') || 'steel';
    var palettes = ${JSON.stringify(
      Object.fromEntries(
        Object.entries(PALETTES).map(([k, v]) => [
          k,
          {
            bgApp: v.bgApp,
            bgCard: v.bgCard,
            bgCardElevated: v.bgCardElevated,
            borderPrimary: v.borderPrimary,
            accentPrimary: v.accentPrimary,
            accentSecondary: v.accentSecondary,
            accentGradient: v.accentGradient,
            ambientGlow: v.ambientGlow,
            textHeading: v.textHeading,
            textMuted: v.textMuted,
          },
        ])
      )
    )};
    var cfg = palettes[stored] || palettes['steel'];
    var root = document.documentElement;
    root.setAttribute('data-theme', stored);
    root.style.setProperty('--app-bg', cfg.bgApp);
    root.style.setProperty('--card-bg', cfg.bgCard);
    root.style.setProperty('--card-elevated', cfg.bgCardElevated);
    root.style.setProperty('--card-border', cfg.borderPrimary);
    root.style.setProperty('--accent-primary', cfg.accentPrimary);
    root.style.setProperty('--accent-secondary', cfg.accentSecondary);
    root.style.setProperty('--accent-gradient', cfg.accentGradient);
    root.style.setProperty('--ambient-glow', cfg.ambientGlow);
    root.style.setProperty('--text-heading', cfg.textHeading);
    root.style.setProperty('--text-muted', cfg.textMuted);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', cfg.bgApp);
  } catch (e) {}
})();
`;
