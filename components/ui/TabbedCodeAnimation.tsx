'use client';

import { useState, useEffect } from 'react';
import { TypingText } from './TypingText';
import { ScratchBlockBuilder } from './ScratchBlockBuilder';

type TabType = 'pseudocode' | 'blocks' | 'json';

interface TabbedCodeAnimationProps {
  className?: string;
}

export function TabbedCodeAnimation({ className = '' }: TabbedCodeAnimationProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pseudocode');
  const [animationKey, setAnimationKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setAnimationKey((prev) => prev + 1); // Force re-animation
  };

  const pseudocodeExample = `IF price crosses above moving_average(20, 'SMA')
  AND volume > volume_average(14)
  AND rsi(14) < 70
THEN
  ENTER long position with 2% portfolio allocation
  SET stop_loss at price * 0.97
  SET take_profit at price * 1.05
  USE trailing_stop with 1.5% activation threshold
END IF

IF price crosses below moving_average(20, 'SMA')
  OR rsi(14) > 80
THEN
  EXIT all positions
  WAIT for 5 candles before re-entry
END IF`;

  const blocksExample = `[CONDITION BLOCK: Price Action]
  Price > Moving Average(20, SMA)
  AND Volume > Volume Average(14)
  AND RSI(14) < 70
  
[ACTION BLOCK: Entry]
  Position Size: 2% Portfolio
  Order Type: Market
  Side: Long
  
[RISK BLOCK: Stop Loss]
  Type: Percentage
  Value: 3%
  
[RISK BLOCK: Take Profit]
  Type: Percentage
  Value: 5%
  
[RISK BLOCK: Trailing Stop]
  Activation: 1.5%
  Trail Distance: 1.5%
  
[CONDITION BLOCK: Exit]
  Price < Moving Average(20, SMA)
  OR RSI(14) > 80
  
[ACTION BLOCK: Exit]
  Close All Positions
  Cooldown: 5 Candles`;

  const jsonExample = `{
  "strategy": {
    "name": "Advanced MA Cross with Volume Filter",
    "version": "2.0",
    "conditions": [
      {
        "type": "price_above_ma",
        "period": 20,
        "ma_type": "SMA",
        "operator": "crosses_above"
      },
      {
        "type": "volume_above_average",
        "period": 14,
        "operator": "greater_than"
      },
      {
        "type": "rsi",
        "period": 14,
        "operator": "less_than",
        "value": 70
      }
    ],
    "entry": {
      "type": "market",
      "side": "long",
      "position_size": {
        "type": "percentage",
        "value": 2.0
      }
    },
    "risk_management": {
      "stop_loss": {
        "type": "percentage",
        "value": 3.0
      },
      "take_profit": {
        "type": "percentage",
        "value": 5.0
      },
      "trailing_stop": {
        "enabled": true,
        "activation_threshold": 1.5,
        "trail_distance": 1.5
      }
    },
    "exit_conditions": [
      {
        "type": "price_below_ma",
        "period": 20,
        "ma_type": "SMA"
      },
      {
        "type": "rsi",
        "period": 14,
        "operator": "greater_than",
        "value": 80
      }
    ],
    "cooldown": {
      "enabled": true,
      "candles": 5
    }
  }
}`;

  const renderContent = () => {
    switch (activeTab) {
      case 'pseudocode':
        return (
          <div className="space-y-2">
            {pseudocodeExample.split('\n').map((line, idx) => {
              if (!line.trim()) return <div key={idx} className="h-2" />;
              const delay = idx * 50;
              return (
                <div key={idx} className="flex items-start">
                  <TypingText
                    text={line}
                    speed={20}
                    delay={delay}
                    className={
                      line.trim().startsWith('IF') || line.trim().startsWith('THEN') || line.trim().startsWith('END')
                        ? 'text-[#7CFF4F]'
                        : line.trim().startsWith('AND') || line.trim().startsWith('OR')
                        ? 'text-[#E7FF5C]'
                        : line.trim().startsWith('ENTER') || line.trim().startsWith('EXIT')
                        ? 'text-[#5CFF8C]'
                        : line.trim().startsWith('SET') || line.trim().startsWith('USE') || line.trim().startsWith('WAIT')
                        ? 'text-[#7CFF4F]'
                        : 'text-white'
                    }
                  />
                </div>
              );
            })}
          </div>
        );
      case 'blocks':
        return <ScratchBlockBuilder />;
      case 'json':
        return (
          <div className="space-y-1">
            {jsonExample.split('\n').map((line, idx) => {
              if (!line.trim()) return <div key={idx} className="h-1" />;
              const delay = idx * 30;
              const isKey = line.includes('"') && line.includes(':');
              const isString = line.includes('"') && !line.includes('{') && !line.includes('[');
              return (
                <div key={idx} className="flex items-start">
                  <TypingText
                    text={line}
                    speed={15}
                    delay={delay}
                    className={
                      isKey && !isString
                        ? 'text-[#7CFF4F]'
                        : isString
                        ? 'text-[#E7FF5C]'
                        : line.includes('true') || line.includes('false') || line.match(/\d+/)
                        ? 'text-[#5CFF8C]'
                        : 'text-white'
                    }
                  />
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className={`bg-[#111214] border border-[#1e1f22] rounded-lg overflow-hidden shadow-[0_0_15px_rgba(124,255,79,0.08)] ${className}`}>
      {/* Tab Switcher */}
      <div className="flex border-b border-[#1e1f22] bg-[#151618]">
        <button
          onClick={() => handleTabChange('pseudocode')}
          className={`flex-1 px-4 py-3 text-sm font-sans font-semibold transition-all ${
            activeTab === 'pseudocode'
              ? 'text-[#7CFF4F] border-b-2 border-[#7CFF4F] bg-[#111214]'
              : 'text-[#A9A9B3] hover:text-white hover:bg-[#111214]/50'
          }`}
        >
          Pseudocode
        </button>
        <button
          onClick={() => handleTabChange('blocks')}
          className={`flex-1 px-4 py-3 text-sm font-sans font-semibold transition-all ${
            activeTab === 'blocks'
              ? 'text-[#7CFF4F] border-b-2 border-[#7CFF4F] bg-[#111214]'
              : 'text-[#A9A9B3] hover:text-white hover:bg-[#111214]/50'
          }`}
        >
          Block Builder
        </button>
        <button
          onClick={() => handleTabChange('json')}
          className={`flex-1 px-4 py-3 text-sm font-sans font-semibold transition-all ${
            activeTab === 'json'
              ? 'text-[#7CFF4F] border-b-2 border-[#7CFF4F] bg-[#111214]'
              : 'text-[#A9A9B3] hover:text-white hover:bg-[#111214]/50'
          }`}
        >
          Advanced JSON
        </button>
      </div>

      {/* Code Content - Fixed Height Container */}
      <div className="h-[500px] flex flex-col">
        {activeTab === 'blocks' ? (
          <>
            <div className="flex-1 overflow-hidden">
              {renderContent()}
            </div>
            <div className="p-6 pt-2 font-mono text-xs md:text-sm flex-shrink-0">
              <div className="text-[#6f7177]">
                <span className="text-[#7CFF4F]">→ AI converts to executable trading logic</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 pb-2 font-mono text-xs md:text-sm flex-shrink-0">
              <div className="text-[#6f7177] mb-4">
                {activeTab === 'pseudocode' && '// Natural language strategy definition'}
                {activeTab === 'json' && '// Advanced JSON configuration for quant traders'}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 font-mono text-xs md:text-sm">
              <div key={animationKey} className="text-white space-y-1">
                {isMounted && renderContent()}
              </div>
            </div>
            <div className="p-6 pt-2 font-mono text-xs md:text-sm flex-shrink-0">
              <div className="text-[#6f7177]">
                {isMounted && (
                  <TypingText
                    text="→ AI converts to executable trading logic"
                    speed={30}
                    delay={activeTab === 'pseudocode' ? 3000 : 2000}
                    className="text-[#7CFF4F]"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

