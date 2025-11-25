// =====================================================================
// CHAPTER 12: useNotifications Hook
// =====================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../notifier';

export interface UseNotificationsResult {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(
  userId: string | null,
  options?: {
    unreadOnly?: boolean;
    autoRefresh?: boolean;
  }
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await getUserNotifications(userId, {
        unreadOnly: options?.unreadOnly,
        limit: 50,
      });
      setNotifications(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, options?.unreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Listen for new notifications
  useEffect(() => {
    if (!userId) return;

    const handleNotification = () => {
      loadNotifications();
    };

    window.addEventListener('tradeiq:notification', handleNotification);
    return () => {
      window.removeEventListener('tradeiq:notification', handleNotification);
    };
  }, [userId, loadNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (!options?.autoRefresh || !userId) return;

    const interval = setInterval(loadNotifications, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [userId, options?.autoRefresh, loadNotifications]);

  const handleMarkRead = async (notificationId: string) => {
    if (!userId) return;
    await markNotificationRead(notificationId, userId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    refresh: loadNotifications,
  };
}

