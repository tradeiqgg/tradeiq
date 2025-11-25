// =====================================================================
// CHAPTER 11: Live Status Badge Component
// =====================================================================

'use client';

export type ConnectionStatus = 'live' | 'delayed' | 'disconnected' | 'unstable';

interface LiveStatusBadgeProps {
  status: ConnectionStatus;
  className?: string;
}

export function LiveStatusBadge({ status, className = '' }: LiveStatusBadgeProps) {
  const statusConfig = {
    live: {
      label: 'LIVE',
      color: 'bg-[#7CFF4F] text-[#0B0B0C]',
      pulse: true,
    },
    delayed: {
      label: 'DELAYED',
      color: 'bg-yellow-500 text-[#0B0B0C]',
      pulse: false,
    },
    disconnected: {
      label: 'DISCONNECTED',
      color: 'bg-red-500 text-white',
      pulse: false,
    },
    unstable: {
      label: 'UNSTABLE',
      color: 'bg-orange-500 text-white',
      pulse: true,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold
        ${config.color}
        ${config.pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          status === 'live' ? 'bg-[#0B0B0C]' : 'bg-white'
        }`}
      />
      {config.label}
    </div>
  );
}

