import React from 'react';

interface PlateCardProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlateCard: React.FC<PlateCardProps> = ({ plate, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 min-w-[70px]',
    md: 'text-sm px-3 py-1 min-w-[90px]',
    lg: 'text-lg px-4 py-1.5 min-w-[120px]',
  };

  return (
    <div className={`rego-plate rego-plate-nz ${sizeClasses[size]} ${className}`}>
      <span className="pl-2 tracking-wider font-mono font-bold text-slate-900">{plate}</span>
    </div>
  );
};
