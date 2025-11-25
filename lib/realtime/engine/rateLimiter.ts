// =====================================================================
// CHAPTER 11: Rate Limiter for Realtime Operations
// =====================================================================

export class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * Get time until next request is allowed
   */
  getTimeUntilNext(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length < this.maxRequests) {
      return 0;
    }

    const oldestRequest = requests[0];
    const elapsed = Date.now() - oldestRequest;
    return Math.max(0, this.windowMs - elapsed);
  }

  /**
   * Reset rate limiter for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limiters
   */
  clear(): void {
    this.requests.clear();
  }
}

// Global rate limiters
export const strategyEvaluationLimiter = new RateLimiter(10, 1000); // 10 per second
export const indicatorUpdateLimiter = new RateLimiter(50, 1000); // 50 per second
export const feedSubscriptionLimiter = new RateLimiter(5, 60000); // 5 per minute

