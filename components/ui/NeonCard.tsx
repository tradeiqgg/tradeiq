'use client';

import { ReactNode } from 'react';

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function NeonCard({ children, className = '', hover = true, style, onClick }: NeonCardProps) {
  return (
    <div
      className={`
        bg-[#111214] border border-[#1e1f22] rounded-lg p-6
        ${hover ? 'transition-all duration-300 hover:border-[#7CFF4F]/40 hover:bg-[#151618] hover:shadow-[0_0_20px_rgba(124,255,79,0.12)] hover:neon-glow-subtle' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

