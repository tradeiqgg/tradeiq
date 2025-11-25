'use client';

import { useState, useEffect, useCallback } from 'react';
import { NeonCard } from '@/components/ui/NeonCard';
import type { StrategyComment } from '@/types';

interface StrategyCommentSectionProps {
  strategyId: string;
  userId: string | null;
}

export function StrategyCommentSection({
  strategyId,
  userId,
}: StrategyCommentSectionProps) {
  const [comments, setComments] = useState<StrategyComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/strategy/comment?strategyId=${strategyId}`);
      if (response.ok) {
        const { comments: data } = await response.json();
        setComments(data || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [strategyId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/strategy/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId,
          userId,
          message: newComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const { comment } = await response.json();
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {userId && (
        <NeonCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-[#0B0B0C] border border-[#1e1f22] rounded-lg p-4 text-white font-sans text-sm placeholder-[#A9A9B3] focus:outline-none focus:border-[#7CFF4F]/40 resize-none"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-[#7CFF4F] text-[#0B0B0C] rounded-lg font-sans text-sm font-medium hover:bg-[#70e84b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </NeonCard>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-[#A9A9B3] font-sans">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-[#A9A9B3] font-sans">No comments yet. Be the first!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <NeonCard key={comment.id}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e1f22] flex items-center justify-center text-sm text-[#7CFF4F] font-display font-semibold">
                  {comment.user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-display font-semibold text-white">
                      {comment.user?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-[#A9A9B3] font-sans">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
                    {comment.message}
                  </p>
                </div>
              </div>
            </NeonCard>
          ))}
        </div>
      )}
    </div>
  );
}

