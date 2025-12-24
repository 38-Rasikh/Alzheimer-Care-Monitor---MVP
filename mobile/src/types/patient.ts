export interface Patient {
  patientId: string;
  patientName: string;
  age: number;
  diseaseStage: 'mild' | 'moderate' | 'severe';
  lastUpdated: string;
  connectionStatus: 'connected' | 'disconnected' | 'weak';
  batteryLevel: number;
  isWearingDevice: boolean;
}

export interface Location {
  lat: number;
  lon: number;
  room?: string;
  isInSafeZone: boolean;
  lastMovement: string;
}

export interface Vitals {
  heartRate: {
    current: number;
    timestamp: string;
    status: 'normal' | 'elevated' | 'low';
  };
  activityLevel: 'resting' | 'light' | 'moderate' | 'high';
  stepsToday: number;
}

export interface RiskFlags {
  fallRisk: boolean;
  wanderingDetected: boolean;
  agitationLevel: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface PatientStatus {
  patient: Patient;
  location: Location;
  vitals: Vitals;
  riskFlags: RiskFlags;
}
