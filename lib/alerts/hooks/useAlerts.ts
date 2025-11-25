// =====================================================================
// CHAPTER 12: useAlerts Hook
// =====================================================================

'use client';

import { useState, useEffect } from 'react';
import { getUserAlerts, markAlertRead, markAllAlertsRead, deleteAlert } from '../alertEngine';
import { getEventBus } from '../../realtime/engine/eventBus';
import type { Alert } from '../alertTypes';

export interface UseAlertsResult {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markRead: (alertId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAlerts(
  userId: string | null,
  options?: {
    strategyId?: string;
    unreadOnly?: boolean;
    autoRefresh?: boolean;
  }
): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAlerts = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await getUserAlerts(userId, {
        strategyId: options?.strategyId,
        unreadOnly: options?.unreadOnly,
        limit: 100,
      });
      setAlerts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [userId, options?.strategyId, options?.unreadOnly]);

  // Subscribe to new alerts
  useEffect(() => {
    if (!userId) return;

    const eventBus = getEventBus();
    const unsubscribe = eventBus.on('ENTER_SIGNAL', () => {
      loadAlerts();
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Auto-refresh
  useEffect(() => {
    if (!options?.autoRefresh || !userId) return;

    const interval = setInterval(loadAlerts, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [userId, options?.autoRefresh]);

  const handleMarkRead = async (alertId: string) => {
    if (!userId) return;
    await markAlertRead(alertId, userId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await markAllAlertsRead(userId);
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleDelete = async (alertId: string) => {
    if (!userId) return;
    await deleteAlert(alertId, userId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return {
    alerts,
    unreadCount,
    isLoading,
    error,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    deleteAlert: handleDelete,
    refresh: loadAlerts,
  };
}

