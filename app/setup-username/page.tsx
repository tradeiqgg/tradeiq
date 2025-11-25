'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { useAuthStore } from '@/stores/authStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { supabase } from '@/lib/supabase';

export default function SetupUsernamePage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const { connected } = useWalletSafe();

  useEffect(() => {
    // Redirect if not connected
    if (!connected) {
      router.replace('/');
      return;
    }

    // Redirect if user already has username
    if (user?.username) {
      router.replace('/dashboard');
      return;
    }
  }, [connected, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!user?.id) {
      setError('User not found. Please connect your wallet.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        setError('Username is already taken');
        setIsLoading(false);
        return;
      }

      // Update user with username
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: username.toLowerCase() })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh user data
      await fetchUser();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Username setup error:', err);
      setError(err.message || 'Failed to set username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected || user?.username) {
    return null; // Will redirect
  }

  return (
    <LayoutShell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#111214] border border-[#1e1f22] rounded-lg p-8">
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            Choose Your Username
          </h1>
          <p className="text-[#A9A9B3] font-sans mb-6">
            Pick a unique username to get started on TradeIQ
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-mono uppercase tracking-wider text-[#7CFF4F] mb-2">
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="your_username"
                className="w-full px-4 py-3 bg-[#0B0B0C] border border-[#1e1f22] text-white font-mono rounded-lg focus:outline-none focus:border-[#7CFF4F] focus:ring-1 focus:ring-[#7CFF4F]"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 font-sans">{error}</p>
              )}
              <p className="mt-2 text-xs text-[#6f7177] font-sans">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full px-4 py-3 bg-[#7CFF4F] text-[#0B0B0C] rounded-lg font-sans font-semibold hover:bg-[#70e84b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting Username...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </LayoutShell>
  );
}

