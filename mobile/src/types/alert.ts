export type AlertType = 'fall' | 'wandering' | 'medication' | 'vitals' | 'agitation' | 'device';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  timestamp: string;
  message: string;
  details: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  actionTaken: string | null;
}

export interface AlertsResponse {
  patientId: string;
  totalCount: number;
  activeCount: number;
  alerts: Alert[];
}
