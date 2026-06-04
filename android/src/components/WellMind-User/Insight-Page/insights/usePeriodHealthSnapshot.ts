import { useCallback, useEffect, useState } from 'react';
import { healthConnectClient } from '../Smartwatch/healthConnectClient';
import type { HealthInsightPeriod, HealthSnapshot } from '../Smartwatch/types';

export const usePeriodHealthSnapshot = (enabled: boolean, period: HealthInsightPeriod) => {
  const [periodHealth, setPeriodHealth] = useState<HealthSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !healthConnectClient.isNative()) {
      setPeriodHealth(null);
      return;
    }

    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const status = await healthConnectClient.getStatus();
      if (!status.permissionsGranted) {
        setPeriodHealth(null);
        return;
      }
      const snapshot = await healthConnectClient.getSnapshot({ period });
      setPeriodHealth(snapshot);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load health data.';
      if (/foreground|READ_HEALTH_DATA_IN_BACKGROUND|SecurityException/i.test(msg)) {
        setError('Open WellMind to load health data for this period.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, period]);

  useEffect(() => {
    void load();
  }, [load]);

  return { periodHealth, loading, error, reload: load };
};
