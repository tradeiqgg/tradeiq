'use client';

import { LayoutShell } from '@/components/LayoutShell';
import { CommunityChatPanel } from '@/components/community/CommunityChatPanel';
import { useAuthStore } from '@/stores/authStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CommunityPage() {
  const { connected } = useWalletSafe();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!connected) {
      router.replace('/');
    }
  }, [connected, router]);

  if (!connected) {
    return null; // Will redirect
  }

  return (
    <LayoutShell>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <CommunityChatPanel />
      </div>
    </LayoutShell>
  );
}

