// =====================================================================
// CHAPTER 12: Risk Event Engine
// =====================================================================

import { getEventBus } from '../realtime/engine/eventBus';
import { createAlert } from './alertEngine';
import type { LiveStrategyState } from '../realtime/engine/liveStrategyRunner';

export interface RiskEvent {
  type: 'excessive_loss' | 'whipsaw' | 'unstable' | 'high_frequency' | 'volatility_change';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  data: Record<string, any>;
}

/**
 * Analyze strategy state for risk events
 */
export function analyzeRiskEvents(
  strategyId: string,
  userId: string,
  currentState: LiveStrategyState,
  previousState: LiveStrategyState | null
): RiskEvent[] {
  const events: RiskEvent[] = [];

  // Excessive loss detection
  if (currentState.maxDrawdown > 20) {
    events.push({
      type: 'excessive_loss',
      severity: currentState.maxDrawdown > 30 ? 'critical' : 'error',
      message: `Excessive drawdown detected: ${currentState.maxDrawdown.toFixed(2)}%`,
      data: { drawdown: currentState.maxDrawdown },
    });
  }

  // Whipsaw detection (rapid entry/exit)
  if (previousState) {
    const recentTrades = currentState.closedTrades.slice(-5);
    if (recentTrades.length >= 3) {
      const timeSpan = recentTrades[recentTrades.length - 1].exitTime - recentTrades[0].entryTime;
      const minutes = timeSpan / (1000 * 60);
      
      if (minutes < 10 && recentTrades.length >= 3) {
        events.push({
          type: 'whipsaw',
          severity: 'warning',
          message: 'Potential whipsaw detected: 3+ trades in under 10 minutes',
          data: { tradeCount: recentTrades.length, timeSpan: minutes },
        });
      }
    }
  }

  // Unstable behavior (high trade frequency)
  const tradeCount = currentState.closedTrades.length;
  if (tradeCount > 50) {
    events.push({
      type: 'high_frequency',
      severity: 'warning',
      message: `High trade frequency: ${tradeCount} trades`,
      data: { tradeCount },
    });
  }

  // Volatility spike detection (if we have price data)
  if (previousState && currentState.equity !== previousState.equity) {
    const equityChange = Math.abs(currentState.equity - previousState.equity);
    const equityChangePercent = (equityChange / previousState.equity) * 100;
    
    if (equityChangePercent > 5) {
      events.push({
        type: 'volatility_change',
        severity: 'warning',
        message: `Significant equity change: ${equityChangePercent.toFixed(2)}%`,
        data: { changePercent: equityChangePercent },
      });
    }
  }

  return events;
}

/**
 * Initialize risk event monitoring
 */
export function initializeRiskEventMonitoring(): void {
  const eventBus = getEventBus();

  // Monitor PnL updates for risk events
  eventBus.on('PNL_UPDATE', (event) => {
    if (event.data && event.strategyId) {
      // Risk analysis would be done here
      // For now, we rely on the alert engine to handle drawdown alerts
    }
  });

  console.log('[RiskEventEngine] Initialized');
}

