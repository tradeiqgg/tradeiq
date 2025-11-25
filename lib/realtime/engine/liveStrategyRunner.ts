// =====================================================================
// CHAPTER 11: Live Strategy Runner
// =====================================================================

import type { TQJSSchema } from '@/lib/tql/schema';
import type { Candle } from '../feeds/binanceFeed';
import { getLiveIndicatorEngine } from '../indicators/liveIndicatorEngine';
import { getEventBus, type RealtimeEvent } from './eventBus';
import { strategyEvaluationLimiter } from './rateLimiter';
import { evaluateStrategyOnCandle } from '@/lib/backtester/executionEngine';
import { applyRisk } from '@/lib/backtester/riskEngine';
import { updatePNL } from '@/lib/backtester/pnlEngine';
import type { StrategyRuntimeState } from '@/lib/backtester/types';

export interface LiveStrategyState {
  position: StrategyRuntimeState['position'];
  balance: number;
  equity: number;
  openTrades: StrategyRuntimeState['openTrades'];
  closedTrades: StrategyRuntimeState['closedTrades'];
  unrealizedPnL: number;
  maxDrawdown: number;
  peakEquity: number;
  logs: string[];
  lastEvaluation: {
    timestamp: number;
    signals: Array<{ type: 'entry' | 'exit'; direction: string; reason: string }>;
  } | null;
}

export class LiveStrategyRunner {
  private strategy: TQJSSchema;
  private state: LiveStrategyState;
  private symbol: string;
  private interval: string;
  private isRunning = false;
  private evaluationKey: string;

  constructor(strategy: TQJSSchema) {
    this.strategy = strategy;
    this.symbol = strategy.settings.symbol;
    this.interval = strategy.settings.timeframe;
    this.evaluationKey = `strategy-${strategy.meta.name}-${Date.now()}`;

    // Initialize state
    this.state = {
      position: null,
      balance: strategy.settings.initial_balance || 1000,
      equity: strategy.settings.initial_balance || 1000,
      openTrades: [],
      closedTrades: [],
      unrealizedPnL: 0,
      maxDrawdown: 0,
      peakEquity: strategy.settings.initial_balance || 1000,
      logs: [],
      lastEvaluation: null,
    };
  }

  /**
   * Start live evaluation
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const indicatorEngine = getLiveIndicatorEngine();
    const eventBus = getEventBus();

    // Register all strategy indicators
    for (const indicator of this.strategy.indicators || []) {
      indicatorEngine.registerIndicator(
        this.symbol,
        this.interval,
        indicator.indicator as any,
        indicator.params || {}
      );
    }

    // Subscribe to indicator updates
    for (const indicator of this.strategy.indicators || []) {
      indicatorEngine.subscribe(
        this.symbol,
        this.interval,
        indicator.indicator as any,
        indicator.params || {},
        (indicatorValue) => {
          // On indicator update, re-evaluate strategy if we have a recent candle
          this.evaluateOnIndicatorUpdate();
        }
      );
    }

    // Emit start event
    eventBus.emit({
      type: 'HEARTBEAT',
      timestamp: Date.now(),
      data: { status: 'started', strategyId: this.strategy.meta.name },
      strategyId: this.strategy.meta.name,
      symbol: this.symbol,
    });

    console.log(`[LiveStrategyRunner] Started: ${this.strategy.meta.name}`);
  }

  /**
   * Stop live evaluation
   */
  stop(): void {
    this.isRunning = false;
    const eventBus = getEventBus();

    eventBus.emit({
      type: 'HEARTBEAT',
      timestamp: Date.now(),
      data: { status: 'stopped', strategyId: this.strategy.meta.name },
      strategyId: this.strategy.meta.name,
      symbol: this.symbol,
    });

    console.log(`[LiveStrategyRunner] Stopped: ${this.strategy.meta.name}`);
  }

  /**
   * Process a new candle
   */
  onNewCandle(candle: Candle): void {
    if (!this.isRunning) {
      return;
    }

    // Rate limiting
    if (!strategyEvaluationLimiter.isAllowed(this.evaluationKey)) {
      return;
    }

    this.evaluateStrategy(candle);
  }

  /**
   * Evaluate strategy on indicator update
   */
  private evaluateOnIndicatorUpdate(): void {
    if (!this.isRunning) {
      return;
    }

    // Get latest candle from indicator engine cache
    const indicatorEngine = getLiveIndicatorEngine();
    const cache = (indicatorEngine as any).caches.get(`${this.symbol}-${this.interval}`);
    
    if (!cache || cache.candles.length === 0) {
      return;
    }

    const latestCandle = cache.candles[cache.candles.length - 1];
    this.evaluateStrategy(latestCandle);
  }

