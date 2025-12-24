/**
 * Sprint 6: Error Boundaries and Retry Logic
 * 
 * Provides crash recovery through React error boundaries
 * and exponential backoff retry for API failures.
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error tracking service
    // e.g., Sentry, Bugsnag, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorContent}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={64} 
                color={colors.error} 
              />
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMessage}>
                The app encountered an unexpected error. Please try again.
              </Text>
              
              {__DEV__ && this.state.error && (
                <View style={styles.debugInfo}>
                  <Text style={styles.debugTitle}>Debug Info:</Text>
                  <Text style={styles.debugText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.debugText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}

              <Button
                mode="contained"
                onPress={this.handleReset}
                style={styles.resetButton}
                icon="refresh"
              >
                Try Again
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.surface,
  },
  errorContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  debugInfo: {
    width: '100%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  resetButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
  },
});

/**
 * Exponential backoff retry utility
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt >= opts.maxRetries || !opts.shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelayMs
      );
      
      // Call retry callback
      opts.onRetry(attempt + 1, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Check if error is retryable (network errors, 5xx, timeouts)
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.message?.includes('Network request failed')) return true;
  if (error.message?.includes('timeout')) return true;
  if (error.code === 'ECONNREFUSED') return true;
  if (error.code === 'ETIMEDOUT') return true;
  
  // HTTP status codes that should be retried
  if (error.response?.status) {
    const status = error.response.status;
    // Retry on 5xx server errors and 429 (rate limit)
    if (status >= 500 || status === 429) return true;
  }
  
  return false;
}

/**
 * React Query retry configuration
 */
export const queryRetryConfig = {
  retry: (failureCount: number, error: any) => {
    // Don't retry on client errors (4xx except 429)
    if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
      return false;
    }
    
    // Retry up to 3 times for network/server errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
  },
};

/**
 * Mutation retry configuration
 */
export const mutationRetryConfig = {
  retry: (failureCount: number, error: any) => {
    // Only retry network/server errors for mutations
    if (!isRetryableError(error)) return false;
    return failureCount < 2; // Max 2 retries for mutations
  },
  retryDelay: (attemptIndex: number) => {
    return Math.min(1000 * Math.pow(2, attemptIndex), 5000);
  },
};

/**
 * Fetch with retry wrapper
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, options);
      
      // Throw on non-2xx status
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        throw error;
      }
      
      return response;
    },
    {
      ...retryOptions,
      shouldRetry: (error) => isRetryableError(error),
    }
  );
}

/**
 * API client with retry (for non-React Query usage)
 */
export class RetryableAPIClient {
  private baseURL: string;
  private defaultRetryOptions: RetryOptions;

  constructor(baseURL: string, retryOptions: RetryOptions = {}) {
    this.baseURL = baseURL;
    this.defaultRetryOptions = retryOptions;
  }

  async get<T>(path: string, retryOptions?: RetryOptions): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await fetchWithRetry(
      url,
      { method: 'GET' },
      { ...this.defaultRetryOptions, ...retryOptions }
    );
    return response.json();
  }

  async post<T>(path: string, data: any, retryOptions?: RetryOptions): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      { ...this.defaultRetryOptions, ...retryOptions }
    );
    return response.json();
  }

  async put<T>(path: string, data: any, retryOptions?: RetryOptions): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await fetchWithRetry(
      url,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      { ...this.defaultRetryOptions, ...retryOptions }
    );
    return response.json();
  }
}
