'use client';

import { useState, useEffect } from 'react';

interface IDEBetaBannerProps {
  streamUrl?: string;
}

export function IDEBetaBanner({ streamUrl }: IDEBetaBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('ide-beta-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('ide-beta-banner-dismissed', 'true');
  };

  // PumpFun coin page URL
  const defaultStreamUrl = streamUrl || 'https://pump.fun/coin/DtTkSnfUC2cTFWLjR53R94J4968yBd6qxsznvNhEpump';

  if (isDismissed) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-[#111214] border-b border-[#7CFF4F]/40 shadow-[0_0_20px_rgba(124,255,79,0.1)]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Beta Pill + Message */}
        <div className="flex items-center gap-3 flex-1">
          <span className="px-2 py-1 bg-[#7CFF4F] text-[#0B0B0C] text-xs font-sans font-bold rounded uppercase">
            Beta
          </span>
          <p className="text-sm text-[#A9A9B3] font-sans">
            TradeIQ is currently in open beta. AI bots, indicators, and backtesting are being built live on stream. Features may be unavailable or incomplete.
          </p>
        </div>

        {/* Right: Watch Live Button + Dismiss */}
        <div className="flex items-center gap-3">
          <a
            href={defaultStreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#7CFF4F] text-[#0B0B0C] text-sm font-sans font-semibold rounded-md hover:bg-[#70e84b] transition-colors flex items-center gap-2"
          >
            <span>▶</span>
            <span>Watch Live</span>
          </a>
          <button
            onClick={handleDismiss}
            className="text-[#6f7177] hover:text-[#A9A9B3] transition-colors p-1"
            aria-label="Dismiss banner"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

