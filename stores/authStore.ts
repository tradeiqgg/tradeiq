import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  publicKey: PublicKey | null;
  isLoading: boolean;
  setPublicKey: (publicKey: PublicKey | null) => void;
  signIn: (publicKey: PublicKey, signature: Uint8Array) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  publicKey: null,
  isLoading: false,

  setPublicKey: (publicKey) => {
    const currentPublicKey = get().publicKey;
    const publicKeyString = publicKey?.toBase58();
    const currentPublicKeyString = currentPublicKey?.toBase58();
    
    // FIXED: Only update if publicKey actually changed to prevent infinite loops
    if (publicKeyString === currentPublicKeyString) {
      return;
    }
    
    console.log('setPublicKey called:', publicKeyString || 'null');
    set({ publicKey });
    
    if (publicKey) {
      // Fetch user asynchronously, but only if we don't already have a user for this key
      const currentUser = get().user;
      if (!currentUser || currentUser.wallet_address !== publicKeyString) {
        setTimeout(() => {
          get().fetchUser().catch((err) => {
            console.error('Error in fetchUser from setPublicKey:', err);
          });
        }, 100);
      }
    } else {
      // Clear user when publicKey is cleared
      set({ user: null });
    }
  },

  signIn: async (publicKey, signature) => {
    set({ isLoading: true });
    try {
      const walletAddress = publicKey.toBase58();
      
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        set({ user: existingUser as User });
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            fake_balance: 1000,
            tier: 'free',
          })
          .select()
          .single();

        if (error) throw error;
        set({ user: newUser as User });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ user: null, publicKey: null });
  },

  fetchUser: async () => {
    const { publicKey } = get();
    if (!publicKey) {
      console.log('fetchUser: No publicKey available');
      return;
    }

    // Check if Supabase is configured before attempting to fetch
    if (!isSupabaseConfigured()) {
      console.error('fetchUser: Cannot fetch user - Supabase is not configured');
      console.error('Please create .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.error('See LOCAL_ENV_SETUP.md for instructions');
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    
    try {
      const walletAddress = publicKey.toBase58();
      console.log('fetchUser: Fetching user for wallet:', walletAddress);
      
      // Simple query without complex timeout logic
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (error) {
        // PGRST116 means no rows found, which is OK
        if (error.code !== 'PGRST116') {
          console.error('fetchUser: Query error:', error);
          throw error;
        }
      }

      if (!data) {
        // User doesn't exist, create new one
        console.log('fetchUser: User not found, creating new user...');
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            fake_balance: 1000,
            tier: 'free',
          })
          .select()
          .single();

        if (insertError) {
          console.error('fetchUser: Insert error:', insertError);
          throw insertError;
        }
        
        console.log('fetchUser: New user created:', newUser);
        set({ user: newUser as User, isLoading: false });
        return;
      }

      console.log('fetchUser: User found:', data);
      const userData = data as User;
      set({ user: userData, isLoading: false });
      
      // Check if username is missing and redirect to setup
      if (!userData.username || userData.username.trim() === '') {
        // Don't redirect here - let the page component handle it
        // This prevents infinite redirect loops
      }
    } catch (error: any) {
      console.error('fetchUser: Error:', error);
      // Always clear loading state, even on error
      set({ isLoading: false });
      
      // If it's a network error, try one more time after a delay
      if (error?.message?.includes('fetch') || error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
        console.log('fetchUser: Network error detected, retrying once...');
        setTimeout(async () => {
          try {
            const walletAddress = get().publicKey?.toBase58();
            if (!walletAddress) return;
            
            const { data, error: retryError } = await supabase
              .from('users')
              .select('*')
              .eq('wallet_address', walletAddress)
              .maybeSingle();

            if (retryError && retryError.code !== 'PGRST116') {
              console.error('fetchUser: Retry failed:', retryError);
              return;
            }

            if (!data) {
              // Try to create user
              const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                  wallet_address: walletAddress,
                  fake_balance: 1000,
                  tier: 'free',
                })
                .select()
                .single();

              if (insertError) {
                console.error('fetchUser: Retry insert failed:', insertError);
                return;
              }
              
              set({ user: newUser as User, isLoading: false });
              return;
            }

            set({ user: data as User, isLoading: false });
          } catch (retryErr) {
            console.error('fetchUser: Retry error:', retryErr);
          }
        }, 2000);
      }
    }
  },
}));
