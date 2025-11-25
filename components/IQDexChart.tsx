'use client';

import { useState } from 'react';
import { NeonCard } from './ui/NeonCard';

interface IQDexChartProps {
  tokenCA?: string;
  className?: string;
}

export function IQDexChart({ tokenCA, className = '' }: IQDexChartProps) {
  const [iframeError, setIframeError] = useState(false);

  // Default token contract address - $IQ token CA
  const defaultTokenCA = tokenCA || 'DtTkSnfUC2cTFWLjR53R94J4968yBd6qxsznvNhEpump';
  
  // DEX Screener embed URL format
  // Example: https://dexscreener.com/solana/{tokenCA}?embed=1&theme=dark
  const dexScreenerUrl = `https://dexscreener.com/solana/${defaultTokenCA}?embed=1&theme=dark`;

  return (
    <NeonCard className={`${className} border-[#7CFF4F]/30 shadow-[0_0_30px_rgba(124,255,79,0.15)] h-full flex flex-col`}>
      <div className="space-y-4 flex flex-col flex-1">
        <div>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            Live $IQ Chart (DEX Screener)
          </h3>
        </div>

        {/* Chart Embed */}
        <div className="relative w-full flex-1" style={{ minHeight: '500px' }}>
          {!iframeError ? (
            <iframe
              src={dexScreenerUrl}
              className="w-full h-full rounded-lg border border-[#1e1f22]"
              style={{ minHeight: '500px', border: '1px solid rgba(124, 255, 79, 0.2)' }}
              allow="clipboard-read; clipboard-write"
              onError={() => setIframeError(true)}
              title="DEX Screener Chart"
            />
          ) : (
            <div className="w-full h-[500px] bg-[#0B0B0C] border border-[#7CFF4F]/30 rounded-lg flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 border-2 border-[#7CFF4F]/40 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm text-[#A9A9B3] font-sans mb-2">
                Chart will load here
              </p>
              <p className="text-xs text-[#6f7177] font-sans">
                Provide token contract address to view live chart
              </p>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <div className="pt-2 border-t border-[#1e1f22]">
          <p className="text-xs text-[#6f7177] font-sans text-center">
            Synced in real-time • Always visible
          </p>
        </div>
      </div>
    </NeonCard>
  );
}

