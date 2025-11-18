'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface NeonButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function NeonButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: NeonButtonProps) {
  const baseStyles = 'font-sans font-semibold transition-all duration-200 rounded-md';
  
  const variantStyles = {
    primary: 'bg-[#7CFF4F] text-[#0A0A0A] hover:bg-[#70e84b] hover:shadow-lg hover:shadow-[#7CFF4F]/30 neon-text-subtle',
    secondary: 'border border-[#1e1f22] text-white bg-transparent hover:border-[#7CFF4F]/40 hover:bg-[#151618] hover:shadow-[0_0_10px_rgba(124,255,79,0.1)]',
    outline: 'border border-[#1e1f22] text-white bg-transparent hover:border-[#7CFF4F]/40 hover:bg-[#151618] hover:shadow-[0_0_10px_rgba(124,255,79,0.1)]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  if (href && !disabled) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={styles}>
      {children}
    </button>
  );
}

