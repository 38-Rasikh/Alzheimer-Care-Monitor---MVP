import { apiClient } from './client';
import type { Alert, AlertsResponse } from '../../types/alert';

export const alertsApi = {
  // Get patient alerts
  getAlerts: async (
    patientId: string,
    params?: {
      status?: 'all' | 'active' | 'acknowledged';
      severity?: string;
      type?: string;
    }
  ): Promise<AlertsResponse> => {
    const response = await apiClient.get(`/api/patient/${patientId}/alerts`, { params });
    return response.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (
    patientId: string,
    alertId: string,
    data: { acknowledgedBy: string; actionTaken: string }
  ) => {
    const response = await apiClient.post(
      `/api/patient/${patientId}/alerts/${alertId}/acknowledge`,
      data
    );
    return response.data;
  },
};
