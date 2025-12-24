/**
 * Consent Management Types
 * Sprint 3: Recognition & Safety Planning
 */

export type ConsentType = 
  | 'face_recognition'
  | 'voice_recognition'
  | 'location_tracking'
  | 'biometrics'
  | 'ai_assistant'
  | 'data_sharing'
  | 'emergency_contact';

export interface ConsentRecord {
  consentId: string;
  patientId: string;
  type: ConsentType;
  granted: boolean;
  timestamp: string;
  version: number;
  revokedAt?: string;
  notes?: string;
  grantedBy?: string; // userId who granted consent (patient or caregiver)
}

export interface ConsentVersion {
  version: number;
  effectiveDate: string;
  description: string;
  changesFromPrevious?: string[];
}

export interface ConsentRequest {
  type: ConsentType;
  granted: boolean;
  notes?: string;
}

export interface ConsentResponse {
  success: boolean;
  consent: ConsentRecord;
}

/**
 * Face Recognition Types
 */

export interface FaceEnrollmentRequest {
  patientId: string;
  imageBase64: string; // Base64 encoded image (stub - will be processed by ML)
  label: string; // e.g., "Daughter Sarah", "Dr. Johnson"
  relationship?: string; // "family", "friend", "caregiver", "medical"
  notes?: string;
}

export interface FaceEnrollment {
  enrollmentId: string;
  patientId: string;
  embeddingId: string; // Placeholder for ML feature vector ID
  label: string;
  relationship?: string;
  enrolledAt: string;
  enrolledBy: string; // userId
  imageUrl?: string; // Thumbnail for display (not used for recognition)
  status: 'active' | 'disabled' | 'deleted';
  lastUsed?: string;
  matchCount: number; // Number of successful matches
  notes?: string;
}

export interface FaceEnrollmentResponse {
  success: boolean;
  enrollment: FaceEnrollment;
  message?: string;
}

export interface FaceDetectionEvent {
  eventId: string;
  patientId: string;
  detectedAt: string;
  matched: boolean;
  matchedEnrollmentId?: string;
  matchedLabel?: string;
  confidence?: number; // 0-1 similarity score
  location?: string;
  imageUrl?: string; // Event capture (optional)
  alertTriggered: boolean;
}

/**
 * Voice Recognition Types
 */

export interface VoiceEnrollmentRequest {
  patientId: string;
  audioBase64: string; // Base64 encoded audio sample (stub)
  label: string; // e.g., "Daughter Sarah"
  relationship?: string;
  duration: number; // Duration in seconds
  sampleQuality?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface VoiceProfile {
  profileId: string;
  patientId: string;
  featureVectorId: string; // Placeholder for ML feature vector ID
  label: string;
  relationship?: string;
  enrolledAt: string;
  enrolledBy: string;
  sampleCount: number; // Number of voice samples enrolled
  status: 'active' | 'disabled' | 'deleted';
  lastUsed?: string;
  matchCount: number;
  notes?: string;
}

export interface VoiceEnrollmentResponse {
  success: boolean;
  profile: VoiceProfile;
  message?: string;
}

export interface VoiceDetectionEvent {
  eventId: string;
  patientId: string;
  detectedAt: string;
  matched: boolean;
  matchedProfileId?: string;
  matchedLabel?: string;
  confidence?: number; // 0-1 confidence score
  location?: string;
  alertTriggered: boolean;
  speakerCount?: number; // Number of speakers detected
}

/**
 * Recognition Settings
 */

export interface RecognitionSettings {
  patientId: string;
  face: {
    enabled: boolean;
    threshold: number; // 0-1, higher = stricter matching
    alertOnUnknown: boolean;
    alertOnKnown: boolean;
    minConfidence: number; // Minimum confidence to trigger alert
  };
  voice: {
    enabled: boolean;
    threshold: number;
    alertOnUnknown: boolean;
    alertOnKnown: boolean;
    minConfidence: number;
  };
  updatedAt: string;
  updatedBy: string;
}

/**
 * Safety & Privacy
 */

export interface DataRetentionPolicy {
  consentType: ConsentType;
  retentionDays: number; // -1 = indefinite, 0 = delete immediately
  autoDelete: boolean;
  lastReviewDate?: string;
}

export interface AuditEntry {
  auditId: string;
  patientId: string;
  action: 'consent_granted' | 'consent_revoked' | 'enrollment_created' | 'enrollment_deleted' | 'detection_event' | 'settings_changed' | 'data_accessed' | 'data_deleted';
  actor: string; // userId who performed the action
  actorRole: 'patient' | 'caregiver' | 'system';
  timestamp: string;
  details: Record<string, any>;
  ipAddress?: string;
  deviceId?: string;
}

export interface PrivacyReport {
  patientId: string;
  generatedAt: string;
  consents: ConsentRecord[];
  enrollments: {
    face: number;
    voice: number;
  };
  detectionEvents: {
    face: number;
    voice: number;
    lastEvent?: string;
  };
  dataRetention: DataRetentionPolicy[];
  auditLog: AuditEntry[];
}
