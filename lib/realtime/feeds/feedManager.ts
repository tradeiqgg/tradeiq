// =====================================================================
// CHAPTER 11: Unified Feed Manager
// =====================================================================

import { BinanceFeed } from './binanceFeed';
import { CryptoCompareFeed } from './cryptoFeed';
import { StocksFeed } from './stocksFeed';
import type { Candle } from './binanceFeed';

export type FeedType = 'crypto' | 'stock';
export type FeedProvider = 'binance' | 'cryptocompare' | 'finnhub';

export interface FeedSubscription {
  id: string;
  symbol: string;
  interval: string;
  type: FeedType;
  provider: FeedProvider;
  onCandle: (candle: Candle) => void;
  onError: (error: Error) => void;
}

export class FeedManager {
  private subscriptions = new Map<string, FeedSubscription>();
  private feeds = new Map<string, BinanceFeed | CryptoCompareFeed | StocksFeed>();
  private maxSubscriptionsPerUser = 5;
  private maxTotalStreams = 20;
  private throttleInterval = 250; // ms
  private lastEmitTime = new Map<string, number>();
  private candleBuffers = new Map<string, Candle[]>();

  /**
   * Subscribe to a market data feed
   */
  subscribe(
    symbol: string,
    interval: string,
    type: FeedType,
    onCandle: (candle: Candle) => void,
    onError: (error: Error) => void,
    userId?: string
  ): string {
    // Rate limiting check
    if (userId && this.getUserSubscriptionCount(userId) >= this.maxSubscriptionsPerUser) {
      onError(new Error('Maximum subscriptions per user reached'));
      return '';
    }

    if (this.subscriptions.size >= this.maxTotalStreams) {
      onError(new Error('Maximum total streams reached'));
      return '';
    }

    const subscriptionId = `${symbol}-${interval}-${Date.now()}`;
    const provider = this.selectProvider(symbol, type);

    const subscription: FeedSubscription = {
      id: subscriptionId,
      symbol,
      interval,
      type,
      provider,
      onCandle: (candle) => this.throttledEmit(subscriptionId, candle, onCandle),
      onError,
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.createFeed(subscription);

    return subscriptionId;
  }

  /**
   * Unsubscribe from a feed
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      const feed = this.feeds.get(subscriptionId);
      if (feed) {
        feed.disconnect();
        this.feeds.delete(subscriptionId);
      }
      this.subscriptions.delete(subscriptionId);
      this.lastEmitTime.delete(subscriptionId);
      this.candleBuffers.delete(subscriptionId);
    }
  }

  /**
   * Update subscription symbol/interval
   */
  updateSubscription(
    subscriptionId: string,
    symbol: string,
    interval: string
  ): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.symbol = symbol;
      subscription.interval = interval;
      
      const feed = this.feeds.get(subscriptionId);
      if (feed && 'updateSymbol' in feed) {
        (feed as BinanceFeed).updateSymbol(symbol, interval);
      } else {
        // Recreate feed
        this.unsubscribe(subscriptionId);
        this.createFeed(subscription);
      }
    }
  }

  /**
   * Get subscription status
   */
  getStatus(subscriptionId: string): { connected: boolean; symbol: string; interval: string } | null {
    const feed = this.feeds.get(subscriptionId);
    if (feed && 'getStatus' in feed) {
      return (feed as any).getStatus();
    }
    return null;
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): FeedSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Disconnect all feeds
   */
  disconnectAll(): void {
    for (const [id, feed] of Array.from(this.feeds.entries())) {
      feed.disconnect();
    }
    this.feeds.clear();
    this.subscriptions.clear();
    this.lastEmitTime.clear();
    this.candleBuffers.clear();
  }

  private selectProvider(symbol: string, type: FeedType): FeedProvider {
    if (type === 'crypto') {
      // Prefer Binance for crypto
      return 'binance';
    } else {
      // Use Finnhub for stocks
      return 'finnhub';
    }
  }

  private createFeed(subscription: FeedSubscription): void {
    const { id, symbol, interval, type, provider, onCandle, onError } = subscription;

    let feed: BinanceFeed | CryptoCompareFeed | StocksFeed;

    if (provider === 'binance') {
      feed = new BinanceFeed(symbol, interval, onCandle, onError);
    } else if (provider === 'cryptocompare') {
      feed = new CryptoCompareFeed(symbol, interval, onCandle, onError);
    } else {
      feed = new StocksFeed(symbol, interval, onCandle, onError);
    }

    this.feeds.set(id, feed);
    feed.connect();
  }

  private throttledEmit(
    subscriptionId: string,
    candle: Candle,
    callback: (candle: Candle) => void
  ): void {
    const now = Date.now();
    const lastEmit = this.lastEmitTime.get(subscriptionId) || 0;

    if (now - lastEmit < this.throttleInterval) {
      // Buffer candle for later emission
      const buffer = this.candleBuffers.get(subscriptionId) || [];
      buffer.push(candle);
      this.candleBuffers.set(subscriptionId, buffer);
      return;
    }

    // Emit immediately
    this.lastEmitTime.set(subscriptionId, now);
    callback(candle);

    // Process buffered candles
    const buffer = this.candleBuffers.get(subscriptionId);
    if (buffer && buffer.length > 0) {
      // Emit latest candle from buffer
      const latestCandle = buffer[buffer.length - 1];
      callback(latestCandle);
      this.candleBuffers.set(subscriptionId, []);
    }
  }

  private getUserSubscriptionCount(userId: string): number {
    // In a real implementation, track subscriptions per user
    // For now, return total count
    return this.subscriptions.size;
  }
}

// Singleton instance
let feedManagerInstance: FeedManager | null = null;

export function getFeedManager(): FeedManager {
  if (!feedManagerInstance) {
    feedManagerInstance = new FeedManager();
  }
  return feedManagerInstance;
}

