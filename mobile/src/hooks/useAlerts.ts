import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../services/api/alerts';

export function useAlerts(patientId: string, status: 'all' | 'active' | 'acknowledged' = 'active') {
  return useQuery({
    queryKey: ['alerts', patientId, status],
    queryFn: () => alertsApi.getAlerts(patientId, { status }),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });
}

export function useAcknowledgeAlert(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, data }: { alertId: string; data: { acknowledgedBy: string; actionTaken: string } }) =>
      alertsApi.acknowledgeAlert(patientId, alertId, data),
    onSuccess: () => {
      // Invalidate and refetch alerts
      queryClient.invalidateQueries({ queryKey: ['alerts', patientId] });
    },
  });
}
