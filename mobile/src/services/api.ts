// API Service for interacting with the mock backend
// Base URL automatically detected from environment and Expo dev server

import { getApiBaseUrl } from './api/env';

const API_BASE_URL = `${getApiBaseUrl()}/api`;

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

// Helper function to handle fetch responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Authentication
export const authApi = {
  login: async (credentials: { email?: string; phone?: string; role?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ success: boolean; user: any; token: string }>(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
    return handleResponse<{ success: boolean }>(response);
  },
};

// User Management
export const userApi = {
  getUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return handleResponse<{ user: any }>(response);
  },

  updateUser: async (userId: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; user: any }>(response);
  },
};

// Onboarding
export const onboardingApi = {
  submitOnboarding: async (data: {
    patientId: string;
    displayName: string;
    stage: string;
    diagnosis?: string;
    diagnosisDate?: string;
    caregiverUserId: string;
    caregiverInfo: {
      displayName: string;
      email: string;
      phone: string;
    };
    consents: Array<{ type: string; granted: boolean }>;
    emergencyContacts: Array<{ name: string; relation: string; phone: string; priority: number }>;
    routine: Array<{ id: string; label: string; time: string; category: string }>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/onboarding/patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{
      success: boolean;
      patientId: string;
      caregiverId: string;
      profile: any;
      consents: any[];
    }>(response);
  },
};

// Patient Data
export const patientApi = {
  getProfile: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/profile`);
    return handleResponse<any>(response);
  },

  getStatus: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/status`);
    return handleResponse<any>(response);
  },

  getAlerts: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/alerts`);
    return handleResponse<{ patientId: string; totalCount: number; activeCount: number; alerts: any[] }>(
      response
    );
  },

  acknowledgeAlert: async (patientId: string, alertId: string, data: { acknowledgedBy: string; actionTaken?: string }) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; alertId: string; acknowledgedAt: string }>(response);
  },

  getMedications: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/medications`);
    return handleResponse<any>(response);
  },

  logMedication: async (patientId: string, medicationId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/medications/${medicationId}/log`, {
      method: 'POST',
    });
    return handleResponse<{ success: boolean; eventId: string }>(response);
  },

  getBehaviors: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/behaviors`);
    return handleResponse<any>(response);
  },

  logBehavior: async (patientId: string, behaviorData: any) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/behaviors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(behaviorData),
    });
    return handleResponse<{ success: boolean; eventId: string }>(response);
  },

  getSummary: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/summary`);
    return handleResponse<any>(response);
  },

  getConsents: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/consent`);
    return handleResponse<{ patientId: string; consents: any[] }>(response);
  },

  getRoutine: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/routine`);
    return handleResponse<{ patientId: string; routine: any[] }>(response);
  },

  updateRoutine: async (patientId: string, routine: any[]) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/routine`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routine }),
    });
    return handleResponse<{ success: boolean }>(response);
  },

  // Timeline endpoints
  getTimeline: async (patientId: string, date?: string) => {
    const url = date 
      ? `${API_BASE_URL}/patient/${patientId}/timeline?date=${date}`
      : `${API_BASE_URL}/patient/${patientId}/timeline`;
    const response = await fetch(url);
    return handleResponse<{
      patientId: string;
      date: string;
      timeline: any[];
      totalTasks: number;
      completed: number;
      pending: number;
      missed: number;
    }>(response);
  },

  acknowledgeTask: async (patientId: string, taskId: string, completed: boolean = false) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/timeline/${taskId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    return handleResponse<{
      success: boolean;
      taskId: string;
      acknowledged: boolean;
      completed: boolean;
      timestamp: string;
    }>(response);
  },

  getOrientation: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/orientation`);
    return handleResponse<{
      patientId: string;
      patientName: string;
      date: string;
      time: string;
      dayOfWeek: string;
      location: string;
      weather: {
        condition: string;
        temperature: number;
        icon: string;
      };
      nextTask: {
        time: string;
        label: string;
        category: string;
        minutesUntil: number;
      } | null;
      isNightTime: boolean;
      isSundowning: boolean;
      recentActivity: string[];
    }>(response);
  },

  getEmergencyContacts: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/emergency-contacts`);
    return handleResponse<{ patientId: string; contacts: any[] }>(response);
  },

  updateEmergencyContacts: async (patientId: string, contacts: any[]) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/emergency-contacts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts }),
    });
    return handleResponse<{ success: boolean; patientId: string; contacts: any[] }>(response);
  },
};

// Caregiver Data
export const caregiverApi = {
  getPatients: async (caregiverId: string) => {
    const response = await fetch(`${API_BASE_URL}/caregiver/${caregiverId}/patients`);
    return handleResponse<{
      caregiverId: string;
      totalPatients: number;
      patients: any[];
    }>(response);
  },

  linkPatient: async (caregiverId: string, patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/caregiver/${caregiverId}/link-patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    return handleResponse<{ success: boolean; caregiverId: string; patientId: string }>(response);
  },

  getAllPatients: async () => {
    const response = await fetch(`${API_BASE_URL}/patients`);
    return handleResponse<{ totalCount: number; patients: any[] }>(response);
  },
};

// Health Check
export const healthApi = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return handleResponse<{ status: string; timestamp: string }>(response);
  },
};

export default {
  auth: authApi,
  user: userApi,
  onboarding: onboardingApi,
  patient: patientApi,
  caregiver: caregiverApi,
  health: healthApi,
};
