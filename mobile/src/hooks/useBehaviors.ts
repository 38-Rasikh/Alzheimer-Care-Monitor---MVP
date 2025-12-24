import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { behaviorsApi } from '../services/api/behaviors';

export function useBehaviors(patientId: string) {
  return useQuery({
    queryKey: ['behaviors', patientId],
    queryFn: () => behaviorsApi.getBehaviors(patientId),
    staleTime: 60000,
  });
}

export function useLogBehavior(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => behaviorsApi.logBehavior(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behaviors', patientId] });
    },
  });
}
