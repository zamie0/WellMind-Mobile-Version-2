import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NotificationSettings, PrivacySettings } from '@/types/wellmind';

interface SettingsState {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  
  // Actions
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyReminder: true,
  reminderTime: '09:00',
  moodCheckReminder: true,
  streakReminder: true,
  weeklyReport: true,
  motivationalMessages: true,
};

const DEFAULT_PRIVACY: PrivacySettings = {
  shareAnonymousData: false,
  showProfileInPeerChat: true,
  allowDirectMessages: true,
  dataRetentionDays: 365,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      privacy: DEFAULT_PRIVACY,

      updateNotifications: (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        }));
      },

      updatePrivacy: (settings) => {
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        }));
      },

      resetToDefaults: () => {
        set({
          notifications: DEFAULT_NOTIFICATIONS,
          privacy: DEFAULT_PRIVACY,
        });
      },
    }),
    {
      name: 'wellmind-settings',
    }
  )
);
