'use client';

import { browserClient } from './browserClient';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Universal authenticated Supabase fetch wrapper
 * Uses browser client with proper session persistence
 * Ensures auth token is always attached to requests in production
 * This fixes 406/460 errors from Supabase RLS policies
 */
export async function authFetch<T>(
  fn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    // FIXED: Always get fresh session to ensure token is current
    // This is critical for Vercel production where sessions might not persist
    const { data: { session }, error: sessionError } = await browserClient.auth.getSession();
    
    if (sessionError) {
      console.warn('authFetch: Failed to get session:', sessionError);
    }

    // Browser client automatically includes auth token in requests when session exists
    // The session is restored from localStorage/IndexedDB on page load
    // With persistSession: true, the client handles session restoration automatically
    const client = browserClient;
    
    // If we have a session, ensure it's active (browserClient should handle this automatically)
    // But we can explicitly set it to be sure
    if (session?.access_token) {
      // Session exists, browserClient will use it automatically
      // But we can verify by checking if we need to set it
      try {
        await client.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token || '',
        });
      } catch (setError) {
        // Session might already be set, that's fine
        console.debug('authFetch: Session already set or error setting:', setError);
      }
    }

    return fn(client);
  } catch (error) {
    console.error('authFetch: Error:', error);
    // Fallback to browser client on error
    return fn(browserClient);
  }
}

