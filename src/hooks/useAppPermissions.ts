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
        if (type === 'camera' || type === 'microphone') {
          try {
            const result = await Camera.checkPermissions();
            if (result.camera === 'granted' && (type === 'microphone' ? result.photos === 'granted' : true)) {
              return 'granted';
            } else if (result.camera === 'denied') {
              return 'denied';
            }
            return 'prompt';
          } catch (error) {
            console.error('Failed to check camera permission:', error);
            return 'prompt';
          }
        }
        if (type === 'notifications') {
          if ('Notification' in window) {
            return Notification.permission as 'granted' | 'denied' | 'prompt';
          }
          return 'prompt';
        }
        return 'granted';
      }

      // For web
      if (type === 'notifications') {
        if ('Notification' in window) {
          const perm = Notification.permission;
          return perm === 'default' ? 'prompt' : (perm as 'granted' | 'denied' | 'prompt');
        }
        return 'prompt';
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

      return 'granted';
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
            if (type === 'camera' || type === 'microphone') {
              try {
                const result = await Camera.requestPermissions({
                  permissions: ['camera', 'photos'],
                });
                results.camera = result.camera;
                results.microphone = result.camera; // Camera permission also covers microphone for calls
                results.photos = result.photos;
              } catch (error) {
                console.error('Failed to request camera permissions:', error);
                results.camera = 'denied';
                results.microphone = 'denied';
              }
            } else if (type === 'notifications') {
              if ('Notification' in window && Notification.permission === 'prompt') {
                const permission = await Notification.requestPermission();
                results[type] = permission as 'granted' | 'denied' | 'prompt';
              } else {
                results[type] = (Notification.permission as 'granted' | 'denied' | 'prompt') || 'prompt';
              }
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
              if ('Notification' in window && Notification.permission === 'prompt') {
                const permission = await Notification.requestPermission();
                results[type] = permission as 'granted' | 'denied' | 'prompt';
              } else {
                results[type] = (Notification.permission as 'granted' | 'denied' | 'prompt') || 'prompt';
              }
            } else if (type === 'camera') {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach((track) => track.stop());
              results[type] = 'granted';
            } else if (type === 'microphone') {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach((track) => track.stop());
              results[type] = 'granted';
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
