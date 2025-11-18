import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Competition, CompetitionEntry } from '@/types';

interface CompetitionState {
  competitions: Competition[];
  entries: CompetitionEntry[];
  isLoading: boolean;
  fetchCompetitions: () => Promise<void>;
  fetchEntries: (competitionId: string) => Promise<void>;
  joinCompetition: (competitionId: string, strategyId: string, userId: string) => Promise<void>;
}

export const useCompetitionStore = create<CompetitionState>((set) => ({
  competitions: [],
  entries: [],
  isLoading: false,

  fetchCompetitions: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      set({ competitions: (data || []) as Competition[] });
    } catch (error) {
      console.error('Fetch competitions error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEntries: async (competitionId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('competition_entries')
        .select('*')
        .eq('competition_id', competitionId)
        .order('pnl', { ascending: false });

      if (error) throw error;
      set({ entries: (data || []) as CompetitionEntry[] });
    } catch (error) {
      console.error('Fetch entries error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  joinCompetition: async (competitionId: string, strategyId: string, userId: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from('competition_entries').insert({
        competition_id: competitionId,
        strategy_id: strategyId,
        user_id: userId,
        pnl: 0,
        rank: 0,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Join competition error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

