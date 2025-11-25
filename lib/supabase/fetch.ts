'use client';

import { supabase } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get authenticated Supabase client with session token
 * This ensures RLS policies work correctly
 */
export async function getAuthenticatedClient(): Promise<SupabaseClient> {
  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.warn('Failed to get session:', error);
  }

  // If we have a session, create a new client with the access token
  if (session?.access_token) {
    // Create a new client instance with the access token in headers
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    return createClient(supabaseUrl, supabaseAnonKey, {
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
  }

  // Return default client if no session
  return supabase;
}

/**
 * Execute a Supabase query with authentication
 */
export async function sbFetch<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  const client = await getAuthenticatedClient();
  return queryFn(client);
}

