export type SmartwatchConnectionState = 'checking' | 'disconnected' | 'connecting' | 'connected' | 'unavailable' | 'error';

export type HealthInsightPeriod = 'day' | 'week' | 'month';

export interface HealthConnectStatus {
  isNative: boolean;
  isAvailable: boolean;
  permissionsGranted: boolean;
  sdkStatus?: number;
  message?: string;
}

export interface HealthSnapshot {
  steps: number;
  sleepScore: number;
  restingHr: number;
  stressLevel: string;
  spo2: number;
  recovery: number;
  sleepHours: number;
  period?: HealthInsightPeriod;
  periodDays?: number;
  /** Calendar date for day snapshots (YYYY-MM-DD). */
  date?: string;
  lastSyncAt?: string;
}

export interface HealthDayRecord {
  date: string;
  steps: number;
  sleepHours: number;
  sleepScore: number;
  heartRate: number;
  spo2: number;
}

export interface HealthHistory {
  days: HealthDayRecord[];
  historyDays: number;
}

export interface HealthSnapshotOptions {
  period?: HealthInsightPeriod;
}

export interface HealthHistoryOptions {
  days?: number;
}
