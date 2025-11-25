// =====================================================================
// CHAPTER 12: Notifier System
// =====================================================================

import { supabase } from '@/lib/supabase';

export interface NotificationParams {
  title: string;
  body: string;
  type: 'alert' | 'follow' | 'strategy_update' | 'comment' | 'competition' | 'like' | 'fork' | 'mention' | 'system';
  link?: string;
  payload?: Record<string, any>;
}

/**
 * Push a notification to a user
 */
export async function notify(userId: string, params: NotificationParams): Promise<void> {
  // Store in database
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      payload: params.payload || {},
    });

  if (error) {
    console.error('Failed to create notification:', error);
    return;
  }

  // Browser push notification (if permission granted)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(params.title, {
        body: params.body,
        icon: '/iqlogobgrm.png',
        tag: params.type,
      });
    } else if (Notification.permission === 'default') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(params.title, {
            body: params.body,
            icon: '/iqlogobgrm.png',
          });
        }
      });
    }
  }

  // Emit custom event for in-app notifications
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tradeiq:notification', {
      detail: params,
    }));
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    type?: string;
    limit?: number;
  }
): Promise<any[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('read', false);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return data || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
}

