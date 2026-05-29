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
        localStorage.removeItem(CONNECTED_KEY);
        return;
      }

      if (status.permissionsGranted && localStorage.getItem(CONNECTED_KEY) === 'true') {
        await refreshSnapshot();
        return;
      }

      setState(status.permissionsGranted ? 'connected' : 'disconnected');
      if (status.permissionsGranted) {
        await refreshSnapshot();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to check Health Connect status.';
      setMessage(errorMessage);
      setState('error');
    }
  }, [refreshSnapshot]);

  const connect = useCallback(async () => {
    setState('connecting');
    try {
      const status = await healthConnectClient.requestPermissions();
      setMessage(status.message ?? null);

      if (!status.isAvailable) {
        // If Health Connect isn't available, open the Health Connect app/settings to install/enable it.
        try {
          await healthConnectClient.openHealthConnect();
        } catch {
          // ignore errors here, user can install via Play Store
          try {
            await healthConnectClient.installHealthConnect();
          } catch {
            // no-op
          }
        }

        setState('unavailable');
        return;
      }

      if (!status.permissionsGranted) {
        setState('disconnected');
        toast.error('Health Connect permissions were not granted.');
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
