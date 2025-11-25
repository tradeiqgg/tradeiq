// =====================================================================
// CHAPTER 12: Alert Types Definitions
// =====================================================================

export type AlertType =
  // Strategy Signals
  | 'entry'
  | 'exit'
  | 'take_profit'
  | 'stop_loss'
  | 'trailing_stop'
  | 'position_closed'
  // Indicator Alerts
  | 'indicator_cross'
  | 'indicator_threshold'
  // Risk Alerts
  | 'risk'
  | 'max_drawdown'
  | 'max_daily_trades'
  | 'volatility_spike'
  | 'unexpected_behavior'
  // System Alerts
  | 'system'
  | 'competition_standing_changed'
  | 'strategy_version_updated'
  | 'followed_user_published';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  id: string;
  user_id: string;
  strategy_id?: string;
  type: AlertType;
  message: string;
  payload: Record<string, any>;
  created_at: string;
  read: boolean;
  severity: AlertSeverity;
}

export interface AlertPayload {
  // Entry/Exit signals
  direction?: 'long' | 'short';
  price?: number;
  reason?: string;
  
  // Indicator alerts
  indicator_id?: string;
  indicator_value?: number;
  threshold?: number;
  comparison?: 'above' | 'below' | 'cross';
  
  // Risk alerts
  drawdown?: number;
  trade_count?: number;
  volatility?: number;
  
  // System alerts
  competition_id?: string;
  rank?: number;
  user_id?: string;
  strategy_id?: string;
  
  // Generic
  [key: string]: any;
}

export const AlertTypeLabels: Record<AlertType, string> = {
  entry: 'Entry Signal',
  exit: 'Exit Signal',
  take_profit: 'Take Profit',
  stop_loss: 'Stop Loss',
  trailing_stop: 'Trailing Stop',
  position_closed: 'Position Closed',
  indicator_cross: 'Indicator Cross',
  indicator_threshold: 'Indicator Threshold',
  risk: 'Risk Alert',
  max_drawdown: 'Max Drawdown',
  max_daily_trades: 'Max Daily Trades',
  volatility_spike: 'Volatility Spike',
  unexpected_behavior: 'Unexpected Behavior',
  system: 'System Alert',
  competition_standing_changed: 'Competition Update',
  strategy_version_updated: 'Strategy Updated',
  followed_user_published: 'New Strategy Published',
};

export const AlertSeverityColors: Record<AlertSeverity, string> = {
  info: '#7CFF4F',
  warning: '#FFA500',
  error: '#FF4444',
  critical: '#FF0000',
};

