'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { useAuthStore } from '@/stores/authStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { StrategyIDE } from '@/components/ide/StrategyIDE';
import { fetchStrategy } from '@/lib/cloud/strategySync';
import PublicStrategyView from './PublicStrategyView';
import { ErrorBoundary } from '@/components/ide/ErrorBoundary';
import StrategyBoundary from '@/components/Boundary/StrategyBoundary';
import type { Strategy } from '@/types';

export default function StrategyIDEPage() {
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { connected, connecting } = useWalletSafe();
  const { user, fetchUser } = useAuthStore();
  const { currentStrategy, setCurrentStrategy, fetchStrategies } = useStrategyStore();
  const strategyId = params?.id as string;
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // FIXED: Wait for auth to be ready before fetching strategy
  // This prevents 406 errors from Supabase RLS in production
  const checkStrategy = useCallback(async () => {
    if (!mounted || !strategyId || hasCheckedRef.current) return;
    
    // Wait for wallet connection state to stabilize
    if (connecting) {
      return; // Still connecting, wait
    }
    
    hasCheckedRef.current = true;
    
    try {
      setError(null);
      setCheckingAuth(true);
      
      // If connected, wait a moment for auth to be ready
      if (connected) {
        // Give auth store time to fetch user if needed
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          // Wait for user to be fetched
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Try to fetch as public first (works without auth)
      const publicStrategy = await fetchStrategy(strategyId);
      
      if (publicStrategy) {
        // Check if user owns it
        if (connected) {
          const currentUser = useAuthStore.getState().user;
          if (currentUser?.id === publicStrategy.user_id) {
            // User owns it, show IDE
            await fetchStrategies(currentUser.id);
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
        if (connected) {
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            await fetchStrategies(currentUser.id);
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
        } else {
          router.replace('/');
        }
      }
    } catch (err: any) {
      console.error('Failed to load strategy:', err);
      setError(err.message || 'Failed to load strategy');
      // Don't redirect immediately, show error instead
    } finally {
      setCheckingAuth(false);
    }
  }, [mounted, strategyId, connected, connecting, router, fetchStrategies, setCurrentStrategy]);

  // FIXED: Wait for connection state to stabilize before fetching
  useEffect(() => {
    if (!mounted || !strategyId) return;
    
    // Reset check flag when connection state changes
    if (connecting) {
      hasCheckedRef.current = false;
      return;
    }
    
    if (!hasCheckedRef.current) {
      checkStrategy();
    }
  }, [mounted, strategyId, connected, connecting, checkStrategy]);

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

  if (error) {
    return (
      <LayoutShell>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 font-mono mb-4">{error}</p>
            <button
              onClick={() => {
                hasCheckedRef.current = false;
                setCheckingAuth(true);
                checkStrategy();
              }}
              className="px-4 py-2 bg-[#7CFF4F] text-[#0B0B0C] rounded-lg font-sans font-medium hover:bg-[#70e84b] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <StrategyBoundary>
        {currentStrategy ? (
          <ErrorBoundary>
            <StrategyIDE strategy={currentStrategy} />
          </ErrorBoundary>
        ) : (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
              <p className="text-[#A9A9B3] font-mono">Loading IDE...</p>
            </div>
          </div>
        )}
      </StrategyBoundary>
    </LayoutShell>
  );
}

