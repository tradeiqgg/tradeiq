'use client';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-wide text-white mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#A9A9B3] font-sans text-base md:text-lg max-w-2xl mb-6 leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="h-[2px] w-20 bg-gradient-to-r from-[#7CFF4F] via-[#7CFF4F]/50 to-transparent" />
    </div>
  );
}

