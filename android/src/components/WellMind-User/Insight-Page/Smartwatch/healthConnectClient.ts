import { Capacitor, registerPlugin } from '@capacitor/core';
import type {
  HealthConnectStatus,
  HealthHistory,
  HealthHistoryOptions,
  HealthInsightPeriod,
  HealthSnapshot,
  HealthSnapshotOptions,
} from './types';

interface HealthBridgePlugin {
  getHealthStatus: () => Promise<HealthConnectStatus>;
  requestHealthPermissions: () => Promise<HealthConnectStatus>;
  getHealthSnapshot: (options: { period: HealthInsightPeriod }) => Promise<HealthSnapshot>;
  getHealthHistory: (options: { days: number }) => Promise<HealthHistory>;
  openHealthConnect: () => Promise<{ opened: boolean; message?: string }>;
  installHealthConnect: () => Promise<{ opened: boolean; message?: string }>;
}

const HealthBridge = registerPlugin<HealthBridgePlugin>('HealthBridge', {
  web: () => import('./healthBridgeWeb').then((m) => new m.HealthBridgeWeb()),
});

export const healthConnectClient = {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  async getStatus(): Promise<HealthConnectStatus> {
    if (!Capacitor.isNativePlatform()) {
      return {
        isNative: false,
        isAvailable: false,
        permissionsGranted: false,
        message: 'Health Connect sync is available in the Android app.',
      };
    }

    return HealthBridge.getHealthStatus();
  },

  async requestPermissions(): Promise<HealthConnectStatus> {
    if (!Capacitor.isNativePlatform()) {
      return {
        isNative: false,
        isAvailable: false,
        permissionsGranted: false,
        message: 'Build and run the Android APK to connect Health Connect.',
      };
    }

    return HealthBridge.requestHealthPermissions();
  },

  async getSnapshot(options: HealthSnapshotOptions = {}): Promise<HealthSnapshot> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Health Connect data is only available in the Android app.');
    }

    const period = options.period ?? 'day';
    const snapshot = await HealthBridge.getHealthSnapshot({ period });
    return {
      ...snapshot,
      period,
      lastSyncAt: new Date().toLocaleTimeString(),
    };
  },

  async getHistory(options: HealthHistoryOptions = {}): Promise<HealthHistory> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Health Connect history is only available in the Android app.');
    }

    const days = options.days ?? 14;
    return HealthBridge.getHealthHistory({ days });
  },

  async openHealthConnect(): Promise<{ opened: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { opened: false, message: 'Open Health Connect from the Android device.' };
    }

    return HealthBridge.openHealthConnect();
  },

  async installHealthConnect(): Promise<{ opened: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { opened: false, message: 'Install Health Connect on the Android device.' };
    }

    return HealthBridge.installHealthConnect();
  },
};
