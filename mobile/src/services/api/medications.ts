import { apiClient } from './client';
import type { MedicationsResponse } from '../../types/medication';

export const medicationsApi = {
  // Get medications
  getMedications: async (patientId: string): Promise<MedicationsResponse> => {
    const response = await apiClient.get(`/api/patient/${patientId}/medications`);
    return response.data;
  },

  // Log medication event
  logMedication: async (
    patientId: string,
    medicationId: string,
    data: {
      scheduledTime: string;
      takenTime: string | null;
      status: string;
      notes?: string;
    }
  ) => {
    const response = await apiClient.post(
      `/api/patient/${patientId}/medications/${medicationId}/log`,
      data
    );
    return response.data;
  },
};
