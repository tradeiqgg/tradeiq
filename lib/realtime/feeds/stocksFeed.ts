// =====================================================================
// CHAPTER 11: Finnhub WebSocket Feed (Stocks)
// =====================================================================

import type { Candle } from './binanceFeed';

export class StocksFeed {
  private ws: WebSocket | null = null;
  private symbol: string;
  private interval: string;
  private onCandle: (candle: Candle) => void;
  private onError: (error: Error) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnected = false;
  private apiKey: string;

  constructor(
    symbol: string,
    interval: string,
    onCandle: (candle: Candle) => void,
    onError: (error: Error) => void,
    apiKey?: string
  ) {
    this.symbol = symbol.toUpperCase();
    this.interval = interval;
    this.onCandle = onCandle;
    this.onError = onError;
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!this.apiKey) {
      this.onError(new Error('Finnhub API key not configured'));
      return;
    }

    const wsUrl = `wss://ws.finnhub.io?token=${this.apiKey}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to symbol
        const subscribeMsg = {
          type: 'subscribe',
          symbol: this.symbol,
        };
        this.ws?.send(JSON.stringify(subscribeMsg));
        
        console.log(`[StocksFeed] Connected: ${this.symbol}`);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'trade' && data.data) {
            // Convert trade data to candle format
            const trade = data.data[0];
            if (trade) {
              const candle: Candle = {
                open: trade.p,
                high: trade.p,
                low: trade.p,
                close: trade.p,
                volume: trade.v || 0,
                timestamp: trade.t,
                isComplete: false,
              };
              this.onCandle(candle);
            }
          }
        } catch (error) {
          this.onError(new Error(`Failed to parse Finnhub message: ${error}`));
        }
      };

      this.ws.onerror = (error) => {
        this.onError(new Error(`Finnhub WebSocket error: ${error}`));
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.handleReconnect();
      };
    } catch (error) {
      this.onError(new Error(`Failed to connect to Finnhub: ${error}`));
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`[StocksFeed] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      // Unsubscribe before closing
      const unsubscribeMsg = {
        type: 'unsubscribe',
        symbol: this.symbol,
      };
      this.ws.send(JSON.stringify(unsubscribeMsg));
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  getStatus(): { connected: boolean; symbol: string; interval: string } {
    return {
      connected: this.isConnected,
      symbol: this.symbol,
      interval: this.interval,
    };
  }
}

