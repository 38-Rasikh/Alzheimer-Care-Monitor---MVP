import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedMutation {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = '@mutation_queue';
const MAX_RETRIES = 3;

export const useMutationQueue = () => {
  const [queue, setQueue] = useState<QueuedMutation[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load queue from storage on mount
  useEffect(() => {
    loadQueue();
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online || false);

      // Process queue when connection is restored
      if (online && queue.length > 0 && !isProcessing) {
        processQueue();
      }
    });

    return () => unsubscribe();
  }, [queue, isProcessing]);

  const loadQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load mutation queue:', error);
    }
  };

  const saveQueue = async (newQueue: QueuedMutation[]) => {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
      setQueue(newQueue);
    } catch (error) {
      console.error('Failed to save mutation queue:', error);
    }
  };

  const addToQueue = useCallback(
    async (endpoint: string, method: string, body: any) => {
      const mutation: QueuedMutation = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        endpoint,
        method,
        body,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const newQueue = [...queue, mutation];
      await saveQueue(newQueue);

      // Try to process immediately if online
      if (isOnline) {
        processQueue();
      }

      return mutation.id;
    },
    [queue, isOnline]
  );

  const processQueue = async () => {
    if (isProcessing || queue.length === 0 || !isOnline) {
      return;
    }

    setIsProcessing(true);

    const newQueue = [...queue];
    const toProcess = newQueue.shift();

    if (!toProcess) {
      setIsProcessing(false);
      return;
    }

    try {
      // Attempt to execute the mutation
      const response = await fetch(toProcess.endpoint, {
        method: toProcess.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toProcess.body),
      });

      if (response.ok) {
        // Success - remove from queue
        await saveQueue(newQueue);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to process queued mutation:', error);

      // Retry logic
      if (toProcess.retryCount < MAX_RETRIES) {
        toProcess.retryCount++;
        newQueue.push(toProcess); // Add back to end of queue
        await saveQueue(newQueue);
      } else {
        // Max retries exceeded - log and discard
        console.warn('Mutation discarded after max retries:', toProcess);
        await saveQueue(newQueue);
      }
    } finally {
      setIsProcessing(false);

      // Continue processing if there are more items
      if (newQueue.length > 0) {
        setTimeout(() => processQueue(), 1000); // Wait 1s between retries
      }
    }
  };

  const clearQueue = async () => {
    await saveQueue([]);
  };

  return {
    queue,
    queueLength: queue.length,
    isOnline,
    isProcessing,
    addToQueue,
    clearQueue,
  };
};
