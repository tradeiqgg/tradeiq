import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Backtest } from '@/types';

interface BacktestState {
  backtests: Backtest[];
  currentBacktest: Backtest | null;
  isLoading: boolean;
  fetchBacktests: (userId: string) => Promise<void>;
  createBacktest: (backtest: Partial<Backtest>) => Promise<Backtest>;
  runBacktest: (strategyId: string, chartAsset: string, userId: string) => Promise<Backtest>;
}

export const useBacktestStore = create<BacktestState>((set) => ({
  backtests: [],
  currentBacktest: null,
  isLoading: false,

  fetchBacktests: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('backtests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ backtests: (data || []) as Backtest[] });
    } catch (error) {
      console.error('Fetch backtests error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createBacktest: async (backtest: Partial<Backtest>) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('backtests')
        .insert(backtest)
        .select()
        .single();

      if (error) throw error;
      const newBacktest = data as Backtest;
      set((state) => ({
        backtests: [newBacktest, ...state.backtests],
        currentBacktest: newBacktest,
      }));
      return newBacktest;
    } catch (error) {
      console.error('Create backtest error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  runBacktest: async (strategyId: string, chartAsset: string, userId: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual backtest logic with AI strategy execution
      // For now, return a mock backtest
      const mockBacktest: Partial<Backtest> = {
        user_id: userId,
        strategy_id: strategyId,
        chart_asset: chartAsset,
        pnl: Math.random() * 1000 - 500,
        trades: [],
      };

      const { data, error } = await supabase
        .from('backtests')
        .insert(mockBacktest)
        .select()
        .single();

      if (error) throw error;
      const newBacktest = data as Backtest;
      set((state) => ({
        backtests: [newBacktest, ...state.backtests],
        currentBacktest: newBacktest,
      }));
      return newBacktest;
    } catch (error) {
      console.error('Run backtest error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

