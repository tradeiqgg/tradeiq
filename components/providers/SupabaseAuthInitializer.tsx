'use client';

import { useEffect } from 'react';
import { browserClient } from '@/lib/supabase/browserClient';

/**
 * Initializes Supabase auth session on page load
 * Forces session restoration from cookies/IndexedDB on Vercel production
 * This fixes 406 errors from Supabase RLS policies
 */
export function SupabaseAuthInitializer() {
  useEffect(() => {
    // Force session restoration on mount
    // This ensures auth tokens are loaded from persisted storage
    browserClient.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn('SupabaseAuthInitializer: Failed to restore session:', error);
      } else if (data.session) {
        console.log('SupabaseAuthInitializer: Session restored');
      }
    });
  }, []);

  return null;
}

