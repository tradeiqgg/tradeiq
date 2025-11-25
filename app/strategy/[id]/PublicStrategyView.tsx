'use client';

import { useEffect, useState } from 'react';
import { LayoutShell } from '@/components/LayoutShell';
import { NeonCard } from '@/components/ui/NeonCard';
import { StrategyPageTabs } from '@/components/strategyLibrary/StrategyPageTabs';
import { StrategyLikeButton, StrategyForkButton, StrategyCommentSection, StrategyShareMenu } from '@/components/sharing';
import { UserProfilePanel } from '@/components/profiles';
import { useAuthStore } from '@/stores/authStore';
import { fetchStrategy } from '@/lib/cloud/strategySync';
import type { Strategy, User } from '@/types';

interface PublicStrategyViewProps {
  strategyId: string;
}

export default function PublicStrategyView({ strategyId }: PublicStrategyViewProps) {
  const { user } = useAuthStore();
  
  const [strategy, setStrategy] = useState<Strategy & { user?: User } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const loadStrategy = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStrategy(strategyId, user?.id);
        if (data) {
          setStrategy(data as Strategy & { user?: User });
          setLikesCount(data.likes_count || 0);
          
          // Check if user liked it
          if (user?.id) {
            const likeResponse = await fetch(`/api/strategy/like?strategyId=${strategyId}&userId=${user.id}`);
            if (likeResponse.ok) {
              const { liked: isLiked } = await likeResponse.json();
              setLiked(isLiked);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load strategy:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStrategy();
  }, [strategyId, user?.id]);

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
            <p className="text-[#A9A9B3] font-mono">Loading strategy...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  if (!strategy) {
    return (
      <LayoutShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#A9A9B3] font-sans text-lg">Strategy not found</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  const isOwner = user?.id === strategy.user_id;

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                {strategy.title || 'Untitled Strategy'}
              </h1>
              {strategy.user && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#A9A9B3] font-sans">by</span>
                  <a
                    href={`/u/${strategy.user.username || strategy.user.wallet_address}`}
                    className="text-[#7CFF4F] hover:text-[#70e84b] font-sans font-medium"
                  >
                    {strategy.user.username || strategy.user.wallet_address?.slice(0, 8)}
                  </a>
                  {strategy.forked_from && (
                    <>
                      <span className="text-[#A9A9B3] font-sans">•</span>
                      <span className="text-xs text-[#A9A9B3] font-sans">Forked</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Social Actions */}
            <div className="flex items-center gap-3">
              <StrategyLikeButton
                strategyId={strategyId}
                userId={user?.id || null}
                initialLiked={liked}
                initialCount={likesCount}
                onLikeChange={(l, c) => {
                  setLiked(l);
                  setLikesCount(c);
                }}
              />
              {!isOwner && (
                <StrategyForkButton
                  strategyId={strategyId}
                  userId={user?.id || null}
                />
              )}
              <StrategyShareMenu
                strategyId={strategyId}
                strategyTitle={strategy.title || 'Untitled Strategy'}
              />
            </div>
          </div>

          {/* Tags */}
          {strategy.tags && strategy.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {strategy.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#1e1f22] text-sm text-[#A9A9B3] font-sans rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <StrategyPageTabs
          strategy={strategy}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {strategy.description && (
                <NeonCard>
                  <h2 className="text-xl font-display font-semibold text-white mb-3">
                    Description
                  </h2>
                  <p className="text-[#A9A9B3] font-sans leading-relaxed">
                    {strategy.description}
                  </p>
                </NeonCard>
              )}

              {/* Key Metrics */}
              <NeonCard>
                <h2 className="text-xl font-display font-semibold text-white mb-4">
                  Key Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-[#A9A9B3] font-sans mb-1">Likes</div>
                    <div className="text-2xl font-display font-bold text-[#7CFF4F]">
                      {likesCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#A9A9B3] font-sans mb-1">Comments</div>
                    <div className="text-2xl font-display font-bold text-[#7CFF4F]">
                      {strategy.comments_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#A9A9B3] font-sans mb-1">Version</div>
                    <div className="text-2xl font-display font-bold text-[#7CFF4F]">
                      {strategy.version || 1}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#A9A9B3] font-sans mb-1">Downloads</div>
                    <div className="text-2xl font-display font-bold text-[#7CFF4F]">
                      {strategy.downloads_count || 0}
                    </div>
                  </div>
                </div>
              </NeonCard>
            </div>
          )}

          {activeTab === 'tql' && strategy.strategy_tql && (
            <NeonCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-white">
                  TQL Code
                </h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(strategy.strategy_tql || '');
                  }}
                  className="px-3 py-1 bg-[#1e1f22] text-[#7CFF4F] text-sm font-sans rounded hover:bg-[#252628] transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-[#0B0B0C] border border-[#1e1f22] rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-[#A9A9B3] font-mono">
                  {strategy.strategy_tql}
                </code>
              </pre>
            </NeonCard>
          )}

          {activeTab === 'blocks' && strategy.strategy_blocks && (
            <NeonCard>
              <h2 className="text-xl font-display font-semibold text-white mb-4">
                Block Layout
              </h2>
              <div className="bg-[#0B0B0C] border border-[#1e1f22] rounded-lg p-4">
                <pre className="text-sm text-[#A9A9B3] font-mono overflow-x-auto">
                  {JSON.stringify(strategy.strategy_blocks, null, 2)}
                </pre>
              </div>
            </NeonCard>
          )}

          {activeTab === 'json' && strategy.strategy_json && (
            <NeonCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-white">
                  JSON Schema
                </h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(strategy.strategy_json, null, 2));
                  }}
                  className="px-3 py-1 bg-[#1e1f22] text-[#7CFF4F] text-sm font-sans rounded hover:bg-[#252628] transition-colors"
                >
                  Export JSON
                </button>
              </div>
              <pre className="bg-[#0B0B0C] border border-[#1e1f22] rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-[#A9A9B3] font-mono">
                  {JSON.stringify(strategy.strategy_json, null, 2)}
                </code>
              </pre>
            </NeonCard>
          )}

          {activeTab === 'backtests' && (
            <NeonCard>
              <h2 className="text-xl font-display font-semibold text-white mb-4">
                Backtests
              </h2>
              <p className="text-[#A9A9B3] font-sans">
                Backtest results will be displayed here. Run a backtest to see performance metrics.
              </p>
            </NeonCard>
          )}
        </div>

        {/* Author Panel */}
        {strategy.user && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <UserProfilePanel user={strategy.user} isOwnProfile={isOwner} />
            </div>
            <div className="md:col-span-2">
              <StrategyCommentSection strategyId={strategyId} userId={user?.id || null} />
            </div>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

