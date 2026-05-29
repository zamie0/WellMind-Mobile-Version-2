export type SmartwatchConnectionState = 'checking' | 'disconnected' | 'connecting' | 'connected' | 'unavailable' | 'error';

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
  lastSyncAt?: string;
}