  /**
   * Evaluate strategy rules
   */
  private evaluateStrategy(candle: Candle): void {
    const indicatorEngine = getLiveIndicatorEngine();
    const eventBus = getEventBus();

    try {
      // Get indicator values
      const indicators: Record<string, any> = {};
      for (const indicator of this.strategy.indicators || []) {
        const value = indicatorEngine.getIndicatorValue(
          this.symbol,
          this.interval,
          indicator.indicator as any,
          indicator.params || {}
        );
        
        if (value && value.value !== null) {
          indicators[indicator.id] = value.value;
        }
      }

      // Convert candle to backtester format
      const backtestCandle = {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        time: candle.timestamp,
      };

      // Convert state to backtester format
      const runtimeState: StrategyRuntimeState = {
        position: this.state.position,
        balance: this.state.balance,
        equity: this.state.equity,
        openTrades: this.state.openTrades,
        closedTrades: this.state.closedTrades,
        indicatorCache: indicators as any,
        lastCandle: backtestCandle,
        currentCandleIndex: 0,
        maxDrawdown: this.state.maxDrawdown,
        peakEquity: this.state.peakEquity,
        consecutiveLosses: 0,
        dailyTrades: 0,
        dailyPnL: 0,
        logs: [],
      };

      // Update PnL
      updatePNL(runtimeState, backtestCandle);

      // Apply risk management
      const riskActions = applyRisk(runtimeState, backtestCandle, this.strategy);
      for (const action of riskActions) {
        if (action.closePosition && runtimeState.position) {
          this.closePosition(backtestCandle.close, action.message);
          eventBus.emit({
            type: 'RISK_ALERT',
            timestamp: Date.now(),
            data: { message: action.message, action },
            strategyId: this.strategy.meta.name,
            symbol: this.symbol,
          });
        }
      }

      // Evaluate strategy rules
      const executionResult = evaluateStrategyOnCandle(
        runtimeState,
        backtestCandle,
        indicators,
        this.strategy
      );

      // Update state
      this.state.position = runtimeState.position;
      this.state.balance = runtimeState.balance;
      this.state.equity = runtimeState.equity;
      this.state.openTrades = runtimeState.openTrades;
      this.state.closedTrades = runtimeState.closedTrades;
      this.state.unrealizedPnL = runtimeState.equity - runtimeState.balance;
      this.state.maxDrawdown = runtimeState.maxDrawdown;
      this.state.peakEquity = runtimeState.peakEquity;
      this.state.logs.push(...executionResult.logs);

      // Extract signals
      const signals: Array<{ type: 'entry' | 'exit'; direction: string; reason: string }> = [];
      
      if (executionResult.newState.position && !this.state.position) {
        // Entry signal
        signals.push({
          type: 'entry',
          direction: executionResult.newState.position.direction,
          reason: 'Strategy rule triggered',
        });
        
        eventBus.emit({
          type: 'ENTER_SIGNAL',
          timestamp: Date.now(),
          data: {
            direction: executionResult.newState.position.direction,
            price: backtestCandle.close,
          },
          strategyId: this.strategy.meta.name,
          symbol: this.symbol,
        });
      } else if (!executionResult.newState.position && this.state.position) {
        // Exit signal
        signals.push({
          type: 'exit',
          direction: this.state.position.direction,
          reason: 'Strategy rule triggered',
        });
        
        eventBus.emit({
          type: 'EXIT_SIGNAL',
          timestamp: Date.now(),
          data: {
            direction: this.state.position.direction,
            price: backtestCandle.close,
          },
          strategyId: this.strategy.meta.name,
          symbol: this.symbol,
        });
      }

      // Update last evaluation
      this.state.lastEvaluation = {
        timestamp: Date.now(),
        signals,
      };

      // Emit PnL update
      eventBus.emit({
        type: 'PNL_UPDATE',
        timestamp: Date.now(),
        data: {
          balance: this.state.balance,
          equity: this.state.equity,
          unrealizedPnL: this.state.unrealizedPnL,
          maxDrawdown: this.state.maxDrawdown,
        },
        strategyId: this.strategy.meta.name,
        symbol: this.symbol,
      });

      // Emit price update
      eventBus.emit({
        type: 'PRICE_UPDATE',
        timestamp: Date.now(),
        data: { candle: backtestCandle },
        strategyId: this.strategy.meta.name,
        symbol: this.symbol,
      });
    } catch (error) {
      console.error(`[LiveStrategyRunner] Evaluation error:`, error);
      eventBus.emit({
        type: 'RISK_ALERT',
        timestamp: Date.now(),
        data: { message: `Evaluation error: ${error}`, level: 'error' },
        strategyId: this.strategy.meta.name,
        symbol: this.symbol,
      });
    }
  }

  /**
   * Close current position
   */
  private closePosition(price: number, reason: string): void {
    if (!this.state.position) {
      return;
    }

    const pnl = this.state.position.direction === 'long'
      ? (price - this.state.position.entryPrice) * this.state.position.size
      : (this.state.position.entryPrice - price) * this.state.position.size;

    this.state.balance += pnl;
    this.state.equity = this.state.balance;
    this.state.unrealizedPnL = 0;

    const size = this.state.position.size || 1;
    const profit = pnl;
    const returnPct = this.state.position.entryPrice !== 0 
      ? (profit / (this.state.position.entryPrice * size)) * 100 
      : 0;
    
    this.state.closedTrades.push({
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryPrice: this.state.position.entryPrice,
      exitPrice: price,
      entryTime: this.state.position.entryTime,
      exitTime: Date.now(),
      size,
      direction: this.state.position.direction,
      profit,
      returnPct,
      reason,
    });

    this.state.position = null;
  }

  /**
   * Get current state
   */
  getState(): LiveStrategyState {
    return { ...this.state };
  }

  /**
   * Update strategy
   */
  updateStrategy(strategy: TQJSSchema): void {
    const wasRunning = this.isRunning;
    if (wasRunning) {
      this.stop();
    }

    this.strategy = strategy;
    this.symbol = strategy.settings.symbol;
    this.interval = strategy.settings.timeframe;

    if (wasRunning) {
      this.start();
    }
  }
}

// Runner registry
const runners = new Map<string, LiveStrategyRunner>();

export function getLiveStrategyRunner(strategy: TQJSSchema): LiveStrategyRunner {
  const key = strategy.meta.name;
  
  if (!runners.has(key)) {
    runners.set(key, new LiveStrategyRunner(strategy));
  }

  return runners.get(key)!;
}

export function stopLiveStrategyRunner(strategyName: string): void {
  const runner = runners.get(strategyName);
  if (runner) {
    runner.stop();
    runners.delete(strategyName);
  }
}

