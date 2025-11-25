// =====================================================================
// CHAPTER 11: Binance WebSocket Feed
// =====================================================================

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  isComplete: boolean;
}

export interface BinanceKlineMessage {
  e: string; // event type
  E: number; // event time
  s: string; // symbol
  k: {
    t: number; // kline start time
    T: number; // kline close time
    s: string; // symbol
    i: string; // interval
    f: number; // first trade ID
    L: number; // last trade ID
    o: string; // open price
    c: string; // close price
    h: string; // high price
    l: string; // low price
    v: string; // volume
    n: number; // number of trades
    x: boolean; // is this kline closed?
    q: string; // quote asset volume
    V: string; // taker buy base asset volume
    Q: string; // taker buy quote asset volume
  };
}

export class BinanceFeed {
  private ws: WebSocket | null = null;
  private symbol: string;
  private interval: string;
  private onCandle: (candle: Candle) => void;
  private onError: (error: Error) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isConnected = false;

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

    const streamName = `${this.symbol.toLowerCase()}@kline_${this.interval}`;
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log(`[BinanceFeed] Connected: ${this.symbol}@${this.interval}`);
      };

      this.ws.onmessage = (event) => {
        try {
          const data: BinanceKlineMessage = JSON.parse(event.data);
          if (data.k) {
            const candle: Candle = {
              open: parseFloat(data.k.o),
              high: parseFloat(data.k.h),
              low: parseFloat(data.k.l),
              close: parseFloat(data.k.c),
              volume: parseFloat(data.k.v),
              timestamp: data.k.t,
              isComplete: data.k.x,
            };
            this.onCandle(candle);
          }
        } catch (error) {
          this.onError(new Error(`Failed to parse Binance message: ${error}`));
        }
      };

      this.ws.onerror = (error) => {
        this.onError(new Error(`Binance WebSocket error: ${error}`));
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.handleReconnect();
      };
    } catch (error) {
      this.onError(new Error(`Failed to connect to Binance: ${error}`));
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`[BinanceFeed] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  updateSymbol(symbol: string, interval: string): void {
    const changed = this.symbol !== symbol.toUpperCase() || this.interval !== interval;
    if (changed) {
      this.disconnect();
      this.symbol = symbol.toUpperCase();
      this.interval = interval;
      this.connect();
    }
  }

  getStatus(): { connected: boolean; symbol: string; interval: string } {
    return {
      connected: this.isConnected,
      symbol: this.symbol,
      interval: this.interval,
    };
  }
}

