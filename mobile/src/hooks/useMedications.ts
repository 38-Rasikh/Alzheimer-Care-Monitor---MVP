import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationsApi } from '../services/api/medications';

export function useMedications(patientId: string) {
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => medicationsApi.getMedications(patientId),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });
}

export function useLogMedication(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: string; data: any }) =>
      medicationsApi.logMedication(patientId, medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', patientId] });
    },
  });
}
