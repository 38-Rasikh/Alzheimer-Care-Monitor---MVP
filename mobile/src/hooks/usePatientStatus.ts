import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../services/api/patient';

export function usePatientStatus(patientId: string) {
  return useQuery({
    queryKey: ['patient-status', patientId],
    queryFn: () => patientApi.getStatus(patientId),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });
}

export function usePatientProfile(patientId: string) {
  return useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: () => patientApi.getProfile(patientId),
    staleTime: 60000, // Profile data doesn't change often
  });
}
