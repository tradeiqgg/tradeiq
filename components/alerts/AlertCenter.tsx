// =====================================================================
// CHAPTER 12: Alert Center Component
// =====================================================================

'use client';

import { useState } from 'react';
import { useAlerts } from '@/lib/alerts/hooks/useAlerts';
import { useAuthStore } from '@/stores/authStore';
import { NeonCard } from '@/components/ui/NeonCard';
import { AlertSeverityColors, AlertTypeLabels, type AlertType } from '@/lib/alerts/alertTypes';
import Link from 'next/link';

export function AlertCenter() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<{ type?: AlertType; unreadOnly?: boolean }>({});
  const { alerts, unreadCount, markRead, markAllRead, deleteAlert, isLoading } = useAlerts(
    user?.id || null,
    { unreadOnly: filter.unreadOnly }
  );

  const filteredAlerts = filter.type
    ? alerts.filter(a => a.type === filter.type)
    : alerts;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Alert Center
          </h1>
          <p className="text-[#A9A9B3] font-sans">
            {unreadCount} unread alerts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-[#1e1f22] text-[#A9A9B3] rounded-lg font-sans text-sm font-medium hover:bg-[#252628] transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter({})}
          className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
            !filter.type && !filter.unreadOnly
              ? 'bg-[#7CFF4F] text-[#0B0B0C]'
              : 'bg-[#1e1f22] text-[#A9A9B3] hover:bg-[#252628]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter({ unreadOnly: true })}
          className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
            filter.unreadOnly
              ? 'bg-[#7CFF4F] text-[#0B0B0C]'
              : 'bg-[#1e1f22] text-[#A9A9B3] hover:bg-[#252628]'
          }`}
        >
          Unread
        </button>
        {(['entry', 'exit', 'risk', 'indicator'] as AlertType[]).map(type => (
          <button
            key={type}
            onClick={() => setFilter({ type })}
            className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
              filter.type === type
                ? 'bg-[#7CFF4F] text-[#0B0B0C]'
                : 'bg-[#1e1f22] text-[#A9A9B3] hover:bg-[#252628]'
            }`}
          >
            {AlertTypeLabels[type]}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="text-center py-12 text-[#A9A9B3] font-sans">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-[#A9A9B3] font-sans">No alerts found</div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <NeonCard
              key={alert.id}
              className={`${!alert.read ? 'border-l-4' : ''}`}
              style={!alert.read ? { borderLeftColor: AlertSeverityColors[alert.severity] } : {}}
            >
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${!alert.read ? 'bg-[#7CFF4F]' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-sans font-medium"
                      style={{
                        backgroundColor: `${AlertSeverityColors[alert.severity]}20`,
                        color: AlertSeverityColors[alert.severity],
                      }}
                    >
                      {AlertTypeLabels[alert.type]}
                    </span>
                    <span className="text-xs text-[#A9A9B3] font-mono">
                      {formatTime(alert.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-white font-sans mb-2">{alert.message}</p>
                  {alert.strategy_id && (
                    <Link
                      href={`/strategy/${alert.strategy_id}`}
                      className="text-xs text-[#7CFF4F] hover:text-[#70e84b] font-sans"
                    >
                      View Strategy →
                    </Link>
                  )}
                </div>
                <div className="flex gap-2">
                  {!alert.read && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="text-xs text-[#A9A9B3] hover:text-white font-sans"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-sans"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </NeonCard>
          ))}
        </div>
      )}
    </div>
  );
}

