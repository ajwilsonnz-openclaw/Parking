import React from 'react';

interface PlateCardProps {
  plate: string;
  size?: 'micro' | 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showScrews?: boolean;
}

/**
 * Photorealistic New Zealand License Plate (NZ Transport Agency standard style).
 * - Reflective off-white embossed aluminum plate
 * - Crisp black embossed border with rounded corners
 * - Bold, high-contrast NZ plate typography (letter-spaced and embossed)
 * - Corner mounting screw rivets
 */
export const PlateCard: React.FC<PlateCardProps> = ({
  plate,
  size = 'md',
  className = '',
  showScrews = false,
}) => {
  // Format clean plate string (e.g. 'HZZ 303' or 'NZ VIP7')
  const cleanPlate = (plate || 'PLATE').trim().toUpperCase();

  const sizeConfigs = {
    micro: {
      container: 'h-[15px] min-w-[38px] px-1 py-0 rounded-[2.5px] border-[1px]',
      text: 'text-[7.5px] tracking-[0.14em] font-black',
      screw: 'w-[1.5px] h-[1.5px]',
    },
    xs: {
      container: 'h-5 min-w-[54px] px-1.5 py-0 rounded-[3px] border-[1.2px]',
      text: 'text-[9.5px] tracking-[0.16em] font-black',
      screw: 'w-0.5 h-0.5',
    },
    sm: {
      container: 'h-6 min-w-[70px] px-2 py-0.5 rounded-[3.5px] border-[1.5px]',
      text: 'text-xs tracking-[0.16em] font-black',
      screw: 'w-1 h-1',
    },
    md: {
      container: 'h-7 min-w-[88px] px-2.5 py-0.5 rounded-[4px] border-[1.5px]',
      text: 'text-sm tracking-[0.18em] font-black',
      screw: 'w-1 h-1',
    },
    lg: {
      container: 'h-9 min-w-[118px] px-3.5 py-1 rounded-[5px] border-[2px]',
      text: 'text-base tracking-[0.2em] font-black',
      screw: 'w-1.5 h-1.5',
    },
  };

  const config = sizeConfigs[size] || sizeConfigs.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none bg-[#F6F7F9] border-[#18181B] shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.25)] ${config.container} ${className}`}
      aria-label={`NZ Vehicle Registration ${cleanPlate}`}
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F3F5 50%, #E5E7EB 100%)',
      }}
    >
      {/* Optional Top Screw Rivets */}
      {showScrews && (
        <>
          <span
            className={`absolute top-0.5 left-1 rounded-full bg-[#71717A] border border-black/40 shadow-inner ${config.screw}`}
          />
          <span
            className={`absolute top-0.5 right-1 rounded-full bg-[#71717A] border border-black/40 shadow-inner ${config.screw}`}
          />
          <span
            className={`absolute bottom-0.5 left-1 rounded-full bg-[#71717A] border border-black/40 shadow-inner ${config.screw}`}
          />
          <span
            className={`absolute bottom-0.5 right-1 rounded-full bg-[#71717A] border border-black/40 shadow-inner ${config.screw}`}
          />
        </>
      )}

      {/* Plate Registration Number */}
      <span
        className={`font-mono text-[#09090B] uppercase leading-none drop-shadow-[0_0.5px_0_rgba(255,255,255,0.8)] ${config.text}`}
        style={{
          fontFeatureSettings: '"tnum"',
        }}
      >
        {cleanPlate}
      </span>
    </div>
  );
};
