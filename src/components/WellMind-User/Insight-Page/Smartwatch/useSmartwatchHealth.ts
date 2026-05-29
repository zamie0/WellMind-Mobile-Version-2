import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { healthConnectClient } from './healthConnectClient';
import type { HealthSnapshot, SmartwatchConnectionState } from './types';

const CONNECTED_KEY = 'wellmind-health-connect-enabled';

export const useSmartwatchHealth = () => {
  const [state, setState] = useState<SmartwatchConnectionState>('checking');
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshSnapshot = useCallback(async () => {
    try {
      const nextSnapshot = await healthConnectClient.getSnapshot();
      setSnapshot(nextSnapshot);
      setState('connected');
      setMessage(null);
      localStorage.setItem(CONNECTED_KEY, 'true');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to sync Health Connect data.';
      setMessage(errorMessage);
      setState('error');
    }
  }, []);

  const checkStatus = useCallback(async () => {
    setState('checking');
    try {
      const status = await healthConnectClient.getStatus();
      setMessage(status.message ?? null);

      if (!status.isAvailable) {
        setState('unavailable');
        if (localStorage.getItem(CONNECTED_KEY) === 'true' && !status.permissionsGranted) {
          localStorage.removeItem(CONNECTED_KEY);
        }
        return;
      }

      if (status.permissionsGranted && localStorage.getItem(CONNECTED_KEY) === 'true') {
        await refreshSnapshot();
        return;
      }

      if (status.permissionsGranted) {
        setState('disconnected');
        return;
      }

      setState('disconnected');
      setSnapshot(null);
      localStorage.removeItem(CONNECTED_KEY);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to check Health Connect status.';
      setMessage(errorMessage);
      setState('error');
    }
  }, [refreshSnapshot]);

  const connect = useCallback(async () => {
    setState('connecting');
    try {
      let status = await healthConnectClient.getStatus();
      setMessage(status.message ?? null);

      if (!status.isAvailable) {
        try {
          await healthConnectClient.installHealthConnect();
          setMessage('Install or update Health Connect, then tap Continue again.');
        } catch {
          setMessage('Health Connect is not available. Install it from the Play Store.');
        }
        setState('unavailable');
        return;
      }

      if (!status.permissionsGranted) {
        status = await healthConnectClient.requestPermissions();
        setMessage(status.message ?? null);
      }

      if (!status.permissionsGranted) {
        try {
          await healthConnectClient.openHealthConnect();
        } catch {
          // no-op
        }
        setState('disconnected');
        setMessage(
          'Grant WellMind access to Steps, Heart rate, and Sleep in Health Connect, then return here and tap Continue again.'
        );
        toast.message('Finish permission setup in Health Connect, then tap Continue again.');
        return;
      }

      localStorage.setItem(CONNECTED_KEY, 'true');
      await refreshSnapshot();
      toast.success('Smartwatch sync connected.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to connect Health Connect.';
      setMessage(errorMessage);
      setState('error');
      toast.error(errorMessage);
    }
  }, [refreshSnapshot]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(CONNECTED_KEY);
    setSnapshot(null);
    setState('disconnected');
    setMessage('Smartwatch dashboard hidden. Reconnect any time.');
    toast.success('Smartwatch dashboard disconnected.');
  }, []);

  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (!healthConnectClient.isNative()) return;

    const onResume = () => {
      void checkStatus();
    };

    window.addEventListener('resume', onResume);
    return () => window.removeEventListener('resume', onResume);
  }, [checkStatus]);

  useEffect(() => {
    if (state !== 'connected') return;
    const interval = window.setInterval(() => {
      void refreshSnapshot();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [refreshSnapshot, state]);

  return {
    state,
    snapshot,
    message,
    connect,
    disconnect,
    refreshSnapshot,
  };
};
