'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { useAuthStore } from '@/stores/authStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { StrategyIDE } from '@/components/ide/StrategyIDE';

export default function StrategyIDEPage() {
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { connected, connecting } = useWalletSafe();
  const { user, fetchUser } = useAuthStore();
  const { currentStrategy, setCurrentStrategy, fetchStrategies } = useStrategyStore();
  const strategyId = params?.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication
  useEffect(() => {
    if (!mounted) return;
    
    const checkAuth = setTimeout(() => {
      setCheckingAuth(false);
      if (!connected && !connecting) {
        router.replace('/');
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [mounted, connected, connecting, router]);

  // Fetch user and strategy
  useEffect(() => {
    if (!mounted || checkingAuth) return;
    if (connected && !connecting) {
      const loadData = async () => {
        try {
          await fetchUser();
          if (user?.id) {
            await fetchStrategies(user.id);
            // Find and set current strategy
            const { strategies } = useStrategyStore.getState();
            const strategy = strategies.find(s => s.id === strategyId);
            if (strategy) {
              setCurrentStrategy(strategy);
            } else {
              // Strategy not found or not owned by user
              router.replace('/dashboard');
            }
          }
        } catch (error) {
          console.error('Failed to load strategy:', error);
          router.replace('/dashboard');
        }
      };
      loadData();
    }
  }, [mounted, checkingAuth, connected, connecting, user?.id, strategyId, fetchUser, fetchStrategies, setCurrentStrategy, router]);

  // Show loading state
  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-center">
          <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
          <p className="text-[#A9A9B3] font-mono text-sm">Loading IDE...</p>
        </div>
      </div>
    );
  }

  // Redirect if not connected
  if (!connected) {
    return null;
  }

  // Show loading while fetching strategy
  if (!currentStrategy) {
    return (
      <LayoutShell>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
            <p className="text-[#A9A9B3] font-mono">Loading strategy...</p>
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

