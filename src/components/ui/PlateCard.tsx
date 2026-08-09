import React from 'react';

interface PlateCardProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Realistic NZ-style number plate.
 * Always white background + black text + blue NZ top-stripe, regardless of theme.
 * Non-selectable to feel native.
 */
export const PlateCard: React.FC<PlateCardProps> = ({ plate, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 text-[13px] px-2 min-w-[74px] rounded-[4px]',
    md: 'h-7 text-sm px-2.5 min-w-[92px] rounded-[5px]',
    lg: 'h-9 text-base px-4 min-w-[130px] rounded-md',
  };
  const stripeHeights = { sm: 'h-[3px]', md: 'h-[3.5px]', lg: 'h-1' };
  const crownSizes = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-2.5 h-2.5' };

  return (
    <div
      className={`relative inline-flex flex-col select-none bg-white border border-black/40 shadow-sm ${sizeClasses[size]} ${className}`}
      aria-label={`Vehicle registration ${plate}`}
    >
      {/* NZ top stripe */}
      <div className={`w-full ${stripeHeights[size]} bg-[#1e3a8a] flex items-center justify-center`}>
        <div className={`${crownSizes[size]} rounded-full border border-white/70`} />
      </div>
      {/* Plate text */}
      <div className="flex-1 flex items-center justify-center px-1">
        <span
          className="font-mono font-black text-black tracking-[0.14em] leading-none"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {plate}
        </span>
      </div>
    </div>
  );
};
