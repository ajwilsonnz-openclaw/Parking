'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface CircularRadarGaugeProps {
  available: number;
  total: number;
  occupiedSpotNumbers?: string[];
}

export const CircularRadarGauge: React.FC<CircularRadarGaugeProps> = ({
  available,
  total = 23,
}) => {
  const { paletteConfig } = useTheme();
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const percentAvailable = total > 0 ? available / total : 1;
  const strokeDashoffset = circumference - percentAvailable * circumference;

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-4 select-none overflow-hidden">
      {/* --- Ambient 3D Orbital Rings (Matching active palette) --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer Elliptical Swirl 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="absolute w-72 h-44 rounded-full border opacity-60"
          style={{
            borderColor: paletteConfig.borderPrimary,
            boxShadow: `0 0 25px ${paletteConfig.ambientGlow}`,
            transform: 'rotateX(60deg)',
          }}
        />
        {/* Outer Elliptical Swirl 2 (reverse tilt) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute w-80 h-48 rounded-full border opacity-40"
          style={{
            borderColor: paletteConfig.accentSecondary,
            boxShadow: `0 0 35px ${paletteConfig.ambientGlow}`,
            transform: 'rotateX(65deg) rotateY(20deg)',
          }}
        />
        {/* Radial Ambient Center Glow */}
        <div
          className="absolute w-48 h-48 rounded-full blur-2xl pointer-events-none"
          style={{ backgroundColor: paletteConfig.ambientGlow }}
        />
      </div>

      {/* --- Main Circular Radar & Gauge SVG Container --- */}
      <div className="relative w-60 h-60 flex items-center justify-center z-10">
        {/* Rotating Conic Radar Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 rounded-full pointer-events-none opacity-30"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, ${paletteConfig.accentPrimary} 0deg, transparent 60deg, transparent 360deg)`,
          }}
        />

        {/* SVG Circular Tracks & Orbiting Tracer Line */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220">
          <defs>
            {/* Dynamic Gradient for Active Progress */}
            <linearGradient id="themeGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={paletteConfig.accentSecondary} />
              <stop offset="70%" stopColor={paletteConfig.accentPrimary} />
              <stop offset="100%" stopColor={paletteConfig.accentPrimary} />
            </linearGradient>

            {/* Glowing Tracer Beam Gradient */}
            <linearGradient id="themeTracerBeamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={paletteConfig.accentSecondary} stopOpacity="1" />
              <stop offset="100%" stopColor={paletteConfig.accentPrimary} stopOpacity="0" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="8"
          />

          {/* Foreground Progress Ring */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="url(#themeGaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            filter="url(#gaugeGlow)"
          />

          {/* Continuous Orbiting Tracer Line (Rotating Beam) */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius + 8}
            fill="none"
            stroke="url(#themeTracerBeamGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="45 520"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '110px 110px' }}
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* --- Center Metric Content --- */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <div className="flex items-baseline justify-center gap-0.5 text-white">
            <span className="text-5xl font-black font-mono tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-white">
              <AnimatedNumber value={available} />
            </span>
            <span
              className="text-lg font-bold font-mono opacity-80"
              style={{ color: paletteConfig.accentSecondary }}
            >
              /{total}
            </span>
          </div>

          <span
            className="text-[11px] font-extrabold uppercase tracking-widest mt-0.5"
            style={{ color: paletteConfig.textMuted }}
          >
            Visitor Parks
          </span>
        </div>
      </div>
    </div>
  );
};
