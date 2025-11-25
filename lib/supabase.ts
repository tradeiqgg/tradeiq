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
    console.error('❌ Supabase not configured for local development!');
    console.error('⚠️  You are seeing this because environment variables are missing.');
    console.error('📝 To fix: Create a `.env.local` file in the project root with:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
    console.error('📖 See LOCAL_ENV_SETUP.md for detailed instructions');
    console.error('Current values:', {
      url: supabaseUrl || 'MISSING (using placeholder)',
      key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING (using placeholder)',
    });
    console.error('🔗 Get your credentials from: https://app.supabase.com/project/_/settings/api');
    console.error('   OR copy from Vercel: https://vercel.com/tradeiqs-projects/tradeiq/settings/environment-variables');
  } else {
    console.log('✅ Supabase configured:', supabaseUrl);
  }
}

