import { createClient } from '@supabase/supabase-js';

// Get environment variables - these should be available at build time for Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  const configured = !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseUrl !== '' &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey !== 'placeholder-key' &&
    supabaseAnonKey !== '');
  
  return configured;
};

// Create a client with better error handling
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Don't persist session for wallet-based auth
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'tradeiq-web',
        },
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Log configuration status in development
if (typeof window !== 'undefined') {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    console.warn('Current values:', {
      url: supabaseUrl || 'MISSING',
      key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    });
  } else {
    console.log('✅ Supabase configured:', supabaseUrl);
  }
}

