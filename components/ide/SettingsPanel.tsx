'use client';

import { useState } from 'react';
import type { Strategy } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface SettingsPanelProps {
  strategy: Strategy;
  onAutoSave: (updates: Partial<Strategy>) => void;
}

export function SettingsPanel({ strategy, onAutoSave }: SettingsPanelProps) {
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const handlePublish = async () => {
    if (!user?.id || !strategy.id) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/strategy/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: strategy.id,
          userId: user.id,
          title: strategy.title || 'Untitled Strategy',
          description: strategy.description || '',
          tags: strategy.tags || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish');
      }

      const { strategy: publishedStrategy } = await response.json();
      
      // Update local strategy
      onAutoSave({
        visibility: 'public',
        ...publishedStrategy,
      });

      alert('Strategy published successfully! It will now appear in the Discover page.');
    } catch (error: any) {
      console.error('Publish error:', error);
      alert(`Failed to publish: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

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
          <h3 className="text-sm font-mono text-white mb-4">Publishing</h3>
          <div className="space-y-4">
            <div className="text-xs font-mono text-[#A9A9B3] mb-2">
              Visibility: <span className="text-[#7CFF4F]">{strategy.visibility || 'private'}</span>
            </div>
            {strategy.visibility !== 'public' && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full px-4 py-2 bg-[#7CFF4F] text-[#0B0B0C] rounded-lg font-sans font-semibold hover:bg-[#70e84b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish Strategy'}
              </button>
            )}
            {strategy.visibility === 'public' && (
              <div className="text-xs font-mono text-[#7CFF4F]">
                ✓ Strategy is public and visible in Discover
              </div>
            )}
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

