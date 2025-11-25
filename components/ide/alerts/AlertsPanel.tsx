// =====================================================================
// CHAPTER 12: IDE Alerts Panel
// =====================================================================

'use client';

import { useState } from 'react';
import { useStrategyAlerts } from '@/lib/alerts/hooks/useStrategyAlerts';
import { useAuthStore } from '@/stores/authStore';
import { getStrategyTriggers, createTrigger, deleteTrigger } from '@/lib/alerts/triggerEngine';
import { getCrossStrategyLinks, createCrossStrategyLink } from '@/lib/alerts/crossSignals';
import { NeonCard } from '@/components/ui/NeonCard';
import { RiskAlertPanel } from '@/components/alerts/RiskAlertPanel';
import type { Strategy } from '@/types';
import type { TriggerCondition, TriggerAction } from '@/lib/alerts/triggerEngine';

interface AlertsPanelProps {
  strategy: Strategy;
}

export function AlertsPanel({ strategy }: AlertsPanelProps) {
  const { user } = useAuthStore();
  const { alerts, unreadCount } = useStrategyAlerts(user?.id || null, strategy.id);
  const [activeTab, setActiveTab] = useState<'alerts' | 'triggers' | 'cross'>('alerts');
  const [triggers, setTriggers] = useState<any[]>([]);
  const [crossLinks, setCrossLinks] = useState<any[]>([]);

  const loadTriggers = async () => {
    if (!strategy.id) return;
    try {
      const data = await getStrategyTriggers(strategy.id);
      setTriggers(data);
    } catch (error) {
      console.error('Failed to load triggers:', error);
    }
  };

  const loadCrossLinks = async () => {
    if (!strategy.id) return;
    try {
      const data = await getCrossStrategyLinks(strategy.id);
      setCrossLinks(data);
    } catch (error) {
      console.error('Failed to load cross-links:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      {/* Header */}
      <div className="border-b border-[#1e1f22] p-4">
        <h2 className="text-lg font-display font-semibold text-white mb-1">
          Alerts & Triggers
        </h2>
        {unreadCount > 0 && (
          <p className="text-sm text-[#7CFF4F] font-sans">
            {unreadCount} unread alerts
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1e1f22] flex">
        {[
          { id: 'alerts', label: 'Alerts' },
          { id: 'triggers', label: 'Triggers' },
          { id: 'cross', label: 'Cross-Strategy' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'triggers') loadTriggers();
              if (tab.id === 'cross') loadCrossLinks();
            }}
            className={`
              px-4 py-2 font-sans text-sm font-medium transition-colors
              border-b-2
              ${
                activeTab === tab.id
                  ? 'border-[#7CFF4F] text-[#7CFF4F]'
                  : 'border-transparent text-[#A9A9B3] hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-[#A9A9B3] font-sans">
                No alerts for this strategy
              </div>
            ) : (
              alerts.map(alert => (
                <NeonCard key={alert.id}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${!alert.read ? 'bg-[#7CFF4F]' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-display font-semibold text-white mb-1">
                        {alert.type.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-[#A9A9B3] font-sans">
                        {alert.message}
                      </div>
                      <div className="text-xs text-[#A9A9B3]/70 font-mono mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </NeonCard>
              ))
            )}
          </div>
        )}

        {activeTab === 'triggers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-display font-semibold text-white">
                User-Defined Triggers
              </h3>
              <button className="px-3 py-1 bg-[#7CFF4F] text-[#0B0B0C] rounded text-xs font-sans font-medium hover:bg-[#70e84b]">
                + New Trigger
              </button>
            </div>
            {triggers.length === 0 ? (
              <div className="text-center py-8 text-[#A9A9B3] font-sans">
                No triggers defined. Create one to get started.
              </div>
            ) : (
              triggers.map(trigger => (
                <NeonCard key={trigger.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-display font-semibold text-white mb-1">
                        {trigger.name}
                      </div>
                      <div className="text-xs text-[#A9A9B3] font-sans">
                        {trigger.trigger.conditions.length} condition(s)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${trigger.enabled ? 'bg-[#7CFF4F]/20 text-[#7CFF4F]' : 'bg-[#1e1f22] text-[#A9A9B3]'}`}>
                        {trigger.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </NeonCard>
              ))
            )}
          </div>
        )}

        {activeTab === 'cross' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-display font-semibold text-white">
                Cross-Strategy Links
              </h3>
              <button className="px-3 py-1 bg-[#7CFF4F] text-[#0B0B0C] rounded text-xs font-sans font-medium hover:bg-[#70e84b]">
                + New Link
              </button>
            </div>
            {crossLinks.length === 0 ? (
              <div className="text-center py-8 text-[#A9A9B3] font-sans">
                No cross-strategy links. Link strategies to enable signal routing.
              </div>
            ) : (
              crossLinks.map(link => (
                <NeonCard key={link.id}>
                  <div className="text-sm font-display font-semibold text-white mb-1">
                    {link.mode.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-[#A9A9B3] font-sans">
                    Source: {link.source_strategy_id.slice(0, 8)}... → Target: {link.target_strategy_id.slice(0, 8)}...
                  </div>
                </NeonCard>
              ))
            )}
          </div>
        )}
      </div>

      {/* Risk Alerts Sidebar */}
      <div className="border-t border-[#1e1f22] p-4">
        <RiskAlertPanel strategyId={strategy.id} />
      </div>
    </div>
  );
}

