'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { useAuthStore } from '@/stores/authStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { StrategyCard } from '@/components/StrategyCard';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { connected, connecting, publicKey } = useWalletSafe();
  const router = useRouter();
  const { user, fetchUser, isLoading: authLoading, setPublicKey } = useAuthStore();
  const { strategies, fetchStrategies, isLoading: strategiesLoading, createStrategy } = useStrategyStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication and redirect if not connected
  useEffect(() => {
    if (!mounted) return;
    
    // Wait a moment for wallet adapter to check for existing connections
    const checkAuth = setTimeout(() => {
      setCheckingAuth(false);
      if (!connected && !connecting) {
        // Not connected - redirect to landing page
        router.replace('/');
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [mounted, connected, connecting, router]);

  // Redirect to username setup if user doesn't have a username
  useEffect(() => {
    if (!mounted || checkingAuth || authLoading) return;
    if (connected && user && !user.username) {
      router.replace('/setup-username');
    }
  }, [mounted, checkingAuth, authLoading, connected, user, router]);

  // FIXED: Set publicKey once and let setPublicKey handle fetchUser to prevent duplicate calls
  useEffect(() => {
    if (!mounted || checkingAuth) return;
    if (connected && publicKey) {
      const currentPublicKey = useAuthStore.getState().publicKey;
      // Only update if publicKey actually changed
      if (!currentPublicKey || currentPublicKey.toBase58() !== publicKey.toBase58()) {
        console.log('Dashboard: Setting publicKey in auth store');
        setPublicKey(publicKey);
        // setPublicKey will handle fetchUser internally, so we don't need a separate useEffect
      }
    }
  }, [connected, publicKey, mounted, checkingAuth, setPublicKey]);

  // Redirect to username setup if user doesn't have username
  useEffect(() => {
    if (!mounted || checkingAuth || authLoading) return;
    if (user && (!user.username || user.username.trim() === '')) {
      router.replace('/setup-username');
    }
  }, [user, mounted, checkingAuth, authLoading, router]);

  // Fetch strategies when user is loaded
  useEffect(() => {
    if (user?.id) {
      fetchStrategies(user.id);
    }
  }, [user?.id, fetchStrategies]);

  // Show loading state while checking authentication
  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="terminal-spinner text-primary text-2xl mb-4" />
          <p className="text-muted-foreground font-mono text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not connected
  if (!connected) {
    return null; // Will redirect
  }

  // Show loading state while fetching user
  if (authLoading) {
    return (
      <LayoutShell>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="terminal-spinner text-primary text-2xl mb-4" />
            <p className="text-muted-foreground font-mono">Loading user data...</p>
            <p className="text-muted-foreground/50 font-mono text-xs mt-2">Connecting to database...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  // If not loading but no user, show error or retry option
  if (!user && !authLoading) {
    const supabaseConfigured = isSupabaseConfigured();
    return (
      <LayoutShell>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12 terminal-panel">
            <p className="text-destructive mb-4 font-mono">Failed to load user data</p>
            {!supabaseConfigured && (
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm mb-2 font-mono">
                  ⚠️ Supabase not configured for local development
                </p>
                <p className="text-muted-foreground text-xs mb-2">
                  Create a <code className="text-[#7CFF4F]">.env.local</code> file with your Supabase credentials
                </p>
                <p className="text-muted-foreground text-xs">
                  See <code className="text-[#7CFF4F]">LOCAL_ENV_SETUP.md</code> for instructions
                </p>
              </div>
            )}
            <button
              onClick={() => fetchUser()}
              className="terminal-button"
              disabled={!supabaseConfigured}
            >
              {supabaseConfigured ? 'RETRY' : 'SUPABASE NOT CONFIGURED'}
            </button>
          </div>
        </div>
      </LayoutShell>
    );
  }

  const handleCreateStrategy = async () => {
    if (!user?.id) return;
    
    try {
      const newStrategy = await createStrategy({
        user_id: user.id,
        title: 'Untitled Strategy',
        raw_prompt: '',
        json_logic: {},
        block_schema: {},
        pseudocode: '',
      });
      router.push(`/strategy/${newStrategy.id}`);
    } catch (error) {
      console.error('Failed to create strategy:', error);
    }
  };

  return (
    <LayoutShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-display font-semibold text-white mb-2">Dashboard</h1>
              <p className="text-base text-[#A9A9B3] font-sans">
                Your strategies
              </p>
            </div>
            <button
              onClick={handleCreateStrategy}
              disabled={strategiesLoading}
              className="btn-primary"
            >
              + New Strategy
            </button>
          </div>
        </div>

        <div>

          {strategiesLoading ? (
            <div className="text-center py-12 text-[#A9A9B3] font-sans">
              <span className="terminal-spinner" /> Loading strategies...
            </div>
          ) : strategies.length === 0 ? (
            <div className="text-center py-12 bg-[#111214] border border-[#1e1f22] rounded-lg">
              <p className="text-[#A9A9B3] mb-4 font-sans">No strategies yet</p>
              <button
                onClick={handleCreateStrategy}
                disabled={strategiesLoading}
                className="btn-primary"
              >
                Create Your First Strategy
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategies.map((strategy, idx) => (
                <ScrollReveal key={strategy.id} direction="up" delay={idx * 50}>
                  <StrategyCard strategy={strategy} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}

