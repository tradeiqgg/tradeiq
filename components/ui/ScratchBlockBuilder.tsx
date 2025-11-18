'use client';

import { useState, useEffect } from 'react';

export function ScratchBlockBuilder() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Scratch-style block colors
  const blockStyles = {
    condition: 'bg-[#4C97FF]', // Blue for conditions
    action: 'bg-[#59C059]', // Green for actions
    risk: 'bg-[#FF8C1A]', // Orange for risk
    connector: 'bg-[#FFBF00]', // Yellow for connectors
  };

  return (
    <div className="h-full flex flex-col bg-[#111214] border border-[#1e1f22] rounded-lg p-4 font-mono text-xs overflow-hidden">
      <div className="text-[#6f7177] mb-3 text-xs">{'// Visual block-based strategy builder'}</div>
      
      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {/* Condition Block */}
        <div className={`${blockStyles.condition} rounded-md p-2.5 shadow-md`}>
          <div className="text-white font-semibold mb-1.5 text-xs">CONDITION: Price Action</div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs flex items-center gap-1.5">
            Price <span className="bg-white/30 rounded px-1.5 py-0.5 text-xs">&gt;</span> MA <span className="bg-white/30 rounded px-1.5 py-0.5 text-xs">(20)</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs flex items-center gap-1.5">
            <span className="bg-white/30 rounded px-1.5 py-0.5">AND</span>
            Volume <span className="bg-white/30 rounded px-1.5 py-0.5">&gt;</span> Vol Avg <span className="bg-white/30 rounded px-1.5 py-0.5">(14)</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs flex items-center gap-1.5">
            <span className="bg-white/30 rounded px-1.5 py-0.5">AND</span>
            RSI <span className="bg-white/30 rounded px-1.5 py-0.5">(14)</span> <span className="bg-white/30 rounded px-1.5 py-0.5">&lt;</span> <span className="bg-white/30 rounded px-1.5 py-0.5">{'70'}</span>
          </div>
        </div>

        {/* Action Block - Entry */}
        <div className={`${blockStyles.action} rounded-md p-2.5 shadow-md`}>
          <div className="text-white font-semibold mb-1.5 text-xs">ACTION: Entry</div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs">
            Size: <span className="bg-white/30 rounded px-1.5 py-0.5">2%</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs">
            Type: <span className="bg-white/30 rounded px-1.5 py-0.5">Market</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs">
            Side: <span className="bg-white/30 rounded px-1.5 py-0.5">Long</span>
          </div>
        </div>

        {/* Risk Block - Stop Loss */}
        <div className={`${blockStyles.risk} rounded-md p-2.5 shadow-md`}>
          <div className="text-white font-semibold mb-1.5 text-xs">RISK: Stop Loss</div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs">
            Type: <span className="bg-white/30 rounded px-1.5 py-0.5">%</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs">
            Value: <span className="bg-white/30 rounded px-1.5 py-0.5">3%</span>
          </div>
        </div>

        {/* Risk Block - Take Profit */}
        <div className={`${blockStyles.risk} rounded-md p-2.5 shadow-md`}>
          <div className="text-white font-semibold mb-1.5 text-xs">RISK: Take Profit</div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs">
            Type: <span className="bg-white/30 rounded px-1.5 py-0.5">%</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs">
            Value: <span className="bg-white/30 rounded px-1.5 py-0.5">5%</span>
          </div>
        </div>

        {/* Risk Block - Trailing Stop */}
        <div className={`${blockStyles.risk} rounded-md p-2.5 shadow-md`}>
          <div className="text-white font-semibold mb-1.5 text-xs">RISK: Trailing</div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs">
            Activate: <span className="bg-white/30 rounded px-1.5 py-0.5">1.5%</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs">
            Trail: <span className="bg-white/30 rounded px-1.5 py-0.5">1.5%</span>
          </div>
        </div>

        {/* Condition Block - Exit */}
        <div className={`${blockStyles.condition} rounded-md p-2.5 shadow-md`}>
          <div className="text-white font-semibold mb-1.5 text-xs">CONDITION: Exit</div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs">
            Price <span className="bg-white/30 rounded px-1.5 py-0.5">&lt;</span> MA <span className="bg-white/30 rounded px-1.5 py-0.5">(20)</span>
          </div>
          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs flex items-center gap-1.5">
            <span className="bg-white/30 rounded px-1.5 py-0.5">OR</span>
            RSI <span className="bg-white/30 rounded px-1.5 py-0.5">(14)</span> <span className="bg-white/30 rounded px-1.5 py-0.5">&gt;</span> <span className="bg-white/30 rounded px-1.5 py-0.5">{'80'}</span>
          </div>
        </div>

        {/* Action Block - Exit */}
        <div className={`${blockStyles.action} rounded-md p-2.5 shadow-md`}>
          <div className="text-white font-semibold mb-1.5 text-xs">ACTION: Exit</div>
          <div className="bg-white/20 rounded px-2 py-1 mb-1 text-white text-xs">
            Close All
          </div>
          <div className="bg-white/20 rounded px-2 py-1 text-white text-xs">
            Cooldown: <span className="bg-white/30 rounded px-1.5 py-0.5">5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

