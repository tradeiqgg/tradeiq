'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { useAuthStore } from '@/stores/authStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { StrategyIDE } from '@/components/ide/StrategyIDE';
import { fetchStrategy } from '@/lib/cloud/strategySync';
import PublicStrategyView from '@/app/strategy/[id]/PublicStrategyView';
import StrategyBoundary from '@/components/Boundary/StrategyBoundary';
import type { Strategy } from '@/types';

interface ClientStrategyPageProps {
  id: string;
}

/**
 * Client-only Strategy page component
 * This ensures NO SSR occurs on Vercel, preventing 406 errors from Supabase RLS
 */
export default function ClientStrategyPage({ id }: ClientStrategyPageProps) {
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { connected, connecting } = useWalletSafe();
  const { user } = useAuthStore();
  const { currentStrategy, setCurrentStrategy, fetchStrategies } = useStrategyStore();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // FIXED: Wait for Supabase session to be restored before fetching
  // This prevents 406 errors in production by ensuring auth is ready
  const checkStrategy = useCallback(async () => {
    if (!mounted || !id || hasCheckedRef.current) return;
    
    // Wait for wallet connection state to stabilize
    if (connecting) {
      return; // Still connecting, wait
    }
    
    hasCheckedRef.current = true;
    
    try {
      setError(null);
      setCheckingAuth(true);
      
      // CRITICAL: Wait for Supabase session to be restored from localStorage/IndexedDB
      // This is essential for Vercel production where sessions don't persist automatically
      if (typeof window !== 'undefined') {
        const { browserClient } = await import('@/lib/supabase/browserClient');
        // Force session restoration
        const { data: { session } } = await browserClient.auth.getSession();
        
        if (session?.access_token) {
          // Session exists, ensure it's active
          await browserClient.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token || '',
          });
        }
        
        // Small delay to ensure session is fully restored
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // If connected, wait a moment for auth to be ready
      if (connected) {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          // Wait for user to be fetched
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Try to fetch as public first (works without auth)
      const publicStrategy = await fetchStrategy(id);
      
      if (publicStrategy) {
        // Check if user owns it
        if (connected) {
          const currentUser = useAuthStore.getState().user;
          if (currentUser?.id === publicStrategy.user_id) {
            // User owns it, show IDE
            await fetchStrategies(currentUser.id);
            const { strategies } = useStrategyStore.getState();
            const strategy = strategies.find(s => s.id === id);
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
            const strategy = strategies.find(s => s.id === id);
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
  }, [mounted, id, connected, connecting, router, fetchStrategies, setCurrentStrategy]);

  // FIXED: Wait for connection state to stabilize before fetching
  useEffect(() => {
    if (!mounted || !id) return;
    
    // Reset check flag when connection state changes
    if (connecting) {
      hasCheckedRef.current = false;
      return;
    }
    
    if (!hasCheckedRef.current) {
      checkStrategy();
    }
  }, [mounted, id, connected, connecting, checkStrategy]);

  // Show loading state
  if (!mounted || checkingAuth) {
    return (
      <LayoutShell>
        <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
          <div className="text-center">
            <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
            <p className="text-[#A9A9B3] font-mono text-sm">Loading strategy...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  // Show public view
  if (isPublicView) {
    return <PublicStrategyView strategyId={id} />;
  }

  // Show error state
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
      <StrategyBoundary>
        {currentStrategy && <StrategyIDE strategy={currentStrategy} />}
      </StrategyBoundary>
    </LayoutShell>
  );
}

