import { WebPlugin } from '@capacitor/core';
import type { HealthConnectStatus, HealthSnapshot } from './types';

/**
 * Browser fallback when HealthBridge native code is not present.
 * Health Connect only runs inside the Android APK (see android/.../HealthBridgePlugin.kt).
 */
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

  async getHealthSnapshot(): Promise<HealthSnapshot> {
    throw new Error('Build and run the Android APK to sync Health Connect data.');
  }

  async openHealthConnect(): Promise<{ opened: boolean; message?: string }> {
    return { opened: false, message: 'Open Health Connect on your Android device.' };
  }

  async installHealthConnect(): Promise<{ opened: boolean; message?: string }> {
    return { opened: false, message: 'Install Health Connect from the Play Store on your Android device.' };
  }
}
