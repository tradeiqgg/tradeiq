'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LayoutShell } from '@/components/LayoutShell';
import { UserProfilePanel } from '@/components/profiles';
import { StrategyGallery } from '@/components/strategyLibrary';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { User, Strategy } from '@/types';

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuthStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [activeTab, setActiveTab] = useState<'strategies' | 'liked' | 'forks' | 'competitions' | 'about'>('strategies');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!username) return;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Fetch user by username or wallet address
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq.${username},wallet_address.eq.${username}`)
          .maybeSingle();

        if (userError) throw userError;
        if (!userData) {
          setIsLoading(false);
          return;
        }

        setUser(userData as User);

        // Check if current user is following
        if (currentUser?.id && currentUser.id !== userData.id) {
          const { data: followData } = await supabase
            .from('user_following')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('followed_id', userData.id)
            .maybeSingle();
          
          setIsFollowing(!!followData);
        }

        // Load public strategies
        const { data: strategiesData, error: strategiesError } = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', userData.id)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (strategiesError) throw strategiesError;
        setStrategies((strategiesData || []) as Strategy[]);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username, currentUser?.id]);

  const handleFollow = async () => {
    if (!currentUser?.id || !user?.id) return;

    try {
      if (isFollowing) {
        await supabase
          .from('user_following')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('followed_id', user.id);
        setIsFollowing(false);
      } else {
        await supabase
          .from('user_following')
          .insert({
            follower_id: currentUser.id,
            followed_id: user.id,
          });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="terminal-spinner text-[#7CFF4F] text-2xl mb-4" />
            <p className="text-[#A9A9B3] font-mono">Loading profile...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  if (!user) {
    return (
      <LayoutShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#A9A9B3] font-sans text-lg">User not found</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <UserProfilePanel
          user={user}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onUnfollow={handleFollow}
        />

        {/* Tabs */}
        <div className="border-b border-[#1e1f22]">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'strategies', label: 'Strategies' },
              { id: 'liked', label: 'Liked' },
              { id: 'forks', label: 'Forks' },
              { id: 'competitions', label: 'Competitions' },
              { id: 'about', label: 'About' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-4 py-3 font-sans text-sm font-medium transition-colors whitespace-nowrap
                  border-b-2
                  ${activeTab === tab.id
                    ? 'border-[#7CFF4F] text-[#7CFF4F]'
                    : 'border-transparent text-[#A9A9B3] hover:text-white'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'strategies' && (
            <StrategyGallery
              strategies={strategies}
              emptyMessage="No public strategies yet"
            />
          )}

          {activeTab === 'liked' && (
            <div className="text-center py-12">
              <p className="text-[#A9A9B3] font-sans">Liked strategies coming soon</p>
            </div>
          )}

          {activeTab === 'forks' && (
            <div className="text-center py-12">
              <p className="text-[#A9A9B3] font-sans">Forked strategies coming soon</p>
            </div>
          )}

          {activeTab === 'competitions' && (
            <div className="text-center py-12">
              <p className="text-[#A9A9B3] font-sans">Competition entries coming soon</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              {user.bio && (
                <div className="bg-[#111214] border border-[#1e1f22] rounded-lg p-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-3">
                    About
                  </h2>
                  <p className="text-[#A9A9B3] font-sans leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}

