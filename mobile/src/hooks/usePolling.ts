import { useEffect, useRef, useCallback, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface UsePollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 30000ms = 30s)
  enabled?: boolean; // Whether polling is enabled (default: true)
  onError?: (error: Error) => void; // Error handler callback
  maxRetries?: number; // Max consecutive failures before stopping (default: 5)
  backoffMultiplier?: number; // Exponential backoff multiplier (default: 1.5)
  maxBackoffInterval?: number; // Maximum backoff interval in ms (default: 2 minutes)
}

/**
 * Custom hook for polling data with error handling, exponential backoff, and offline detection.
 * 
 * @param fetchFunction - Async function to call on each poll
 * @param options - Polling configuration options
 * 
 * @example
 * ```tsx
 * const { isPolling, error, retryCount } = usePolling(
 *   async () => {
 *     const data = await fetchPatientData(patientId);
 *     setData(data);
 *   },
 *   { interval: 30000, enabled: true }
 * );
 * ```
 */
export function usePolling(
  fetchFunction: () => Promise<void>,
  options: UsePollingOptions = {}
) {
  const {
    interval = 30000, // Default 30 seconds
    enabled = true,
    onError,
    maxRetries = 5,
    backoffMultiplier = 1.5,
    maxBackoffInterval = 120000, // 2 minutes
  } = options;

  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [currentInterval, setCurrentInterval] = useState(interval);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFailures = useRef(0);
  const isMountedRef = useRef(true);
  const fetchFunctionRef = useRef(fetchFunction);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
    onErrorRef.current = onError;
  }, [fetchFunction, onError]);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online ?? true); // Default to true if null

      // Reset failures when coming back online
      if (online && !isOnline) {
        consecutiveFailures.current = 0;
        setRetryCount(0);
        setCurrentInterval(interval);
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [isOnline, interval]);

  // Main polling function
  const poll = useCallback(async () => {
    if (!isMountedRef.current || !enabled || !isOnline) {
      return;
    }

    setIsPolling(true);

    try {
      await fetchFunctionRef.current();
      
      // Success - reset failure count
      if (consecutiveFailures.current > 0) {
        consecutiveFailures.current = 0;
        setRetryCount(0);
        setCurrentInterval(interval);
        setError(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Polling failed');
      
      consecutiveFailures.current += 1;
      setRetryCount(consecutiveFailures.current);
      setError(error);

      // Call error handler if provided
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }

      // Check if we've exceeded max retries
      if (consecutiveFailures.current >= maxRetries) {
        console.warn(
          `Polling stopped after ${maxRetries} consecutive failures. Will resume when network recovers.`
        );
        setIsPolling(false);
        return; // Stop polling
      }

      // Calculate new interval with exponential backoff
      const backoff = interval * Math.pow(backoffMultiplier, consecutiveFailures.current);
      const newInterval = Math.min(backoff, maxBackoffInterval);
      setCurrentInterval(newInterval);
      
      console.warn(
        `Polling failed (${consecutiveFailures.current}/${maxRetries}). ` +
        `Next retry in ${Math.round(newInterval / 1000)}s. Error: ${error.message}`
      );
    } finally {
      if (isMountedRef.current) {
        setIsPolling(false);
      }
    }
  }, [
    enabled,
    isOnline,
    maxRetries,
    interval,
    backoffMultiplier,
    maxBackoffInterval,
  ]);

  // Setup polling interval
  useEffect(() => {
    if (!enabled || !isOnline || retryCount >= maxRetries) {
      return;
    }

    // Initial fetch
    poll();

    // Setup interval for subsequent fetches
    const scheduleNext = () => {
      timeoutRef.current = setTimeout(() => {
        poll();
        scheduleNext();
      }, currentInterval);
    };

    scheduleNext();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, isOnline, retryCount, maxRetries, currentInterval, poll]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isPolling,
    error,
    retryCount,
    isOnline,
    currentInterval,
    hasMaxedRetries: retryCount >= maxRetries,
  };
}
