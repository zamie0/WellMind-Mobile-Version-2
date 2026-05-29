import { WebPlugin } from '@capacitor/core';
import type {
  HealthConnectStatus,
  HealthHistory,
  HealthInsightPeriod,
  HealthSnapshot,
} from './types';

export class HealthBridgeWeb extends WebPlugin {
  async getHealthStatus(): Promise<HealthConnectStatus> {
    return {
      isNative: false,
      isAvailable: false,
      permissionsGranted: false,
      message: 'Health Connect sync is only available in the WellMind Android app.',
    };
  }

  async requestHealthPermissions(): Promise<HealthConnectStatus> {
    return this.getHealthStatus();
  }

  async getHealthSnapshot(_options: { period: HealthInsightPeriod }): Promise<HealthSnapshot> {
    throw new Error('Build and run the Android APK to sync Health Connect data.');
  }

  async getHealthHistory(): Promise<HealthHistory> {
    throw new Error('Build and run the Android APK to load Health Connect history.');
  }

  async openHealthConnect(): Promise<{ opened: boolean; message?: string }> {
    return { opened: false, message: 'Open Health Connect on your Android device.' };
  }

  async installHealthConnect(): Promise<{ opened: boolean; message?: string }> {
    return { opened: false, message: 'Install Health Connect from the Play Store on your Android device.' };
  }
}
