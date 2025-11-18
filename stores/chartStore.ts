import { create } from 'zustand';

export type ChartMode = 'stocks' | 'crypto' | 'memecoins';

interface ChartStore {
  mode: ChartMode;
  setMode: (mode: ChartMode) => void;
  stocksSymbol: string;
  cryptoSymbol: string;
  memecoinCA: string;
  setStocksSymbol: (symbol: string) => void;
  setCryptoSymbol: (symbol: string) => void;
  setMemecoinCA: (ca: string) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  mode: 'crypto',
  setMode: (mode) => set({ mode }),
  stocksSymbol: '',
  cryptoSymbol: 'SOL',
  memecoinCA: '',
  setStocksSymbol: (symbol) => set({ stocksSymbol: symbol }),
  setCryptoSymbol: (symbol) => set({ cryptoSymbol: symbol }),
  setMemecoinCA: (ca) => set({ memecoinCA: ca }),
}));

