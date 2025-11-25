'use client';

import { useParams } from 'next/navigation';
import ClientStrategyPage from '@/components/strategy/ClientStrategyPage';

// CRITICAL: Force this route to be client-only to prevent SSR on Vercel
// This prevents 406 errors from Supabase RLS when session is not available during SSR
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * Thin wrapper that ensures Strategy page is 100% client-side rendered
 * This prevents Vercel from doing SSR which causes Supabase 406 errors
 */
export default function StrategyIDEPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return null;
  }

  return <ClientStrategyPage id={id} />;
}
