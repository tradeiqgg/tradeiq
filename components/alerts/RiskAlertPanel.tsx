// =====================================================================
// CHAPTER 12: Risk Alert Panel Component
// =====================================================================

'use client';

import { useStrategyAlerts } from '@/lib/alerts/hooks/useStrategyAlerts';
import { useAuthStore } from '@/stores/authStore';
import { NeonCard } from '@/components/ui/NeonCard';
import { AlertSeverityColors } from '@/lib/alerts/alertTypes';

interface RiskAlertPanelProps {
  strategyId: string;
}

export function RiskAlertPanel({ strategyId }: RiskAlertPanelProps) {
  const { user } = useAuthStore();
  const { alerts, isLoading } = useStrategyAlerts(user?.id || null, strategyId);

  const riskAlerts = alerts.filter(a => 
    a.type === 'risk' || 
    a.type === 'max_drawdown' || 
    a.type === 'volatility_spike' ||
    a.type === 'unexpected_behavior'
  );

  if (isLoading) {
    return (
      <NeonCard>
        <div className="text-sm text-[#A9A9B3] font-sans">Loading risk alerts...</div>
      </NeonCard>
    );
  }

  if (riskAlerts.length === 0) {
    return (
      <NeonCard>
        <h3 className="text-sm font-display font-semibold text-white mb-2">Risk Alerts</h3>
        <div className="text-sm text-[#A9A9B3] font-sans">No risk alerts</div>
      </NeonCard>
    );
  }

  return (
    <NeonCard>
      <h3 className="text-sm font-display font-semibold text-white mb-3">Risk Alerts</h3>
      <div className="space-y-2">
        {riskAlerts.slice(0, 5).map(alert => (
          <div
            key={alert.id}
            className="p-2 bg-[#0B0B0C] border border-[#1e1f22] rounded text-xs font-sans"
            style={{ borderLeftColor: AlertSeverityColors[alert.severity], borderLeftWidth: '3px' }}
          >
            <div className="text-white mb-1">{alert.message}</div>
            <div className="text-[#A9A9B3] text-xs">
              {new Date(alert.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </NeonCard>
  );
}

