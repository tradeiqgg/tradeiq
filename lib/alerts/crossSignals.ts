// =====================================================================
// CHAPTER 12: Cross-Strategy Signal Routing
// =====================================================================

import { supabase } from '@/lib/supabase';
import { getEventBus } from '../realtime/engine/eventBus';
import { getLiveIndicatorEngine } from '../realtime/indicators/liveIndicatorEngine';

export interface CrossStrategyLink {
  id: string;
  source_strategy_id: string;
  target_strategy_id: string;
  user_id: string;
  mode: 'signal_only' | 'value_forward' | 'risk_sync';
  config: Record<string, any>;
  enabled: boolean;
  created_at: string;
}

/**
 * Create a cross-strategy link
 */
export async function createCrossStrategyLink(
  userId: string,
  sourceStrategyId: string,
  targetStrategyId: string,
  mode: 'signal_only' | 'value_forward' | 'risk_sync',
  config?: Record<string, any>
): Promise<CrossStrategyLink> {
  const { data, error } = await supabase
    .from('cross_strategy_links')
    .insert({
      user_id: userId,
      source_strategy_id: sourceStrategyId,
      target_strategy_id: targetStrategyId,
      mode,
      config: config || {},
      enabled: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create cross-strategy link: ${error.message}`);
  }

  return data as CrossStrategyLink;
}

/**
 * Get cross-strategy links for a strategy
 */
export async function getCrossStrategyLinks(strategyId: string): Promise<CrossStrategyLink[]> {
  const { data, error } = await supabase
    .from('cross_strategy_links')
    .select('*')
    .or(`source_strategy_id.eq.${strategyId},target_strategy_id.eq.${strategyId}`)
    .eq('enabled', true);

  if (error) {
    throw new Error(`Failed to fetch cross-strategy links: ${error.message}`);
  }

  return (data || []) as CrossStrategyLink[];
}

/**
 * Initialize cross-strategy signal routing
 */
export function initializeCrossStrategyRouting(): void {
  const eventBus = getEventBus();

  // Listen for entry/exit signals
  eventBus.on('ENTER_SIGNAL', async (event) => {
    if (!event.strategyId) return;

    // Find all links where this strategy is the source
    const links = await getCrossStrategyLinks(event.strategyId);
    
    for (const link of links) {
      if (link.source_strategy_id === event.strategyId && link.mode === 'signal_only') {
        // Forward signal to target strategy
        eventBus.emit({
          type: 'RULE_TRIGGERED',
          timestamp: Date.now(),
          data: {
            source_strategy_id: event.strategyId,
            signal: 'enter',
            direction: event.data?.direction,
            price: event.data?.price,
          },
          strategyId: link.target_strategy_id,
        });
      }
    }
  });

  eventBus.on('EXIT_SIGNAL', async (event) => {
    if (!event.strategyId) return;

    const links = await getCrossStrategyLinks(event.strategyId);
    
    for (const link of links) {
      if (link.source_strategy_id === event.strategyId && link.mode === 'signal_only') {
        eventBus.emit({
          type: 'RULE_TRIGGERED',
          timestamp: Date.now(),
          data: {
            source_strategy_id: event.strategyId,
            signal: 'exit',
            direction: event.data?.direction,
            price: event.data?.price,
          },
          strategyId: link.target_strategy_id,
        });
      }
    }
  });

  // Value forwarding (indicator values)
  eventBus.on('INDICATOR_UPDATE', async (event) => {
    if (!event.strategyId) return;

    const links = await getCrossStrategyLinks(event.strategyId);
    
    for (const link of links) {
      if (link.source_strategy_id === event.strategyId && link.mode === 'value_forward') {
        // Forward indicator value to target strategy
        const indicatorEngine = getLiveIndicatorEngine();
        // Implementation would forward specific indicator values
      }
    }
  });

  console.log('[CrossStrategyRouting] Initialized');
}

/**
 * Delete a cross-strategy link
 */
export async function deleteCrossStrategyLink(linkId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('cross_strategy_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete cross-strategy link: ${error.message}`);
  }
}

