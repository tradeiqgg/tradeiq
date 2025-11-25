// =====================================================================
// CHAPTER 10: Cloud Strategy Sync Layer
// =====================================================================

import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/supabase/authFetch';
import type { Strategy, StrategyVersion } from '@/types';
import type { TQJSSchema } from '@/lib/tql/schema';

export interface StrategySyncState {
  isSyncing: boolean;
  lastSynced: Date | null;
  syncError: string | null;
  conflictDetected: boolean;
}

export interface StrategyDiff {
  strategy_json?: Record<string, any>;
  strategy_tql?: string;
  strategy_blocks?: any;
  version: number;
}

/**
 * Calculate diff percentage between two strategy representations
 */
function calculateDiffPercent(oldData: any, newData: any): number {
  if (!oldData || !newData) return 100;
  
  const oldStr = JSON.stringify(oldData);
  const newStr = JSON.stringify(newData);
  
  if (oldStr === newStr) return 0;
  
  // Simple diff calculation based on string length difference
  const maxLen = Math.max(oldStr.length, newStr.length);
  const diffLen = Math.abs(oldStr.length - newStr.length);
  
  return (diffLen / maxLen) * 100;
}

/**
 * Upload strategy to cloud storage
 */
export async function uploadStrategy(
  strategyId: string,
  userId: string,
  data: {
    strategy_json?: Record<string, any>;
    strategy_tql?: string;
    strategy_blocks?: any;
    title?: string;
    description?: string;
    visibility?: 'public' | 'private' | 'unlisted';
    tags?: string[];
  }
): Promise<Strategy> {
  return authFetch(async (client) => {
    const { data: strategy, error } = await client
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Calculate new version if significant changes
    const currentVersion = strategy.version || 1;
    const oldData = {
      strategy_json: strategy.strategy_json,
      strategy_tql: strategy.strategy_tql,
      strategy_blocks: strategy.strategy_blocks,
    };
    
    const newData = {
      strategy_json: data.strategy_json || oldData.strategy_json,
      strategy_tql: data.strategy_tql || oldData.strategy_tql,
      strategy_blocks: data.strategy_blocks || oldData.strategy_blocks,
    };

    const diffPercent = Math.max(
      calculateDiffPercent(oldData.strategy_json, newData.strategy_json),
      calculateDiffPercent(oldData.strategy_tql, newData.strategy_tql),
      calculateDiffPercent(oldData.strategy_blocks, newData.strategy_blocks)
    );

    const newVersion = diffPercent > 5 ? currentVersion + 1 : currentVersion;

    // Update strategy
    const updateData: any = {
      updated_at: new Date().toISOString(),
      version: newVersion,
    };

    if (data.strategy_json !== undefined) updateData.strategy_json = data.strategy_json;
    if (data.strategy_tql !== undefined) updateData.strategy_tql = data.strategy_tql;
    if (data.strategy_blocks !== undefined) updateData.strategy_blocks = data.strategy_blocks;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const { data: updated, error: updateError } = await client
      .from('strategies')
      .update(updateData)
      .eq('id', strategyId)
      .select()
      .single();

    if (updateError) {
      return { data: null, error: updateError };
    }

    // Create version snapshot if version changed
    if (newVersion > currentVersion) {
      await createSnapshot(strategyId, {
        version: newVersion,
        strategy_json: newData.strategy_json,
        strategy_tql: newData.strategy_tql,
        strategy_blocks: newData.strategy_blocks,
        editor_mode: data.strategy_tql ? 'tql' : data.strategy_blocks ? 'blocks' : 'json',
      });
    }

    return { data: updated as Strategy, error: null };
  }).then((result) => {
    if (result.error) {
      throw new Error(`Failed to upload strategy: ${result.error.message}`);
    }
    return result.data!;
  });
}

/**
 * Fetch strategy from cloud storage
 * FIXED: Uses authenticated fetch to prevent 406/460 errors in production
 */
export async function fetchStrategy(
  strategyId: string,
  userId?: string
): Promise<Strategy | null> {
  return authFetch(async (client) => {
    let query = client
      .from('strategies')
      .select('*')
      .eq('id', strategyId);

    // If userId provided, ensure user owns it or it's public
    if (userId) {
      query = query.or(`user_id.eq.${userId},visibility.eq.public,visibility.eq.unlisted`);
    } else {
      query = query.eq('visibility', 'public');
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null }; // Not found
      }
      return { data: null, error };
    }

    return { data: data as Strategy, error: null };
  }).then((result) => {
    if (result.error) {
      throw new Error(`Failed to fetch strategy: ${result.error.message}`);
    }
    return result.data;
  });
}

/**
 * Sync strategy (merge with cloud version)
 */
