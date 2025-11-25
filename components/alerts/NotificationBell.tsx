// =====================================================================
// CHAPTER 12: Notification Bell Component
// =====================================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/lib/alerts/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export function NotificationBell() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markRead } = useNotifications(user?.id || null, {
    unreadOnly: false,
    autoRefresh: true,
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) {
    return null;
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#A9A9B3] hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-[#7CFF4F] text-[#0B0B0C] text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111214] border border-[#1e1f22] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-[#1e1f22] flex items-center justify-between">
            <h3 className="text-sm font-display font-semibold text-white">Notifications</h3>
            <Link
              href="/alerts"
              className="text-xs text-[#7CFF4F] hover:text-[#70e84b] font-sans"
              onClick={() => setIsOpen(false)}
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#1e1f22]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#A9A9B3] font-sans">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-[#151618] transition-colors cursor-pointer ${
                    !notification.read ? 'bg-[#151618]/50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markRead(notification.id);
                    }
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${!notification.read ? 'bg-[#7CFF4F]' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-display font-semibold text-white mb-1">
                        {notification.title}
                      </div>
                      <div className="text-xs text-[#A9A9B3] font-sans line-clamp-2">
                        {notification.body}
                      </div>
                      <div className="text-xs text-[#A9A9B3]/70 font-mono mt-1">
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

