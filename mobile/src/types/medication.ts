export interface Medication {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  nextDose: string;
  lastTaken: string | null;
  adherenceRate: number;
  missedDoses: number;
}

export type MedicationStatus = 'taken' | 'missed' | 'late' | 'skipped';

export interface MedicationEvent {
  eventId: string;
  medicationId: string;
  scheduledTime: string;
  takenTime: string | null;
  status: MedicationStatus;
  notes?: string;
}

export interface MedicationsResponse {
  patientId: string;
  date: string;
  adherenceRate: number;
  missedDoses7Days: number;
  medications: Medication[];
  events: MedicationEvent[];
}
