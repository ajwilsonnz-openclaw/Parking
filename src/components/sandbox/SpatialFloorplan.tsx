'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type BayStatus = 'available' | 'occupied' | 'reserved' | 'selected';
export type ZoneType = 'front' | 'rear' | 'all';

export interface ParkingBayData {
  id: string;
  label: string;
  zone: 'front' | 'rear';
  type: 'visitor' | 'resident';
  status: BayStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  width_m?: number;
  depth_m?: number;
  layout?: string;
  sessionPlate?: string;
  sessionVisitor?: string;
}

interface SpatialFloorplanProps {
  bays: ParkingBayData[];
  selectedBayId: string | null;
  onSelectBay: (bay: ParkingBayData) => void;
}

const ZONE_VIEWBOXES: Record<ZoneType, string> = {
  front: '0 0 400 580',
  rear: '0 570 400 640',
  all: '0 0 400 1210',
};

const STATUS_CONFIGS = {
  available: {
    fill: '#22c55e',
    fillOpacity: 0.22,
    stroke: '#22c55e',
    strokeWidth: 2,
    label: 'Available',
  },
  occupied: {
    fill: '#64748b',
    fillOpacity: 0.18,
    stroke: '#475569',
    strokeWidth: 1.5,
    label: 'Occupied',
  },
  reserved: {
    fill: '#f59e0b',
    fillOpacity: 0.25,
    stroke: '#f59e0b',
    strokeWidth: 2,
    label: 'Reserved',
  },
  selected: {
    fill: '#0066ff',
    fillOpacity: 0.50,
    stroke: '#38bdf8',
    strokeWidth: 3,
    label: 'Selected',
  },
};