export async function syncStrategy(
  strategyId: string,
  userId: string,
  localData: {
    strategy_json?: Record<string, any>;
    strategy_tql?: string;
    strategy_blocks?: any;
  }
): Promise<{ strategy: Strategy; conflictDetected: boolean }> {
  const cloudStrategy = await fetchStrategy(strategyId, userId);
  
  if (!cloudStrategy) {
    throw new Error('Strategy not found');
  }

  // Check for conflicts
  const cloudUpdated = new Date(cloudStrategy.updated_at);
  const localUpdated = localData.strategy_json?.meta?.updated_at 
    ? new Date(localData.strategy_json.meta.updated_at)
    : null;

  const conflictDetected = localUpdated && cloudUpdated > localUpdated;

  if (conflictDetected) {
    // Merge strategy: prefer cloud for metadata, local for content
    const merged = {
      ...cloudStrategy,
      strategy_json: localData.strategy_json || cloudStrategy.strategy_json,
      strategy_tql: localData.strategy_tql || cloudStrategy.strategy_tql,
      strategy_blocks: localData.strategy_blocks || cloudStrategy.strategy_blocks,
    };

    const { data, error } = await supabase
      .from('strategies')
      .update({
        ...merged,
        updated_at: new Date().toISOString(),
      })
      .eq('id', strategyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to sync strategy: ${error.message}`);
    }

    return { strategy: data as Strategy, conflictDetected: true };
  }

  // No conflict, just upload local changes
  const strategy = await uploadStrategy(strategyId, userId, localData);
  return { strategy, conflictDetected: false };
}

/**
 * Create a version snapshot
 */
export async function createSnapshot(
  strategyId: string,
  data: {
    version: number;
    strategy_json?: Record<string, any>;
    strategy_tql?: string;
    strategy_blocks?: any;
    editor_mode?: 'tql' | 'blocks' | 'json';
    summary?: string;
  }
): Promise<StrategyVersion> {
  const { data: snapshot, error } = await supabase
    .from('strategy_versions')
    .insert({
      strategy_id: strategyId,
      version: data.version,
      strategy_json: data.strategy_json,
      strategy_tql: data.strategy_tql,
      strategy_blocks: data.strategy_blocks,
      editor_mode: data.editor_mode,
      summary: data.summary || `Version ${data.version}`,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create snapshot: ${error.message}`);
  }

  return snapshot as StrategyVersion;
}

/**
 * List all versions for a strategy
 */
export async function listVersions(strategyId: string): Promise<StrategyVersion[]> {
  const { data, error } = await supabase
    .from('strategy_versions')
    .select('*')
    .eq('strategy_id', strategyId)
    .order('version', { ascending: false });

  if (error) {
    throw new Error(`Failed to list versions: ${error.message}`);
  }

  return (data || []) as StrategyVersion[];
}

/**
 * Restore a specific version
 */
export async function restoreVersion(
  strategyId: string,
  userId: string,
  version: number
): Promise<Strategy> {
  const { data: versionData, error: fetchError } = await supabase
    .from('strategy_versions')
    .select('*')
    .eq('strategy_id', strategyId)
    .eq('version', version)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch version: ${fetchError.message}`);
  }

  // Update strategy with version data
  const { data: strategy, error: updateError } = await supabase
    .from('strategies')
    .update({
      strategy_json: versionData.strategy_json,
      strategy_tql: versionData.strategy_tql,
      strategy_blocks: versionData.strategy_blocks,
      updated_at: new Date().toISOString(),
    })
    .eq('id', strategyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to restore version: ${updateError.message}`);
  }

  return strategy as Strategy;
}

/**
 * Publish strategy (make it public)
 */
export async function publishStrategy(
  strategyId: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    tags?: string[];
  }
): Promise<Strategy> {
  const { data: strategy, error } = await supabase
    .from('strategies')
    .update({
      visibility: 'public',
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', strategyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to publish strategy: ${error.message}`);
  }

  return strategy as Strategy;
}

/**
 * Fork a strategy (create a copy)
 */
export async function forkStrategy(
  originalStrategyId: string,
  userId: string,
  newTitle?: string
): Promise<Strategy> {
  // Fetch original strategy
  const original = await fetchStrategy(originalStrategyId);
  
  if (!original) {
    throw new Error('Original strategy not found');
  }

  if (original.visibility === 'private') {
    throw new Error('Cannot fork private strategy');
  }

  // Create new strategy
  const { data: newStrategy, error } = await supabase
    .from('strategies')
    .insert({
      user_id: userId,
      title: newTitle || `${original.title} (Fork)`,
      description: original.description,
      raw_prompt: original.raw_prompt,
      json_logic: original.json_logic,
      block_schema: original.block_schema,
      pseudocode: original.pseudocode,
      strategy_json: original.strategy_json,
      strategy_tql: original.strategy_tql,
      strategy_blocks: original.strategy_blocks,
      visibility: 'private', // Forked strategies start as private
      tags: original.tags || [],
      forked_from: originalStrategyId,
      version: 1,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to fork strategy: ${error.message}`);
  }

  return newStrategy as Strategy;
}

/**
 * Autosave hook - call this every 3 seconds when strategy is valid
 */
let autosaveTimer: NodeJS.Timeout | null = null;
let lastAutosaveData: any = null;

export function startAutosave(
  strategyId: string | null,
  userId: string | null,
  getCurrentData: () => {
    strategy_json?: Record<string, any>;
    strategy_tql?: string;
    strategy_blocks?: any;
  },
  isValid: () => boolean,
  onSave?: (success: boolean) => void
) {
  stopAutosave();

  if (!strategyId || !userId) {
    return;
  }

  autosaveTimer = setInterval(async () => {
    if (!isValid()) {
      return;
    }

    const currentData = getCurrentData();
    const dataStr = JSON.stringify(currentData);

    // Skip if no changes
    if (dataStr === lastAutosaveData) {
      return;
    }

    lastAutosaveData = dataStr;

    try {
      await uploadStrategy(strategyId, userId, currentData);
      onSave?.(true);
    } catch (error) {
      console.error('Autosave failed:', error);
      onSave?.(false);
    }
  }, 3000); // 3 seconds
}

export function stopAutosave() {
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
  lastAutosaveData = null;
}

