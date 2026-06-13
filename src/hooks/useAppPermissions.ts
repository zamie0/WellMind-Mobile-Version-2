import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

export type PermissionType =
  | 'camera'
  | 'microphone'
  | 'notifications'
  | 'storage'
  | 'photos';

export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt';
  microphone: 'granted' | 'denied' | 'prompt';
  notifications: 'granted' | 'denied' | 'prompt';
  storage: 'granted' | 'denied' | 'prompt';
  photos: 'granted' | 'denied' | 'prompt';
}

const PERMISSION_STATUS_KEY = 'wellmind_permissions_requested';

const normalizePermissionState = (
  state:
    | 'granted'
    | 'denied'
    | 'prompt'
    | 'prompt-with-rationale'
    | 'limited'
    | undefined,
): 'granted' | 'denied' | 'prompt' => {
  if (state === 'prompt-with-rationale' || state === undefined) {
    return 'prompt';
  }
  if (state === 'limited') {
    return 'granted';
  }
  return state;
};

const normalizeNotificationPermission = (permission: NotificationPermission): 'granted' | 'denied' | 'prompt' => {
  if (permission === 'default') {
    return 'prompt';
  }
  return permission;
};

const verifyLocalStorageAccess = () => {
  try {
    const key = 'wellmind_storage_permission_test';
    localStorage.setItem(key, 'ok');
    localStorage.removeItem(key);
    return 'granted' as const;
  } catch {
    return 'denied' as const;
  }
};

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'denied' as const;
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return normalizeNotificationPermission(permission);
  }

  return normalizeNotificationPermission(Notification.permission);
};

export const useAppPermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: 'prompt',
    microphone: 'prompt',
    notifications: 'prompt',
    storage: 'prompt',
    photos: 'prompt',
  });

  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Check if this is first launch
  useEffect(() => {
    const hasRequested = localStorage.getItem(PERMISSION_STATUS_KEY);
    if (!hasRequested && isNative) {
      setIsFirstLaunch(true);
    }
  }, [isNative]);

  const checkPermission = useCallback(
    async (type: PermissionType): Promise<'granted' | 'denied' | 'prompt'> => {
      // For native Android/iOS
      if (isNative) {
        if (type === 'camera') {
          try {
            const result = await Camera.checkPermissions();
            return normalizePermissionState(result.camera);
          } catch (error) {
            console.error('Failed to check camera permission:', error);
            return 'prompt';
          }
        }

        if (type === 'microphone') {
          try {
            if (navigator.permissions) {
              const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
              return status.state === 'granted'
                ? 'granted'
                : status.state === 'denied'
                ? 'denied'
                : 'prompt';
            }
          } catch (error) {
            console.error('Failed to check microphone permission:', error);
          }
          return 'prompt';
        }

        if (type === 'notifications') {
          return 'Notification' in window
            ? normalizeNotificationPermission(Notification.permission)
            : 'denied';
        }

        if (type === 'photos') {
          try {
            const result = await Camera.checkPermissions();
            return normalizePermissionState(result.photos);
          } catch (error) {
            console.error('Failed to check photos permission:', error);
            return 'prompt';
          }
        }

        if (type === 'storage') {
          return verifyLocalStorageAccess();
        }

        return 'prompt';
      }

      // For web
      if (type === 'notifications') {
        return 'Notification' in window
          ? normalizeNotificationPermission(Notification.permission)
          : 'denied';
      }

      if (type === 'camera' || type === 'microphone') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: type === 'microphone',
            video: type === 'camera',
          });
          stream.getTracks().forEach((track) => track.stop());
          return 'granted';
        } catch (error) {
          if ((error as DOMException).name === 'NotAllowedError') {
            return 'denied';
          }
          return 'prompt';
        }
      }

      if (type === 'storage') {
        return verifyLocalStorageAccess();
      }

      if (type === 'photos') {
        return 'prompt';
      }

      return 'prompt';
    },
    [isNative],
  );

  const requestPermissions = useCallback(
    async (types: PermissionType[] = ['camera', 'microphone', 'notifications']) => {
      const results: Partial<PermissionStatus> = {};

      if (isNative) {
        // Native Android/iOS permissions
        try {
          for (const type of types) {
            if (type === 'camera') {
              try {
                const result = await Camera.requestPermissions({
                  permissions: ['camera', 'photos'],
                });
                results.camera = normalizePermissionState(result.camera);
                results.photos = normalizePermissionState(result.photos);
              } catch (error) {
                console.error('Failed to request camera permissions:', error);
                results.camera = 'denied';
                results.photos = 'denied';
              }
            } else if (type === 'microphone') {
              try {
                if (navigator.mediaDevices?.getUserMedia) {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  stream.getTracks().forEach((track) => track.stop());
                  results.microphone = 'granted';
                } else {
                  results.microphone = 'prompt';
                }
              } catch (error) {
                results.microphone = (error as DOMException).name === 'NotAllowedError' ? 'denied' : 'prompt';
              }
            } else if (type === 'notifications') {
              results.notifications = await requestNotificationPermission();
            } else if (type === 'photos') {
              try {
                const result = await Camera.requestPermissions({
                  permissions: ['photos'],
                });
                results.photos = normalizePermissionState(result.photos);
              } catch (error) {
                console.error('Failed to request photos permission:', error);
                results.photos = 'denied';
              }
            } else if (type === 'storage') {
              results.storage = verifyLocalStorageAccess();
            } else {
              results[type] = 'granted';
            }
          }
        } catch (error) {
          console.error('Failed to request native permissions:', error);
        }
      } else {
        // Web permissions
        for (const type of types) {
          try {
            if (type === 'notifications') {
              results.notifications = await requestNotificationPermission();
            } else if (type === 'camera') {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach((track) => track.stop());
              results[type] = 'granted';
            } else if (type === 'microphone') {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach((track) => track.stop());
              results[type] = 'granted';
            } else if (type === 'storage') {
              results.storage = verifyLocalStorageAccess();
            } else if (type === 'photos') {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              results.photos = input.accept === 'image/*' ? 'granted' : 'denied';
            } else {
              results[type] = 'granted';
            }
          } catch (error) {
            results[type] = (error as DOMException).name === 'NotAllowedError' ? 'denied' : 'prompt';
          }
        }
      }

      setPermissions((prev) => ({ ...prev, ...results }));
      localStorage.setItem(PERMISSION_STATUS_KEY, 'true');
      setIsFirstLaunch(false);

      return results as PermissionStatus;
    },
    [isNative],
  );

  return {
    permissions,
    isFirstLaunch,
    checkPermission,
    requestPermissions,
  };
};

export default useAppPermissions;
