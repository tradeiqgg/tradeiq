// =====================================================================
// CHAPTER 12: Alert Toast Component
// =====================================================================

'use client';

import { useEffect, useState } from 'react';
import { AlertSeverityColors, type AlertType, type AlertSeverity } from '@/lib/alerts/alertTypes';
import { NeonCard } from '@/components/ui/NeonCard';

interface AlertToastProps {
  type: AlertType;
  message: string;
  severity?: AlertSeverity;
  onClose: () => void;
  duration?: number;
}

export function AlertToast({
  type,
  message,
  severity = 'info',
  onClose,
  duration = 5000,
}: AlertToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  const color = AlertSeverityColors[severity];

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <NeonCard className="min-w-[300px] max-w-[400px] border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-sm font-display font-semibold text-white mb-1">
              {type.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="text-sm text-[#A9A9B3] font-sans">
              {message}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-[#A9A9B3] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </NeonCard>
    </div>
  );
}

