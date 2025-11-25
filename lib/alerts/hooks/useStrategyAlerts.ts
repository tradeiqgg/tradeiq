// =====================================================================
// CHAPTER 12: useStrategyAlerts Hook
// =====================================================================

'use client';

import { useAlerts } from './useAlerts';

export function useStrategyAlerts(
  userId: string | null,
  strategyId: string | null
) {
  return useAlerts(userId, {
    strategyId: strategyId || undefined,
    autoRefresh: true,
  });
}

