'use client';

import Link from 'next/link';
import { PUMPFUN_URL } from '@/lib/config';

export function LivestreamMarquee() {
  return (
    <div className="w-full bg-[#7CFF4F] text-black font-mono py-2 overflow-hidden border-b-2 border-black sticky top-0 z-[10000]">
      <div className="whitespace-nowrap animate-[marqueeScroll_15s_linear_infinite] font-bold tracking-wide">
        <Link 
          href={PUMPFUN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:underline"
        >
          🚀 TradeIQ.gg Live Pump.Fun Launch — Watch the developer code the AI IDE LIVE — Click Here →
        </Link>
      </div>
    </div>
  );
}

