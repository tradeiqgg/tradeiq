// =====================================================================
// CHAPTER 12: Trigger Engine for User-Defined Alert Rules
// =====================================================================

import { supabase } from '@/lib/supabase';
import { getEventBus } from '../realtime/engine/eventBus';
import { getLiveIndicatorEngine } from '../realtime/indicators/liveIndicatorEngine';
import { createAlert } from './alertEngine';
import type { AlertType } from './alertTypes';

export interface TriggerCondition {
  type: 'indicator' | 'price' | 'signal' | 'risk' | 'time';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'crosses_above' | 'crosses_below';
  value?: number | string;
  indicator_id?: string;
  field?: string;
}

export interface TriggerAction {
  type: 'alert' | 'execute_strategy' | 'cross_signal';
  message?: string;
  strategy_id?: string;
  target_strategy_id?: string;
}

export interface AlertTrigger {
  id: string;
  strategy_id: string;
  user_id: string;
  name: string;
  trigger: {
    conditions: TriggerCondition[];
    actions: TriggerAction[];
  };
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Evaluate a trigger condition
 */
async function evaluateCondition(
  condition: TriggerCondition,
  strategyId: string,
  symbol: string,
  interval: string,
  currentData: any
): Promise<boolean> {
  const indicatorEngine = getLiveIndicatorEngine();

  switch (condition.type) {
    case 'indicator': {
      if (!condition.indicator_id) return false;
      
      const indicatorValue = indicatorEngine.getIndicatorValue(
        symbol,
        interval,
        condition.indicator_id as any,
        {}
      );

      if (!indicatorValue || indicatorValue.value === null) return false;

      const value = typeof indicatorValue.value === 'number' 
        ? indicatorValue.value 
        : typeof indicatorValue.value === 'object' 
        ? indicatorValue.value.middle 
        : 0;

      switch (condition.operator) {
        case 'gt': return value > (condition.value as number);
        case 'gte': return value >= (condition.value as number);
        case 'lt': return value < (condition.value as number);
        case 'lte': return value <= (condition.value as number);
        case 'eq': return value === condition.value;
        case 'neq': return value !== condition.value;
        default: return false;
      }
    }

    case 'price': {
      const price = currentData?.candle?.close || 0;
      const threshold = condition.value as number;

      switch (condition.operator) {
        case 'gt': return price > threshold;
        case 'gte': return price >= threshold;
        case 'lt': return price < threshold;
        case 'lte': return price <= threshold;
        case 'eq': return price === threshold;
        default: return false;
      }
    }

    case 'risk': {
      const drawdown = currentData?.state?.maxDrawdown || 0;
      const threshold = condition.value as number;

      switch (condition.operator) {
        case 'gt': return drawdown > threshold;
        case 'gte': return drawdown >= threshold;
        default: return false;
      }
    }

    default:
      return false;
  }
}

/**
 * Evaluate all triggers for a strategy
 */
export async function evaluateTriggers(
  strategyId: string,
  symbol: string,
  interval: string,
  currentData: any
): Promise<void> {
  const { data: triggers, error } = await supabase
    .from('alert_triggers')
    .select('*')
    .eq('strategy_id', strategyId)
    .eq('enabled', true);

  if (error || !triggers) {
    return;
  }

  for (const trigger of triggers as AlertTrigger[]) {
    try {
      // Evaluate all conditions (AND logic)
      const conditionsMet = await Promise.all(
        trigger.trigger.conditions.map(cond => 
          evaluateCondition(cond, strategyId, symbol, interval, currentData)
        )
      );

      if (conditionsMet.every(met => met)) {
        // Execute actions
        for (const action of trigger.trigger.actions) {
          if (action.type === 'alert') {
            await createAlert({
              user_id: trigger.user_id,
              strategy_id: strategyId,
              type: 'indicator_threshold',
              message: action.message || `Trigger "${trigger.name}" activated`,
              payload: { trigger_id: trigger.id },
            });
          } else if (action.type === 'cross_signal' && action.target_strategy_id) {
            // Forward signal to another strategy
            const eventBus = getEventBus();
            eventBus.emit({
              type: 'RULE_TRIGGERED',
              timestamp: Date.now(),
              data: {
                source_strategy_id: strategyId,
                target_strategy_id: action.target_strategy_id,
                message: action.message,
              },
              strategyId: action.target_strategy_id,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error evaluating trigger ${trigger.id}:`, error);
    }
  }
}

/**
 * Create a trigger
 */
export async function createTrigger(
  userId: string,
  strategyId: string,
  name: string,
  conditions: TriggerCondition[],
  actions: TriggerAction[]
): Promise<AlertTrigger> {
  const { data, error } = await supabase
    .from('alert_triggers')
    .insert({
      user_id: userId,
      strategy_id: strategyId,
      name,
      trigger: { conditions, actions },
      enabled: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create trigger: ${error.message}`);
  }

  return data as AlertTrigger;
}

/**
 * Get triggers for a strategy
 */
export async function getStrategyTriggers(strategyId: string): Promise<AlertTrigger[]> {
  const { data, error } = await supabase
    .from('alert_triggers')
    .select('*')
    .eq('strategy_id', strategyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch triggers: ${error.message}`);
  }

  return (data || []) as AlertTrigger[];
}

/**
 * Update trigger
 */
export async function updateTrigger(
  triggerId: string,
  userId: string,
  updates: Partial<AlertTrigger>
): Promise<void> {
  const { error } = await supabase
    .from('alert_triggers')
    .update(updates)
    .eq('id', triggerId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update trigger: ${error.message}`);
  }
}

/**
 * Delete trigger
 */
export async function deleteTrigger(triggerId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('alert_triggers')
    .delete()
    .eq('id', triggerId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete trigger: ${error.message}`);
  }
}

