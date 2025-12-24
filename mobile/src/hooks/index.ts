/**
 * Centralized hooks exports
 * 
 * Usage:
 * import { usePatientStatus, usePolling, useWebSocket } from '@/hooks';
 */

// Data fetching hooks
export { usePatientStatus, usePatientProfile } from './usePatientStatus';
export { useAlerts } from './useAlerts';
export { useMedications } from './useMedications';
export { useBehaviors } from './useBehaviors';

// Real-time & polling hooks
export { usePolling } from './usePolling';
export { useWebSocket } from './useWebSocket';

// Mutation & queue management
export { useMutationQueue } from './useMutationQueue';

// Device & UX hooks
export { useHaptics } from './useHaptics';