export const SpatialFloorplan: React.FC<SpatialFloorplanProps> = ({
  bays,
  selectedBayId,
  onSelectBay,
}) => {
  const [activeZone, setActiveZone] = useState<ZoneType>('front');

  const filteredBays = useMemo(() => {
    if (activeZone === 'all') return bays;
    return bays.filter((bay) => bay.zone === activeZone);
  }, [bays, activeZone]);

  const activeViewBox = ZONE_VIEWBOXES[activeZone];

  const frontCount = useMemo(() => bays.filter((b) => b.zone === 'front').length, [bays]);
  const rearCount = useMemo(() => bays.filter((b) => b.zone === 'rear').length, [bays]);

  return (
    <div className="relative w-full max-w-md mx-auto bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl select-none flex flex-col">
      {/* Zone Control Header */}
      <div className="p-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 relative">
        <div>
          <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
            Millennium Village Floorplan
          </h2>
          <p className="text-xs font-bold text-slate-200">548 Albany Highway</p>
        </div>

        {/* Segmented Pill Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveZone('front')}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeZone === 'front' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeZone === 'front'}
          >
            {activeZone === 'front' && (
              <motion.div
                layoutId="activeZonePill"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Front ({frontCount})</span>
          </button>

          <button
            onClick={() => setActiveZone('rear')}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeZone === 'rear' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeZone === 'rear'}
          >
            {activeZone === 'rear' && (
              <motion.div
                layoutId="activeZonePill"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Rear ({rearCount})</span>
          </button>

          <button
            onClick={() => setActiveZone('all')}
            className={`relative px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeZone === 'all' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeZone === 'all'}
          >
            {activeZone === 'all' && (
              <motion.div
                layoutId="activeZonePill"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Full</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Vector Viewport */}
      <div className="relative w-full aspect-[4/5] bg-slate-950 touch-pan-y overflow-hidden">
        <motion.svg
          className="w-full h-full"
          animate={{ viewBox: activeViewBox }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="roadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="drivewayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#roadGrid)" />

          {/* Architectural Road Infrastructure */}
          <g id="roadway-layer">
            {/* Entrance Header Label (Front Zone) */}
            <text
              x="200"
              y="18"
              fill="#64748b"
              fontSize="10"
              fontWeight="800"
              fontFamily="sans-serif"
              textAnchor="middle"
              letterSpacing="1.5"
            >
              ▲ ALBANY HIGHWAY ENTRANCE ▲
            </text>

            {/* Main Entrance Driveway */}
            <path
              d="M 155,26 L 245,26 L 245,580 L 155,580 Z"
              fill="url(#drivewayGrad)"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <line
              x1="200"
              y1="30"
              x2="200"
              y2="570"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="8,8"
            />

            {/* Driveway Transition to Courtyard */}
            <path
              d="M 155,580 L 245,580 L 290,640 L 110,640 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Rear Courtyard Turning Circle */}
            <path
              d="M 70,640 L 330,640 L 330,1180 L 70,1180 Z"
              fill="url(#drivewayGrad)"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Central Landscaping Island */}
            <circle
              cx="200"
              cy="910"
              r="48"
              fill="#020617"
              stroke="#1e293b"
              strokeWidth="2.5"
            />
            <text
              x="200"
              y="914"
              fill="#475569"
              fontSize="9"
              fontWeight="800"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              COURTYARD
            </text>
          </g>

          {/* Architectural Building Outlines */}
          <g id="building-structures" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5">
            {/* West Wing Building */}
            <rect x="6" y="26" width="30" height="520" rx="6" />
            {/* East Wing Building */}
            <rect x="364" y="26" width="30" height="520" rx="6" />
            {/* Rear West Wing Building */}
            <rect x="6" y="600" width="30" height="560" rx="6" />
            {/* Rear East Wing Building */}
            <rect x="364" y="600" width="30" height="560" rx="6" />
          </g>

          {/* Interactive Parking Bays */}
          <g id="parking-bays">
            {filteredBays.map((bay) => {
              const isSelected = selectedBayId === bay.id;
              const statusKey = isSelected ? 'selected' : bay.status;
              const config = STATUS_CONFIGS[statusKey];
              const isInteractive = true;

              return (
                <g
                  key={bay.id}
                  transform={`rotate(${bay.rotation || 0}, ${bay.x + bay.width / 2}, ${
                    bay.y + bay.height / 2
                  })`}
                  onClick={() => onSelectBay(bay)}
                  className="cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  aria-label={`Bay ${bay.label}, ${bay.type} space, ${config.label}`}
                  aria-pressed={isSelected}
                >
                  {/* Invisible Hit-Box Overlay (+6px touch expansion for error-free tapping) */}
                  <rect
                    x={bay.x - 6}
                    y={bay.y - 6}
                    width={bay.width + 12}
                    height={bay.height + 12}
                    fill="transparent"
                  />

                  {/* Visible Bay Shape */}
                  <motion.rect
                    x={bay.x}
                    y={bay.y}
                    width={bay.width}
                    height={bay.height}
                    rx="6"
                    fill={config.fill}
                    fillOpacity={config.fillOpacity}
                    stroke={config.stroke}
                    strokeWidth={config.strokeWidth}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    animate={{
                      fillOpacity: isSelected ? 0.45 : config.fillOpacity,
                      strokeWidth: isSelected ? 3 : config.strokeWidth,
                    }}
                    transition={{ duration: 0.15 }}
                  />

                  {/* Classification Accent Strip */}
                  <rect
                    x={bay.x + 3}
                    y={bay.y + 3}
                    width={bay.width - 6}
                    height="3.5"
                    rx="1.5"
                    fill={bay.type === 'visitor' ? '#38bdf8' : '#94a3b8'}
                    fillOpacity={0.75}
                  />

                  {/* Bay Identifier Label */}
                  <text
                    x={bay.x + bay.width / 2}
                    y={bay.y + bay.height / 2 + 4.5}
                    fill={isSelected ? '#ffffff' : '#f8fafc'}
                    fontSize="11.5"
                    fontWeight="800"
                    fontFamily="monospace"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {bay.label}
                  </text>
                </g>
              );
            })}
          </g>
        </motion.svg>
      </div>

      {/* Footer Legend */}
      <div className="p-2.5 bg-slate-900/95 border-t border-slate-800 grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-slate-400">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-400" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-sky-400" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};
