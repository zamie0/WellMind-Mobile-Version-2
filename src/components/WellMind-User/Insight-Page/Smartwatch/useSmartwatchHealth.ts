import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { healthConnectClient } from './healthConnectClient';
import type { HealthHistory, HealthInsightPeriod, HealthSnapshot, SmartwatchConnectionState } from './types';

const CONNECTED_KEY = 'wellmind-health-connect-enabled';

const isForegroundSyncError = (message: string): boolean =>
  /foreground|READ_HEALTH_DATA_IN_BACKGROUND|SecurityException/i.test(message);

export const useSmartwatchHealth = () => {
  const [state, setState] = useState<SmartwatchConnectionState>('checking');
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [history, setHistory] = useState<HealthHistory | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const snapshotRef = useRef<HealthSnapshot | null>(null);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const loadHistory = useCallback(async () => {
    if (!healthConnectClient.isNative()) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

    setHistoryLoading(true);
    try {
      const data = await healthConnectClient.getHistory({ days: 14 });
      setHistory(data);
    } catch {
      // History is optional; dashboard still works with today's snapshot.
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refreshSnapshot = useCallback(
    async (period: HealthInsightPeriod = 'day') => {
      if (!healthConnectClient.isNative()) return;

      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      try {
        const nextSnapshot = await healthConnectClient.getSnapshot({ period });
        setSnapshot(nextSnapshot);
        setState('connected');
        setMessage(null);
        localStorage.setItem(CONNECTED_KEY, 'true');

        if (period === 'day') {
          void loadHistory();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unable to sync Health Connect data.';

        if (isForegroundSyncError(errorMessage)) {
          setMessage('Keep WellMind open to refresh health data.');
          if (snapshotRef.current) {
            setState('connected');
          }
          return;
        }

        setMessage(errorMessage);
        if (snapshotRef.current) {
          setState('connected');
        } else {
          setState('error');
        }
      }
    },
    [loadHistory]
  );

  const checkStatus = useCallback(async () => {
    setState('checking');
    try {
      const status = await healthConnectClient.getStatus();
      setMessage(status.message ?? null);

      if (!status.isAvailable) {
        setState('unavailable');
        return;
      }

      if (!status.permissionsGranted) {
        setState('disconnected');
        if (!snapshotRef.current) {
          localStorage.removeItem(CONNECTED_KEY);
        }
        return;
      }

      if (localStorage.getItem(CONNECTED_KEY) === 'true' || snapshotRef.current) {
        await refreshSnapshot('day');
        return;
      }

      setState('disconnected');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to check Health Connect status.';
      setMessage(errorMessage);
      setState(snapshotRef.current ? 'connected' : 'error');
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
          'Grant WellMind access to Steps, Heart rate, Sleep, and Oxygen in Health Connect, then return and tap Continue again.'
        );
        toast.message('Finish permission setup in Health Connect, then tap Continue again.');
        return;
      }

      localStorage.setItem(CONNECTED_KEY, 'true');
      await refreshSnapshot('day');
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
    setHistory(null);
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
      if (document.visibilityState !== 'visible') return;
      void checkStatus();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem(CONNECTED_KEY) === 'true') {
        void refreshSnapshot('day');
      }
    };

    window.addEventListener('resume', onResume);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('resume', onResume);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [checkStatus, refreshSnapshot]);

  return {
    state,
    snapshot,
    history,
    historyLoading,
    message,
    connect,
    disconnect,
    refreshSnapshot,
    reloadHistory: loadHistory,
  };
};
