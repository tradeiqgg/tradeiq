// =====================================================================
// CHAPTER 11: Event Bus for Realtime Events
// =====================================================================

export type RealtimeEventType =
  | 'PRICE_UPDATE'
  | 'INDICATOR_UPDATE'
  | 'RULE_TRIGGERED'
  | 'ENTER_SIGNAL'
  | 'EXIT_SIGNAL'
  | 'RISK_ALERT'
  | 'PNL_UPDATE'
  | 'HEARTBEAT'
  | 'CONNECTION_STATUS';

export interface RealtimeEvent {
  type: RealtimeEventType;
  timestamp: number;
  data: any;
  strategyId?: string;
  symbol?: string;
}

type EventHandler = (event: RealtimeEvent) => void;

export class EventBus {
  private handlers = new Map<RealtimeEventType, Set<EventHandler>>();
  private eventHistory: RealtimeEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Subscribe to an event type
   */
  on(eventType: RealtimeEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Emit an event
   */
  emit(event: RealtimeEvent): void {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Get event history
   */
  getHistory(eventType?: RealtimeEventType, limit = 100): RealtimeEvent[] {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }

    return events.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
  }
  return eventBusInstance;
}

