import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { apiRequest } from '@/lib/apiClient';
import type { ChatRole } from '@/lib/realtimeCounselorChat';

let initializedFor: string | null = null;
let localNotificationId = Date.now() % 100000;

const nextNotificationId = () => {
  localNotificationId += 1;
  return localNotificationId;
};

const canUseBrowserNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

export const showAppNotification = async (title: string, body: string, data?: Record<string, unknown>) => {
  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') return;
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: nextNotificationId(),
        title,
        body,
        extra: data,
        schedule: { at: new Date(Date.now() + 250) },
      }],
    });
    return;
  }

  if (canUseBrowserNotifications()) {
    new Notification(title, { body, data });
  }
};

export const initializeNativeNotifications = async (role: ChatRole, participantId: string) => {
  const key = `${role}:${participantId}`;
  if (initializedFor === key) return;
  initializedFor = key;

  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  await LocalNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.removeAllListeners();

  PushNotifications.addListener('registration', (token) => {
    void apiRequest('/api/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify({
        role,
        participantId,
        token: token.value,
        platform: Capacitor.getPlatform(),
      }),
    }).catch((error) => {
      console.error('Failed to register push notification token:', error);
    });
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push notification registration failed:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    void showAppNotification(
      notification.title || 'WellMind',
      notification.body || 'You have a new update.',
      notification.data,
    );
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
    const data = event.notification.data || {};
    const conversationId = data.conversationId;
    const type = data.type;

    if (typeof conversationId !== 'string') return;

    const path = role === 'counselor' ? '/counselor' : '/Counselor';
    const param = type === 'call' ? 'callConversationId' : 'conversationId';
    window.location.assign(`${path}?${param}=${encodeURIComponent(conversationId)}`);
  });

  await PushNotifications.register();
};
