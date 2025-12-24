import { apiClient } from './client';
import type { PatientStatus } from '../../types/patient';

export const patientApi = {
  // Get patient status
  getStatus: async (patientId: string): Promise<PatientStatus> => {
    const response = await apiClient.get(`/api/patient/${patientId}/status`);
    return response.data;
  },

  // Get patient profile
  getProfile: async (patientId: string) => {
    const response = await apiClient.get(`/api/patient/${patientId}/profile`);
    return response.data;
  },

  // Get all patients (for clinician view)
  getPatients: async () => {
    const response = await apiClient.get('/api/patients');
    return response.data;
  },
};
