// =====================================================================
// Backtest Log Streaming System
// =====================================================================

export type LogLevel = 'info' | 'warn' | 'error' | 'trade' | 'reasoning';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
}

type LogCallback = (log: LogEntry) => void;

class LogStream {
  private listeners: Set<LogCallback> = new Set();
  private logs: LogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs

  /**
   * Subscribe to log stream
   */
  subscribe(callback: LogCallback): () => void {
    this.listeners.add(callback);
    
    // Send existing logs to new subscriber
    this.logs.forEach(log => callback(log));
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Emit a log entry
   */
  log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.logs.push(entry);
    
    // Keep only last maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify all listeners
    this.listeners.forEach(callback => callback(entry));
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
    this.log('info', 'Logs cleared');
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
}

// Singleton instance
export const backtestLogStream = new LogStream();

