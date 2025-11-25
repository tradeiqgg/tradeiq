// =====================================================================
// CHAPTER 12: Alert Engine
// =====================================================================

import { supabase } from '@/lib/supabase';
import { getEventBus } from '../realtime/engine/eventBus';
import type { Alert, AlertType, AlertSeverity, AlertPayload } from './alertTypes';
import { notify } from './notifier';

export interface CreateAlertParams {
  user_id: string;
  strategy_id?: string;
  type: AlertType;
  message: string;
  payload?: AlertPayload;
  severity?: AlertSeverity;
}

/**
 * Create an alert and store it in the database
 */
export async function createAlert(params: CreateAlertParams): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: params.user_id,
      strategy_id: params.strategy_id,
      type: params.type,
      message: params.message,
      payload: params.payload || {},
      severity: params.severity || 'info',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  const alert = data as Alert;

  // Push notification
  await notify(params.user_id, {
    title: alert.message,
    body: `Strategy alert: ${params.type}`,
    type: 'alert',
    link: params.strategy_id ? `/strategy/${params.strategy_id}` : undefined,
    payload: { alert_id: alert.id },
  });

  return alert;
}

/**
 * Initialize alert engine to listen to event bus
 */
export function initializeAlertEngine(): void {
  const eventBus = getEventBus();

  // Entry signals
  eventBus.on('ENTER_SIGNAL', (event) => {
    if (event.strategyId && event.data) {
      createAlert({
        user_id: event.data.user_id || '',
        strategy_id: event.strategyId,
        type: 'entry',
        message: `Entry signal: ${event.data.direction?.toUpperCase()} @ $${event.data.price?.toFixed(2)}`,
        payload: {
          direction: event.data.direction,
          price: event.data.price,
          reason: event.data.reason,
        },
        severity: 'info',
      }).catch(console.error);
    }
  });

  // Exit signals
  eventBus.on('EXIT_SIGNAL', (event) => {
    if (event.strategyId && event.data) {
      createAlert({
        user_id: event.data.user_id || '',
        strategy_id: event.strategyId,
        type: 'exit',
        message: `Exit signal: ${event.data.direction?.toUpperCase()} @ $${event.data.price?.toFixed(2)}`,
        payload: {
          direction: event.data.direction,
          price: event.data.price,
          reason: event.data.reason,
        },
        severity: 'info',
      }).catch(console.error);
    }
  });

  // Risk alerts
  eventBus.on('RISK_ALERT', (event) => {
    if (event.strategyId && event.data) {
      createAlert({
        user_id: event.data.user_id || '',
        strategy_id: event.strategyId,
        type: 'risk',
        message: event.data.message || 'Risk condition triggered',
        payload: event.data,
        severity: event.data.level === 'error' ? 'error' : 'warning',
      }).catch(console.error);
    }
  });

  // PnL updates (for drawdown alerts)
  eventBus.on('PNL_UPDATE', (event) => {
    if (event.strategyId && event.data) {
      const drawdown = event.data.maxDrawdown || 0;
      
      // Alert on significant drawdown
      if (drawdown > 10) {
        createAlert({
          user_id: event.data.user_id || '',
          strategy_id: event.strategyId,
          type: 'max_drawdown',
          message: `Max drawdown reached: ${drawdown.toFixed(2)}%`,
          payload: {
            drawdown,
            balance: event.data.balance,
            equity: event.data.equity,
          },
          severity: drawdown > 20 ? 'critical' : 'warning',
        }).catch(console.error);
      }
    }
  });

  console.log('[AlertEngine] Initialized and listening to events');
}

/**
 * Get alerts for a user
 */
export async function getUserAlerts(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    strategyId?: string;
    type?: AlertType;
    limit?: number;
  }
): Promise<Alert[]> {
  let query = supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('read', false);
  }

  if (options?.strategyId) {
    query = query.eq('strategy_id', options.strategyId);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`);
  }

  return (data || []) as Alert[];
}

/**
 * Mark alert as read
 */
export async function markAlertRead(alertId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({ read: true })
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to mark alert as read: ${error.message}`);
  }
}

/**
 * Mark all alerts as read for a user
 */
export async function markAllAlertsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw new Error(`Failed to mark all alerts as read: ${error.message}`);
  }
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete alert: ${error.message}`);
  }
}

