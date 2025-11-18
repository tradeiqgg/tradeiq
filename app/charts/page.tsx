'use client';

import { useState, useEffect } from 'react';
import { LayoutShell } from '@/components/LayoutShell';
import { TradingViewWidget } from '@/components/TradingViewWidget';
import { useAuthStore } from '@/stores/authStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useBacktestStore } from '@/stores/backtestStore';
import { useChartStore, type ChartMode } from '@/stores/chartStore';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { useRouter } from 'next/navigation';

export default function ChartsPage() {
  const [mounted, setMounted] = useState(false);
  const { connected, connecting } = useWalletSafe();
  const router = useRouter();
  const { user } = useAuthStore();
  const { strategies, fetchStrategies } = useStrategyStore();
  const { runBacktest, currentBacktest, isLoading: backtestLoading } = useBacktestStore();
  const { mode, setMode, stocksSymbol, cryptoSymbol, memecoinCA, setStocksSymbol, setCryptoSymbol, setMemecoinCA } = useChartStore();
  
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [chartLoaded, setChartLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'D' | 'W' | 'M'>('D');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!connected && !connecting) {
      router.replace('/');
      return;
    }
  }, [connected, connecting, mounted, router]);

  useEffect(() => {
    if (user?.id) {
      fetchStrategies(user.id);
    }
  }, [user?.id, fetchStrategies]);

  const handleLoadChart = async () => {
    setLoadingData(true);
    setChartLoaded(false);
    
    try {
      let symbol = '';
      let apiUrl = '';
      
      if (mode === 'stocks' && stocksSymbol) {
        symbol = stocksSymbol.toUpperCase();
        apiUrl = `/api/market/stocks?symbol=${symbol}`;
      } else if (mode === 'crypto' && cryptoSymbol) {
        symbol = cryptoSymbol.toUpperCase();
        apiUrl = `/api/market/crypto?symbol=${symbol}`;
      } else if (mode === 'memecoins' && memecoinCA) {
        symbol = memecoinCA;
        // Memecoins still use placeholder data for now
        setMetadata({
          name: 'MEME',
          ca: memecoinCA,
          price: 0.0000123,
          change: 0.000001,
          changePercent: 8.8,
          liquidity: 50000,
          volume: 100000,
          pairAddress: '0x...',
        });
        setChartLoaded(true);
        setLoadingData(false);
        return;
      } else {
        setLoadingData(false);
        return;
      }
      
      // Fetch real market data
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok || data.error) {
        const errorMessage = data.error || 'Failed to fetch market data';
        const details = data.details ? `\n\n${data.details}` : '';
        throw new Error(`${errorMessage}${details}`);
      }
      
      // Validate that we have price data
      if (!data.price || data.price === 0) {
        throw new Error(`No price data available for ${symbol}. Please check the symbol and try again.`);
      }
      
      // Set metadata with real data
      setMetadata({
        name: data.symbol || symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        marketCap: data.marketCap,
        high: data.high,
        low: data.low,
        open: data.open,
        previousClose: data.previousClose,
      });
      
      setChartLoaded(true);
    } catch (error: any) {
      console.error('Failed to load chart data:', error);
      const errorMessage = error.message || 'Failed to load market data. Please check the symbol and try again.';
      alert(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleBacktest = async () => {
    if (!selectedStrategy || !user) return;

    const symbol = mode === 'stocks' ? stocksSymbol : mode === 'crypto' ? cryptoSymbol : memecoinCA;
    if (!symbol) return;

    try {
      await runBacktest(selectedStrategy, symbol, user.id);
    } catch (error) {
      console.error('Backtest failed:', error);
    }
  };

  const handleSaveToProject = async () => {
    if (!user || !chartLoaded) return;

    const symbol = mode === 'stocks' ? stocksSymbol : mode === 'crypto' ? cryptoSymbol : memecoinCA;
    if (!symbol) return;

    try {
      // Save chart params to localStorage for now (projects table coming soon)
      const projectData = {
        user_id: user.id,
        chart_mode: mode,
        symbol: symbol,
        strategy_id: selectedStrategy || null,
        metadata: metadata,
        saved_at: new Date().toISOString(),
      };
      
      const existingProjects = JSON.parse(localStorage.getItem('user_projects') || '[]');
      existingProjects.push(projectData);
      localStorage.setItem('user_projects', JSON.stringify(existingProjects));
      
      alert('Saved to project!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  if (!connected || !user) {
    return null;
  }

  const tabs: { mode: ChartMode; label: string }[] = [
    { mode: 'stocks', label: 'STOCKS' },
    { mode: 'crypto', label: 'CRYPTO' },
    { mode: 'memecoins', label: 'MEMECOINS' },
  ];

  const currentSymbol = mode === 'stocks' ? stocksSymbol : mode === 'crypto' ? cryptoSymbol : memecoinCA;
  const setCurrentSymbol = mode === 'stocks' ? setStocksSymbol : mode === 'crypto' ? setCryptoSymbol : setMemecoinCA;

  return (
    <LayoutShell>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        {/* Terminal Section Header */}
        <div className="mb-6">
          <h1 className="terminal-section-header">== CHARTS EXPLORER ==</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Load any chart and backtest your strategies with fake money.
          </p>
        </div>

        {/* Tab System */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.mode}
              onClick={() => {
                setMode(tab.mode);
                setChartLoaded(false);
                setMetadata(null);
              }}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                mode === tab.mode
                  ? 'text-primary border-b-2 border-primary glow-lime'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
          {/* Left: Input & Metadata */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-auto">
            <div className="terminal-panel p-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">
                {mode === 'stocks' && 'TICKER'}
                {mode === 'crypto' && 'SYMBOL'}
                {mode === 'memecoins' && 'CONTRACT ADDRESS'}
              </h3>
                <input
                  type="text"
                value={currentSymbol}
                onChange={(e) => setCurrentSymbol(e.target.value)}
                placeholder={
                  mode === 'stocks' ? 'AAPL, TSLA, NVDA...' :
                  mode === 'crypto' ? 'SOL, BTC, ETH...' :
                  'Pump.fun CA...'
                }
                className="terminal-input w-full mb-4"
                  onKeyPress={(e) => e.key === 'Enter' && handleLoadChart()}
                />
                <button
                  onClick={handleLoadChart}
                disabled={!currentSymbol || loadingData}
                className="terminal-button w-full"
                >
                {loadingData ? <span className="terminal-spinner" /> : 'LOAD CHART'}
                </button>
            </div>

            {/* Metadata Panel */}
            {metadata && (
              <div className="terminal-panel p-4 animate-fade-in">
                <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">
                  MARKET DATA
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  {mode === 'stocks' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="text-foreground">${metadata.price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={metadata.change >= 0 ? 'text-primary' : 'text-destructive'}>
                          {metadata.change >= 0 ? '+' : ''}{metadata.change?.toFixed(2)} ({metadata.changePercent?.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="text-foreground">{(metadata.volume / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap:</span>
                        <span className="text-foreground">${(metadata.marketCap / 1000000000).toFixed(1)}B</span>
                      </div>
                    </>
                  )}
                  {mode === 'crypto' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="text-foreground">${metadata.price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={metadata.change >= 0 ? 'text-primary' : 'text-destructive'}>
                          {metadata.change >= 0 ? '+' : ''}{metadata.change?.toFixed(2)} ({metadata.changePercent?.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="text-foreground">${(metadata.volume / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap:</span>
                        <span className="text-foreground">${(metadata.marketCap / 1000000).toFixed(0)}M</span>
                      </div>
                    </>
                  )}
                  {mode === 'memecoins' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="text-foreground">${metadata.price?.toFixed(8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={metadata.change >= 0 ? 'text-primary' : 'text-destructive'}>
                          {metadata.changePercent >= 0 ? '+' : ''}{metadata.changePercent?.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Liquidity:</span>
                        <span className="text-foreground">${metadata.liquidity?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="text-foreground">${metadata.volume?.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground break-all">{metadata.ca}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center: Chart */}
          <div className="col-span-12 lg:col-span-6 flex flex-col terminal-panel p-4 overflow-hidden">
            {chartLoaded && (mode === 'stocks' || mode === 'crypto') ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-mono uppercase tracking-wider text-primary">
                    {currentSymbol?.toUpperCase() || 'CHART'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTimeframe('D')}
                      className={`px-3 py-1 text-xs font-mono uppercase border transition-all ${
                        timeframe === 'D'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border terminal-button'
                      }`}
                    >
                      1D
                    </button>
                    <button
                      onClick={() => setTimeframe('W')}
                      className={`px-3 py-1 text-xs font-mono uppercase border transition-all ${
                        timeframe === 'W'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border terminal-button'
                      }`}
                    >
                      1W
                    </button>
                    <button
                      onClick={() => setTimeframe('M')}
                      className={`px-3 py-1 text-xs font-mono uppercase border transition-all ${
                        timeframe === 'M'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border terminal-button'
                      }`}
                    >
                      1M
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-[500px]">
                  <TradingViewWidget
                    symbol={currentSymbol || 'SOL'}
                    type={mode === 'stocks' ? 'stocks' : 'crypto'}
                    interval={timeframe}
                  />
                </div>
              </div>
            ) : chartLoaded && mode === 'memecoins' ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2 font-mono">MEMECOIN CHARTS</p>
                  <p className="text-sm">Memecoin chart integration coming soon</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2 font-mono">NO CHART LOADED</p>
                  <p className="text-sm">Enter a symbol and click LOAD CHART</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Strategy Action Panel */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-auto">
            <div className="terminal-panel p-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">
                APPLY STRATEGY
              </h3>
              {strategies.length > 0 ? (
                <div className="space-y-4">
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="terminal-input w-full"
                  >
                    <option value="">Choose strategy...</option>
                    {strategies.map((strategy) => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.title || 'Untitled Strategy'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleBacktest}
                    disabled={!selectedStrategy || !chartLoaded || backtestLoading}
                    className="terminal-button w-full"
                  >
                    {backtestLoading ? <span className="terminal-spinner" /> : 'RUN BACKTEST (COMING SOON)'}
                  </button>
                  <button
                    disabled
                    className="terminal-button w-full opacity-50 cursor-not-allowed"
                  >
                    AI EXPLAIN THIS CHART (DISABLED)
                  </button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <p>Create a strategy first</p>
                </div>
              )}
            </div>

            {/* Study Mode Panel */}
            {chartLoaded && (
              <div className="terminal-panel p-4 animate-fade-in">
                <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">
                  STUDY MODE
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <p className="text-muted-foreground text-xs">
                    Select a range on the chart to analyze
                  </p>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">% Move:</span>
                      <span className="text-foreground">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Candles:</span>
                      <span className="text-foreground">--</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Simulated PnL:</span>
                      <span className="text-foreground">--</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save to Project */}
            {chartLoaded && (
              <div className="terminal-panel p-4 animate-fade-in">
                <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">
                  SAVE TO PROJECT
                </h3>
                <button
                  onClick={handleSaveToProject}
                  className="terminal-button w-full"
                >
                  SAVE CHART + STRATEGY
                </button>
            </div>
          )}

          {/* Backtest Results */}
          {currentBacktest && (
              <div className="terminal-panel p-4 animate-fade-in border-accent/30">
                <h3 className="text-sm font-mono uppercase tracking-wider text-accent mb-4">
                  BACKTEST RESULTS
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PnL:</span>
                    <span className={currentBacktest.pnl >= 0 ? 'text-primary' : 'text-destructive'}>
                    ${currentBacktest.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trades:</span>
                    <span className="text-foreground">{currentBacktest.trades.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset:</span>
                    <span className="text-foreground">{currentBacktest.chart_asset}</span>
                </div>
              </div>
            </div>
          )}
            </div>
        </div>
      </div>
    </LayoutShell>
  );
}
