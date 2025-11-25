import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Strategy } from '@/types';
import { createDefaultStrategy } from '@/lib/tql/defaultStrategy';

interface StrategyState {
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  isLoading: boolean;
  fetchStrategies: (userId: string) => Promise<void>;
  createStrategy: (strategy: Partial<Strategy>) => Promise<Strategy>;
  updateStrategy: (id: string, updates: Partial<Strategy>) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
  setCurrentStrategy: (strategy: Strategy | null) => void;
}

export const useStrategyStore = create<StrategyState>((set, get) => ({
  strategies: [],
  currentStrategy: null,
  isLoading: false,

  fetchStrategies: async (userId: string) => {
    set({ isLoading: true });
    
    try {
      console.log('fetchStrategies: Fetching strategies for user:', userId);
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('fetchStrategies: Error:', error);
        throw error;
      }

      console.log('fetchStrategies: Found strategies:', data?.length || 0);
      set({ strategies: (data || []) as Strategy[], isLoading: false });
    } catch (error: any) {
      console.error('fetchStrategies: Failed:', error);
      set({ isLoading: false });
      
      // If network error, try once more after delay
      if (error?.message?.includes('fetch') || error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
        console.log('fetchStrategies: Network error, retrying once...');
        setTimeout(async () => {
          try {
            const { data, error: retryError } = await supabase
              .from('strategies')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });

            if (retryError) {
              console.error('fetchStrategies: Retry failed:', retryError);
              return;
            }

            set({ strategies: (data || []) as Strategy[] });
          } catch (retryErr) {
            console.error('fetchStrategies: Retry error:', retryErr);
          }
        }, 2000);
      }
    }
  },

  createStrategy: async (strategy: Partial<Strategy>) => {
    set({ isLoading: true });
    try {
      // Ensure strategy has valid TQ-JSS structure
      const defaultTQJSS = createDefaultStrategy(strategy.title || 'Untitled Strategy');
      
      // Merge provided strategy data with default structure
      const strategyToCreate: Partial<Strategy> = {
        ...strategy,
        // Ensure strategy_json exists with valid structure
        strategy_json: strategy.strategy_json || defaultTQJSS,
        json_logic: strategy.json_logic || defaultTQJSS,
        // Ensure required fields exist
        title: strategy.title || 'Untitled Strategy',
        raw_prompt: strategy.raw_prompt || '',
        block_schema: strategy.block_schema || { blocks: [] },
        pseudocode: strategy.pseudocode || '',
      };

      const { data, error } = await supabase
        .from('strategies')
        .insert(strategyToCreate)
        .select()
        .single();

      if (error) throw error;
      const newStrategy = data as Strategy;
      set((state) => ({
        strategies: [newStrategy, ...state.strategies],
        currentStrategy: newStrategy,
      }));
      return newStrategy;
    } catch (error) {
      console.error('Create strategy error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStrategy: async (id: string, updates: Partial<Strategy>) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('strategies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updated = data as Strategy;
      set((state) => ({
        strategies: state.strategies.map((s) => (s.id === id ? updated : s)),
        currentStrategy: state.currentStrategy?.id === id ? updated : state.currentStrategy,
      }));
    } catch (error) {
      console.error('Update strategy error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStrategy: async (id: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from('strategies').delete().eq('id', id);

      if (error) throw error;
      set((state) => ({
        strategies: state.strategies.filter((s) => s.id !== id),
        currentStrategy: state.currentStrategy?.id === id ? null : state.currentStrategy,
      }));
    } catch (error) {
      console.error('Delete strategy error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentStrategy: (strategy) => {
    set({ currentStrategy: strategy });
  },
}));

