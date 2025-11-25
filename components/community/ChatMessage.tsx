'use client';

import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    user_id: string;
    username: string;
    message: string;
    created_at: string;
  };
  currentUserId: string;
}

export function ChatMessage({ message, currentUserId }: ChatMessageProps) {
  const isOwnMessage = message.user_id === currentUserId;
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwnMessage
            ? 'bg-[#7CFF4F]/20 border border-[#7CFF4F]/40'
            : 'bg-[#111214] border border-[#1e1f22]'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-sm font-semibold ${
              isOwnMessage ? 'text-[#7CFF4F]' : 'text-white'
            }`}
          >
            {message.username}
          </span>
          <span className="text-xs text-[#6f7177]">{timeAgo}</span>
        </div>
        <p className="text-sm text-[#A9A9B3] font-sans whitespace-pre-wrap">
          {message.message}
        </p>
      </div>
    </div>
  );
}

