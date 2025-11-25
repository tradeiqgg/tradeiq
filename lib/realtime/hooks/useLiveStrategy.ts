// =====================================================================
// CHAPTER 11: useLiveStrategy Hook
// =====================================================================

import { useState, useEffect, useRef } from 'react';
import { getLiveStrategyRunner, type LiveStrategyState } from '../engine/liveStrategyRunner';
import { getEventBus, type RealtimeEventType, type RealtimeEvent } from '../engine/eventBus';
import { useLivePrice } from './useLivePrice';
import type { TQJSSchema } from '@/lib/tql/schema';
import type { Strategy } from '@/types';

export interface UseLiveStrategyResult {
  state: LiveStrategyState | null;
  isRunning: boolean;
  error: Error | null;
  start: () => void;
  stop: () => void;
  events: RealtimeEvent[];
}

// Convert Strategy to TQJSSchema
function getStrategySchema(strategy: TQJSSchema | Strategy | null): TQJSSchema | null {
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
}

export function useLiveStrategy(
  strategy: TQJSSchema | Strategy | null,
  enabled = true
): UseLiveStrategyResult {
  const strategySchema = getStrategySchema(strategy);
  const [state, setState] = useState<LiveStrategyState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const runnerRef = useRef<ReturnType<typeof getLiveStrategyRunner> | null>(null);
  const eventUnsubscribesRef = useRef<Array<() => void>>([]);

  // Subscribe to price feed - guard against undefined settings
  const symbol = strategySchema?.settings?.symbol ?? 'BTCUSDT';
  const timeframe = strategySchema?.settings?.timeframe ?? '1h';
  const { candle } = useLivePrice(
    symbol,
    timeframe,
    'crypto',
    enabled && isRunning
  );

  useEffect(() => {
    if (!strategySchema || !enabled) {
      return;
    }

    try {
      const runner = getLiveStrategyRunner(strategySchema);
      runnerRef.current = runner;

      // Subscribe to events
      const eventBus = getEventBus();
      const eventTypes: RealtimeEventType[] = [
        'PRICE_UPDATE',
        'INDICATOR_UPDATE',
        'RULE_TRIGGERED',
        'ENTER_SIGNAL',
        'EXIT_SIGNAL',
        'RISK_ALERT',
        'PNL_UPDATE',
        'HEARTBEAT',
      ];

      const unsubscribes = eventTypes.map(eventType => {
        return eventBus.on(eventType, (event) => {
          if (event.strategyId === strategySchema.meta.name) {
            setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
            
            // Update state on PnL updates
            if (event.type === 'PNL_UPDATE') {
              const runnerState = runner.getState();
              setState(runnerState);
            }
          }
        });
      });

      eventUnsubscribesRef.current = unsubscribes;

      // Update state periodically
      const stateInterval = setInterval(() => {
        const runnerState = runner.getState();
        setState(runnerState);
      }, 1000);

      return () => {
        unsubscribes.forEach(unsub => unsub());
        clearInterval(stateInterval);
      };
    } catch (err) {
      setError(err as Error);
    }
  }, [strategySchema, enabled]);

  // Process new candles
  useEffect(() => {
    if (candle && runnerRef.current && isRunning) {
      runnerRef.current.onNewCandle(candle);
    }
  }, [candle, isRunning]);

  const start = () => {
    if (runnerRef.current && strategySchema) {
      runnerRef.current.start();
      setIsRunning(true);
      const runnerState = runnerRef.current.getState();
      setState(runnerState);
    }
  };

  const stop = () => {
    if (runnerRef.current) {
      runnerRef.current.stop();
      setIsRunning(false);
    }
  };

  return {
    state,
    isRunning,
    error,
    start,
    stop,
    events,
  };
}

