/**
 * Sprint 6: WebSocket Performance Monitoring
 * 
 * Tracks connection quality, latency, and reconnection behavior
 * for real-time monitoring and diagnostics.
 */

export interface ConnectionMetrics {
  latency: number | null;           // Round-trip latency in ms
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  isConnected: boolean;
  lastPingTimestamp: string | null;
  reconnectAttempts: number;
  totalReconnects: number;
  connectionUptime: number;         // Seconds
  messagesReceived: number;
  messagesSent: number;
  lastError: string | null;
}

export interface LatencyMeasurement {
  timestamp: string;
  latencyMs: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

class WebSocketMonitor {
  private metrics: ConnectionMetrics = {
    latency: null,
    connectionQuality: 'unknown',
    isConnected: false,
    lastPingTimestamp: null,
    reconnectAttempts: 0,
    totalReconnects: 0,
    connectionUptime: 0,
    messagesReceived: 0,
    messagesSent: 0,
    lastError: null,
  };

  private latencyHistory: LatencyMeasurement[] = [];
  private maxHistoryLength = 50;
  private connectionStartTime: number | null = null;
  private pingStartTimes = new Map<string, number>();
  private uptimeInterval: NodeJS.Timeout | null = null;

  /**
   * Start monitoring a WebSocket connection
   */
  startMonitoring() {
    this.connectionStartTime = Date.now();
    this.metrics.isConnected = true;
    this.metrics.reconnectAttempts = 0;
    
    // Track uptime
    this.uptimeInterval = setInterval(() => {
      if (this.connectionStartTime) {
        this.metrics.connectionUptime = Math.floor((Date.now() - this.connectionStartTime) / 1000);
      }
    }, 1000);
  }

  /**
   * Stop monitoring (on disconnect)
   */
  stopMonitoring() {
    this.metrics.isConnected = false;
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
      this.uptimeInterval = null;
    }
  }

  /**
   * Record ping sent timestamp
   */
  recordPingSent(pingId: string = 'default') {
    this.pingStartTimes.set(pingId, Date.now());
    this.metrics.messagesSent++;
  }

  /**
   * Record pong received and calculate latency
   */
  recordPongReceived(pingId: string = 'default') {
    const startTime = this.pingStartTimes.get(pingId);
    if (!startTime) {
      console.warn('Received pong without matching ping');
      return;
    }

    const latencyMs = Date.now() - startTime;
    this.pingStartTimes.delete(pingId);
    
    this.metrics.latency = latencyMs;
    this.metrics.lastPingTimestamp = new Date().toISOString();
    this.metrics.messagesReceived++;
    
    // Determine quality
    const quality = this.getQualityFromLatency(latencyMs);
    this.metrics.connectionQuality = quality;
    
    // Add to history
    this.latencyHistory.push({
      timestamp: new Date().toISOString(),
      latencyMs,
      quality,
    });
    
    // Trim history
    if (this.latencyHistory.length > this.maxHistoryLength) {
      this.latencyHistory.shift();
    }
  }

  /**
   * Record message received
   */
  recordMessageReceived() {
    this.metrics.messagesReceived++;
  }

  /**
   * Record message sent
   */
  recordMessageSent() {
    this.metrics.messagesSent++;
  }

  /**
   * Record reconnection attempt
   */
  recordReconnectAttempt() {
    this.metrics.reconnectAttempts++;
  }

  /**
   * Record successful reconnection
   */
  recordReconnectSuccess() {
    this.metrics.totalReconnects++;
    this.metrics.reconnectAttempts = 0;
    this.startMonitoring();
  }

  /**
   * Record connection error
   */
  recordError(error: string) {
    this.metrics.lastError = error;
    this.stopMonitoring();
  }

  /**
   * Get current metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get latency history
   */
  getLatencyHistory(): LatencyMeasurement[] {
    return [...this.latencyHistory];
  }

  /**
   * Get average latency over recent measurements
   */
  getAverageLatency(count: number = 10): number | null {
    if (this.latencyHistory.length === 0) return null;
    
    const recent = this.latencyHistory.slice(-count);
    const sum = recent.reduce((acc, m) => acc + m.latencyMs, 0);
    return Math.round(sum / recent.length);
  }

  /**
   * Get connection quality assessment
   */
  getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    const avgLatency = this.getAverageLatency(5);
    if (avgLatency === null) return 'unknown';
    return this.getQualityFromLatency(avgLatency);
  }

  /**
   * Determine quality from latency
   */
  private getQualityFromLatency(latencyMs: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (latencyMs < 50) return 'excellent';
    if (latencyMs < 150) return 'good';
    if (latencyMs < 300) return 'fair';
    return 'poor';
  }

  /**
   * Check if connection is healthy
   */
  isHealthy(): boolean {
    if (!this.metrics.isConnected) return false;
    
    const avgLatency = this.getAverageLatency(3);
    if (avgLatency === null) return true; // No data yet
    
    // Healthy if latency < 500ms and connected
    return avgLatency < 500;
  }

  /**
   * Get health status summary
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
  } {
    if (!this.metrics.isConnected) {
      return {
        status: 'unhealthy',
        message: 'Disconnected from server',
      };
    }

    const avgLatency = this.getAverageLatency(5);
    if (avgLatency === null) {
      return {
        status: 'healthy',
        message: 'Connected (measuring latency...)',
      };
    }

    const quality = this.getQualityFromLatency(avgLatency);
    
    switch (quality) {
      case 'excellent':
        return {
          status: 'healthy',
          message: `Excellent connection (${avgLatency}ms)`,
        };
      case 'good':
        return {
          status: 'healthy',
          message: `Good connection (${avgLatency}ms)`,
        };
      case 'fair':
        return {
          status: 'degraded',
          message: `Fair connection (${avgLatency}ms)`,
        };
      case 'poor':
        return {
          status: 'unhealthy',
          message: `Poor connection (${avgLatency}ms)`,
        };
    }
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.stopMonitoring();
    this.metrics = {
      latency: null,
      connectionQuality: 'unknown',
      isConnected: false,
      lastPingTimestamp: null,
      reconnectAttempts: 0,
      totalReconnects: 0,
      connectionUptime: 0,
      messagesReceived: 0,
      messagesSent: 0,
      lastError: null,
    };
    this.latencyHistory = [];
    this.pingStartTimes.clear();
    this.connectionStartTime = null;
  }
}

// Singleton instance
export const wsMonitor = new WebSocketMonitor();

/**
 * React hook for WebSocket monitoring
 */
export function useWebSocketMonitor() {
  return {
    monitor: wsMonitor,
    startMonitoring: () => wsMonitor.startMonitoring(),
    stopMonitoring: () => wsMonitor.stopMonitoring(),
    getMetrics: () => wsMonitor.getMetrics(),
    getLatencyHistory: () => wsMonitor.getLatencyHistory(),
    getAverageLatency: (count?: number) => wsMonitor.getAverageLatency(count),
    getConnectionQuality: () => wsMonitor.getConnectionQuality(),
    isHealthy: () => wsMonitor.isHealthy(),
    getHealthStatus: () => wsMonitor.getHealthStatus(),
  };
}
