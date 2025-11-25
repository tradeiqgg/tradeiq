// =====================================================================
// CHAPTER 11: CryptoCompare WebSocket Feed (Fallback)
// =====================================================================

import type { Candle } from './binanceFeed';

export class CryptoCompareFeed {
  private ws: WebSocket | null = null;
  private symbol: string;
  private interval: string;
  private onCandle: (candle: Candle) => void;
  private onError: (error: Error) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnected = false;
  private candleBuffer: Partial<Candle> | null = null;

  constructor(
    symbol: string,
    interval: string,
    onCandle: (candle: Candle) => void,
    onError: (error: Error) => void
  ) {
    this.symbol = symbol.toUpperCase();
    this.interval = interval;
    this.onCandle = onCandle;
    this.onError = onError;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = 'wss://streamer.cryptocompare.com/v2';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to ticker
        const subscribeMsg = {
          action: 'SubAdd',
          subs: [`0~${this.symbol}~USD`],
        };
        this.ws?.send(JSON.stringify(subscribeMsg));
        
        console.log(`[CryptoCompareFeed] Connected: ${this.symbol}`);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.TYPE === '0' && data.FSYM === this.symbol) {
            // Tick data - convert to candle format
            const price = data.PRICE;
            const timestamp = data.TS * 1000; // Convert to milliseconds
            
            if (!this.candleBuffer) {
              this.candleBuffer = {
                open: price,
                high: price,
                low: price,
                close: price,
                volume: 0,
                timestamp,
                isComplete: false,
              };
            } else {
              this.candleBuffer.high = Math.max(this.candleBuffer.high || 0, price);
              this.candleBuffer.low = Math.min(this.candleBuffer.low || Infinity, price);
              this.candleBuffer.close = price;
              this.candleBuffer.timestamp = timestamp;
            }
            
            // Emit candle update (incomplete)
            if (this.candleBuffer) {
              this.onCandle(this.candleBuffer as Candle);
            }
          }
        } catch (error) {
          this.onError(new Error(`Failed to parse CryptoCompare message: ${error}`));
        }
      };

      this.ws.onerror = (error) => {
        this.onError(new Error(`CryptoCompare WebSocket error: ${error}`));
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.handleReconnect();
      };
    } catch (error) {
      this.onError(new Error(`Failed to connect to CryptoCompare: ${error}`));
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
      console.log(`[CryptoCompareFeed] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.candleBuffer = null;
  }

  getStatus(): { connected: boolean; symbol: string; interval: string } {
    return {
      connected: this.isConnected,
      symbol: this.symbol,
      interval: this.interval,
    };
  }
}

