'use client';

import { supabase } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Universal authenticated Supabase fetch wrapper
 * Ensures auth token is always attached to requests in production
 * This fixes 406/460 errors from Supabase RLS policies
 */
export async function authFetch<T>(
  fn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    // Get current session with auth token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('authFetch: Failed to get session:', sessionError);
    }

    // If we have a session token, create authenticated client
    if (session?.access_token) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('authFetch: Missing Supabase env vars, using default client');
        return fn(supabase);
      }

      // Create authenticated client with token in headers
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      return fn(authClient);
    }

    // No session, use default client (for public queries)
    return fn(supabase);
  } catch (error) {
    console.error('authFetch: Error:', error);
    // Fallback to default client on error
    return fn(supabase);
  }
}

