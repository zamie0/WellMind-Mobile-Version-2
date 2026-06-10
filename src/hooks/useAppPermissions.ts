import { useEffect, useState, useCallback } from 'react';

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

  // Check if this is first launch
  useEffect(() => {
    const hasRequested = localStorage.getItem(PERMISSION_STATUS_KEY);
    if (!hasRequested) {
      setIsFirstLaunch(true);
    }
  }, []);

  const checkPermission = useCallback(
    async (type: PermissionType): Promise<'granted' | 'denied' | 'prompt'> => {
      // For web, we can only check certain permissions
      if (type === 'notifications') {
        if ('Notification' in window) {
          return Notification.permission as 'granted' | 'denied' | 'prompt';
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

      // For storage and photos on web, we treat them as granted
      return 'granted';
    },
    [],
  );

  const requestPermissions = useCallback(
    async (types: PermissionType[] = ['camera', 'microphone', 'notifications']) => {
      const results: Partial<PermissionStatus> = {};

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

      setPermissions((prev) => ({ ...prev, ...results }));
      localStorage.setItem(PERMISSION_STATUS_KEY, 'true');
      setIsFirstLaunch(false);

      return results as PermissionStatus;
    },
    [],
  );

  return {
    permissions,
    isFirstLaunch,
    checkPermission,
    requestPermissions,
  };
};

export default useAppPermissions;
