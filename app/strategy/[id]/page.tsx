'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { useAuthStore } from '@/stores/authStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { StrategyIDE } from '@/components/ide/StrategyIDE';
import { fetchStrategy } from '@/lib/cloud/strategySync';
import PublicStrategyView from './PublicStrategyView';
import type { Strategy } from '@/types';

export default function StrategyIDEPage() {
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { connected, connecting } = useWalletSafe();
  const { user, fetchUser } = useAuthStore();
  const { currentStrategy, setCurrentStrategy, fetchStrategies } = useStrategyStore();
  const strategyId = params?.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication and determine view mode
  useEffect(() => {
    if (!mounted || !strategyId) return;
    
    const checkStrategy = async () => {
      try {
        // Try to fetch as public first
        const publicStrategy = await fetchStrategy(strategyId);
        
        if (publicStrategy) {
          // Check if user owns it
          if (connected && user?.id) {
            await fetchUser();
            if (user?.id === publicStrategy.user_id) {
              // User owns it, show IDE
              await fetchStrategies(user.id);
              const { strategies } = useStrategyStore.getState();
              const strategy = strategies.find(s => s.id === strategyId);
              if (strategy) {
                setCurrentStrategy(strategy);
                setIsPublicView(false);
              } else {
                setIsPublicView(true);
              }
            } else {
              // Public strategy, show public view
              setIsPublicView(true);
            }
          } else {
            // Not logged in, show public view if public
            if (publicStrategy.visibility === 'public' || publicStrategy.visibility === 'unlisted') {
              setIsPublicView(true);
            } else {
              router.replace('/');
            }
          }
        } else {
          // Not found as public, try as owner
          if (connected && user?.id) {
            await fetchUser();
            await fetchStrategies(user.id);
            const { strategies } = useStrategyStore.getState();
            const strategy = strategies.find(s => s.id === strategyId);
            if (strategy) {
              setCurrentStrategy(strategy);
              setIsPublicView(false);
            } else {
              router.replace('/dashboard');
            }
          } else {
            router.replace('/');
          }
        }
      } catch (error) {
        console.error('Failed to load strategy:', error);
        router.replace('/dashboard');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkStrategy();
  }, [mounted, strategyId, connected, user?.id, fetchUser, fetchStrategies, setCurrentStrategy, router]);

  // Show loading state
  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-center">
          <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
          <p className="text-[#A9A9B3] font-mono text-sm">Loading strategy...</p>
        </div>
      </div>
    );
  }

  // Show public view
  if (isPublicView) {
    return <PublicStrategyView strategyId={strategyId} />;
  }

  // Show IDE for owner
  if (!currentStrategy) {
    return (
      <LayoutShell>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
            <p className="text-[#A9A9B3] font-mono">Loading IDE...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <StrategyIDE strategy={currentStrategy} />
    </LayoutShell>
  );
}

