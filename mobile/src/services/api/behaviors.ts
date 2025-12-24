import { apiClient } from './client';

export const behaviorsApi = {
  // Get behavior events
  getBehaviors: async (patientId: string, params?: { from?: string; to?: string }) => {
    const response = await apiClient.get(`/api/patient/${patientId}/behaviors`, { params });
    return response.data;
  },

  // Log behavior event
  logBehavior: async (
    patientId: string,
    data: {
      timestamp: string;
      type: string;
      severity: number;
      duration: number;
      triggers: string[];
      response: string;
      notes: string;
      loggedBy: string;
    }
  ) => {
    const response = await apiClient.post(`/api/patient/${patientId}/behaviors`, data);
    return response.data;
  },
};
