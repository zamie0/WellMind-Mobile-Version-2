import { Capacitor, registerPlugin } from '@capacitor/core';
import type { HealthConnectStatus, HealthSnapshot } from './types';

interface HealthBridgePlugin {
  getHealthStatus: () => Promise<HealthConnectStatus>;
  requestHealthPermissions: () => Promise<HealthConnectStatus>;
  getHealthSnapshot: () => Promise<HealthSnapshot>;
  openHealthConnect: () => Promise<{ opened: boolean; message?: string }>;
  installHealthConnect: () => Promise<{ opened: boolean; message?: string }>;
}

const HealthBridge = registerPlugin<HealthBridgePlugin>('HealthBridge');

export const healthConnectClient = {
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

  async getSnapshot(): Promise<HealthSnapshot> {
    const snapshot = await HealthBridge.getHealthSnapshot();
    return {
      ...snapshot,
      lastSyncAt: new Date().toLocaleTimeString(),
    };
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
