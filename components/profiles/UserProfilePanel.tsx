'use client';

import { NeonCard } from '@/components/ui/NeonCard';
import type { User } from '@/types';
import Image from 'next/image';

interface UserProfilePanelProps {
  user: User;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export function UserProfilePanel({
  user,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
}: UserProfilePanelProps) {
  const displayName = user.username || user.wallet_address?.slice(0, 8) || 'Anonymous';
  const joinedDate = user.joined_at 
    ? new Date(user.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  return (
    <NeonCard className="space-y-6">
      {/* Avatar and Basic Info */}
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#7CFF4F]/30 bg-[#1e1f22]">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#7CFF4F]">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-display font-semibold text-white mb-1">
            {displayName}
          </h2>
          {user.wallet_address && (
            <p className="text-xs text-[#A9A9B3] font-mono mb-2">
              {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
            </p>
          )}
          {joinedDate && (
            <p className="text-xs text-[#A9A9B3]">
              Joined {joinedDate}
            </p>
          )}
        </div>

        {!isOwnProfile && (
          <button
            onClick={isFollowing ? onUnfollow : onFollow}
            className={`
              px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all
              ${isFollowing
                ? 'bg-[#1e1f22] text-[#A9A9B3] border border-[#1e1f22] hover:border-[#7CFF4F]/40'
                : 'bg-[#7CFF4F] text-[#0B0B0C] hover:bg-[#70e84b]'
              }
            `}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <div>
          <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
            {user.bio}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1e1f22]">
        <div className="text-center">
          <div className="text-2xl font-display font-bold text-[#7CFF4F]">
            {user.followers_count || 0}
          </div>
          <div className="text-xs text-[#A9A9B3] mt-1">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-display font-bold text-[#7CFF4F]">
            {user.following_count || 0}
          </div>
          <div className="text-xs text-[#A9A9B3] mt-1">Following</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-display font-bold text-[#7CFF4F]">
            {user.builder_xp || 0}
          </div>
          <div className="text-xs text-[#A9A9B3] mt-1">Builder XP</div>
        </div>
      </div>

      {/* Social Links */}
      {user.social_links && Object.keys(user.social_links).length > 0 && (
        <div className="pt-4 border-t border-[#1e1f22]">
          <div className="flex flex-wrap gap-2">
            {Object.entries(user.social_links).map(([platform, url]) => (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#7CFF4F] hover:text-[#70e84b] font-sans transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {user.achievements && user.achievements.length > 0 && (
        <div className="pt-4 border-t border-[#1e1f22]">
          <h3 className="text-sm font-display font-semibold text-white mb-2">
            Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.achievements.map((achievement: any, idx: number) => (
              <div
                key={idx}
                className="px-2 py-1 bg-[#1e1f22] rounded text-xs text-[#A9A9B3] font-sans"
              >
                {achievement.name || achievement}
              </div>
            ))}
          </div>
        </div>
      )}
    </NeonCard>
  );
}

