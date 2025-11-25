'use client';

import { useState } from 'react';
import { NeonCard } from './ui/NeonCard';
import { NeonButton } from './ui/NeonButton';

interface LiveDevStreamProps {
  streamUrl?: string;
  className?: string;
}

export function LiveDevStream({ streamUrl, className = '' }: LiveDevStreamProps) {
  const [iframeError, setIframeError] = useState(false);

  // PumpFun coin page URL
  const defaultStreamUrl = streamUrl || 'https://pump.fun/coin/DtTkSnfUC2cTFWLjR53R94J4968yBd6qxsznvNhEpump';

  return (
    <NeonCard className={`${className} h-full flex flex-col`}>
      <div className="space-y-4 flex flex-col flex-1">
        <div>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            Live Dev Stream (PumpFun)
          </h3>
          <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
            Watch the $IQ developer build in public—live coding, audits, features, and upgrades happening 24/7.
          </p>
        </div>

        {/* Stream Embed or Placeholder */}
        <div className="relative w-full flex-1 bg-[#0B0B0C] border border-[#1e1f22] rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
          {!iframeError && defaultStreamUrl ? (
            <iframe
              src={defaultStreamUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              onError={() => setIframeError(true)}
              title="Live Dev Stream"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 border-2 border-[#7CFF4F]/40 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <span className="text-2xl">📺</span>
              </div>
              <p className="text-sm text-[#A9A9B3] font-sans mb-4">
                Stream will appear here when live
              </p>
              <NeonButton
                href={defaultStreamUrl}
                variant="primary"
                size="md"
                className="mt-2"
              >
                ▶ Watch Live
              </NeonButton>
            </div>
          )}
        </div>

        {/* Watch Live Button */}
        <div className="flex items-center justify-between pt-2">
          <NeonButton
            href={defaultStreamUrl}
            variant="primary"
            size="md"
            className="flex items-center gap-2"
          >
            <span>▶</span>
            <span>Watch Live</span>
          </NeonButton>
          <p className="text-xs text-[#6f7177] font-sans">
            All development is transparent.
          </p>
        </div>
      </div>
    </NeonCard>
  );
}

