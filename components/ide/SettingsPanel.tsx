'use client';

import { useState } from 'react';
import type { Strategy } from '@/types';

interface SettingsPanelProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
}

export function SettingsPanel({ strategy, onAutoSave }: SettingsPanelProps) {
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#0B0B0C]">
      <div className="h-10 border-b border-[#1e1f22] bg-[#111214] px-4 flex items-center">
        <div className="text-xs font-mono text-[#7CFF4F]">⚙️ SETTINGS</div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div>
          <h3 className="text-sm font-mono text-white mb-4">General</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#A9A9B3]">Auto-save</label>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#A9A9B3]">Notifications</label>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-mono text-white mb-4">Strategy Info</h3>
          <div className="space-y-2 text-xs font-mono text-[#A9A9B3]">
            <div>ID: {strategy.id}</div>
            <div>Created: {new Date(strategy.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(strategy.updated_at || strategy.created_at).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

