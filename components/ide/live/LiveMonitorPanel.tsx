// =====================================================================
// CHAPTER 11: IDE Live Monitor Panel
// =====================================================================

'use client';

import { useState } from 'react';
import { useLiveStrategy } from '@/lib/realtime/hooks/useLiveStrategy';
import { LiveChart, LiveIndicatorOverlay, LiveOrderStream } from '@/lib/realtime/ui';
import { RiskAlertPanel } from '@/components/alerts/RiskAlertPanel';
import type { TQJSSchema } from '@/lib/tql/schema';
import type { Strategy } from '@/types';
import { NeonCard } from '@/components/ui/NeonCard';

interface LiveMonitorPanelProps {
  strategy: TQJSSchema | Strategy | null;
}

export function LiveMonitorPanel({ strategy }: LiveMonitorPanelProps) {
  const { state, isRunning, start, stop, events } = useLiveStrategy(strategy as TQJSSchema | null, true);
  const [activeTab, setActiveTab] = useState<'chart' | 'indicators' | 'logs' | 'stats' | 'alerts'>('chart');

  // Convert Strategy to TQJSSchema if needed
  const getStrategySchema = (): TQJSSchema | null => {
    if (!strategy) return null;
    
    // If already TQJSSchema, return as-is
    if ('meta' in strategy && 'settings' in strategy && 'rules' in strategy) {
      return strategy as TQJSSchema;
    }
    
    // Convert Strategy to TQJSSchema
    const s = strategy as Strategy;
    if (s.strategy_json) {
      return s.strategy_json as TQJSSchema;
    }
    if (s.json_logic) {
      return s.json_logic as TQJSSchema;
    }
    
    return null;
  };

  const strategySchema = getStrategySchema();

  if (!strategySchema) {
    return (
      <div className="p-6 text-center text-[#A9A9B3] font-sans">
        No strategy loaded. Please create or load a strategy first.
      </div>
    );
  }

  // Prepare indicator configs
  const indicatorConfigs = (strategySchema.indicators || []).map(ind => ({
    id: ind.id,
    indicatorId: ind.indicator as any,
    params: ind.params || {},
  }));

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Header */}
      <div className="border-b border-[#1e1f22] p-4 flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-white">
          Live Monitor
        </h2>
        <div className="flex items-center gap-3">
          {isRunning ? (
            <button
              onClick={stop}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-sans text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={start}
              className="px-4 py-2 bg-[#7CFF4F] text-[#0B0B0C] rounded-lg font-sans text-sm font-medium hover:bg-[#70e84b] transition-colors"
            >
              Start Live
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1e1f22] flex">
        {[
          { id: 'chart', label: 'Chart' },
          { id: 'indicators', label: 'Indicators' },
          { id: 'logs', label: 'Logs' },
          { id: 'stats', label: 'Stats' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              px-4 py-2 font-sans text-sm font-medium transition-colors
              border-b-2
              ${
                activeTab === tab.id
                  ? 'border-[#7CFF4F] text-[#7CFF4F]'
                  : 'border-transparent text-[#A9A9B3] hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'chart' && (
          <LiveChart
            symbol={strategySchema.settings?.symbol ?? 'BTCUSDT'}
            interval={strategySchema.settings?.timeframe ?? '1h'}
            type="crypto"
            height={400}
          />
        )}

        {activeTab === 'indicators' && (
          <LiveIndicatorOverlay
            symbol={strategySchema.settings?.symbol ?? 'BTCUSDT'}
            interval={strategySchema.settings?.timeframe ?? '1h'}
            indicators={indicatorConfigs}
          />
        )}

        {activeTab === 'logs' && (
          <LiveOrderStream strategyId={strategySchema.meta.name} maxEvents={100} />
        )}

        {activeTab === 'stats' && state && (
          <div className="grid grid-cols-2 gap-4">
            <NeonCard>
              <div className="text-sm text-[#A9A9B3] font-sans mb-1">Balance</div>
              <div className="text-2xl font-display font-bold text-[#7CFF4F]">
                ${state.balance.toFixed(2)}
              </div>
            </NeonCard>
            <NeonCard>
              <div className="text-sm text-[#A9A9B3] font-sans mb-1">Equity</div>
              <div className="text-2xl font-display font-bold text-[#7CFF4F]">
                ${state.equity.toFixed(2)}
              </div>
            </NeonCard>
            <NeonCard>
              <div className="text-sm text-[#A9A9B3] font-sans mb-1">Unrealized PnL</div>
              <div
                className={`text-2xl font-display font-bold ${
                  state.unrealizedPnL >= 0 ? 'text-[#7CFF4F]' : 'text-red-400'
                }`}
              >
                ${state.unrealizedPnL.toFixed(2)}
              </div>
            </NeonCard>
            <NeonCard>
              <div className="text-sm text-[#A9A9B3] font-sans mb-1">Max Drawdown</div>
              <div className="text-2xl font-display font-bold text-red-400">
                {state.maxDrawdown.toFixed(2)}%
              </div>
            </NeonCard>
            <NeonCard>
              <div className="text-sm text-[#A9A9B3] font-sans mb-1">Open Trades</div>
              <div className="text-2xl font-display font-bold text-white">
                {state.openTrades.length}
              </div>
            </NeonCard>
            <NeonCard>
              <div className="text-sm text-[#A9A9B3] font-sans mb-1">Closed Trades</div>
              <div className="text-2xl font-display font-bold text-white">
                {state.closedTrades.length}
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === 'alerts' && (
          <RiskAlertPanel strategyId={(strategy as Strategy).id || strategySchema.meta.name} />
        )}
      </div>
    </div>
  );
}

