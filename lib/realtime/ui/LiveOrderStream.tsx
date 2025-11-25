// =====================================================================
// CHAPTER 11: Live Order Stream Component
// =====================================================================

'use client';

import { useEffect, useRef } from 'react';
import { getEventBus, type RealtimeEvent } from '../engine/eventBus';
import { NeonCard } from '@/components/ui/NeonCard';

interface LiveOrderStreamProps {
  strategyId?: string;
  maxEvents?: number;
  className?: string;
}

export function LiveOrderStream({
  strategyId,
  maxEvents = 50,
  className = '',
}: LiveOrderStreamProps) {
  const [events, setEvents] = React.useState<RealtimeEvent[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventBus = getEventBus();
    const eventTypes: Array<RealtimeEvent['type']> = [
      'ENTER_SIGNAL',
      'EXIT_SIGNAL',
      'RULE_TRIGGERED',
      'RISK_ALERT',
      'PNL_UPDATE',
    ];

    const unsubscribes = eventTypes.map(eventType => {
      return eventBus.on(eventType, (event) => {
        if (!strategyId || event.strategyId === strategyId) {
          setEvents(prev => [...prev.slice(-(maxEvents - 1)), event]);
        }
      });
    });

    // Auto-scroll to bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [strategyId, maxEvents]);

  const formatEvent = (event: RealtimeEvent): string => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const symbol = event.symbol || 'N/A';
    
    switch (event.type) {
      case 'ENTER_SIGNAL':
        return `[${time}] ${symbol} → ENTER ${event.data.direction.toUpperCase()} @ $${event.data.price}`;
      case 'EXIT_SIGNAL':
        return `[${time}] ${symbol} → EXIT ${event.data.direction.toUpperCase()} @ $${event.data.price}`;
      case 'RULE_TRIGGERED':
        return `[${time}] ${symbol} → Rule triggered: ${event.data.message || 'N/A'}`;
      case 'RISK_ALERT':
        return `[${time}] ${symbol} → ⚠️ RISK: ${event.data.message || 'N/A'}`;
      case 'PNL_UPDATE':
        return `[${time}] ${symbol} → PnL: $${event.data.unrealizedPnL?.toFixed(2) || '0.00'}`;
      default:
        return `[${time}] ${event.type}`;
    }
  };

  return (
    <NeonCard className={className}>
      <h3 className="text-sm font-display font-semibold text-white mb-3">
        Live Event Stream
      </h3>
      <div
        ref={containerRef}
        className="h-64 overflow-y-auto bg-[#0B0B0C] border border-[#1e1f22] rounded p-3 font-mono text-xs space-y-1"
      >
        {events.length === 0 ? (
          <div className="text-[#A9A9B3]">No events yet...</div>
        ) : (
          events.map((event, idx) => (
            <div
              key={idx}
              className={`
                ${
                  event.type === 'ENTER_SIGNAL'
                    ? 'text-[#7CFF4F]'
                    : event.type === 'EXIT_SIGNAL'
                    ? 'text-blue-400'
                    : event.type === 'RISK_ALERT'
                    ? 'text-red-400'
                    : 'text-[#A9A9B3]'
                }
              `}
            >
              {formatEvent(event)}
            </div>
          ))
        )}
      </div>
    </NeonCard>
  );
}

// Fix: Add missing import
import * as React from 'react';

