import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getSocketUrl } from '../services/api/env';

export function useWebSocket(patientId: string) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('subscribe', { patientId });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Listen for real-time patient status updates
    socket.on('patient:status', (data) => {
      console.log('Real-time status update:', data);
      queryClient.setQueryData(['patient', patientId], data);
    });

    // Listen for new alerts
    socket.on('alert:new', (alert) => {
      console.log('New alert:', alert);
      
      // Invalidate alerts query to refetch
      queryClient.invalidateQueries({ queryKey: ['alerts', patientId] });
      
      // Could also show a toast notification here
    });

    // Listen for vitals updates
    socket.on('vitals:update', (vitals) => {
      console.log('Vitals update:', vitals);
      
      // Update patient status with new vitals
      queryClient.setQueryData(['patient', patientId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          vitals,
        };
      });
    });

    // Listen for medication reminders
    socket.on('medication:reminder', (reminder) => {
      console.log('Medication reminder:', reminder);
      // Could show a local notification here
    });

    socketRef.current = socket;
  }, [patientId, queryClient]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    connect,
    disconnect,
  };
}
