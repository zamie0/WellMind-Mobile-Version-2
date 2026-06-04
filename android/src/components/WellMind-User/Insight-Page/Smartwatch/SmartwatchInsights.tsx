import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ConnectSmartwatchCard from './ConnectSmartwatchCard';
import SmartwatchMetricsDashboard from './SmartwatchMetricsDashboard';
import SmartwatchTutorial from './SmartwatchTutorial';
import { useSmartwatchHealth } from './useSmartwatchHealth';

export type SmartwatchHealthController = ReturnType<typeof useSmartwatchHealth>;

interface SmartwatchInsightsProps {
  stressIndex: number;
  onUnlinked?: () => void;
  onLinked?: () => void;
  /** When provided, avoids duplicate Health Connect hooks (e.g. from Insights page). */
  health?: SmartwatchHealthController;
}

export const SmartwatchInsights = ({ stressIndex, onUnlinked, onLinked, health: externalHealth }: SmartwatchInsightsProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const internalHealth = useSmartwatchHealth();
  const { state, snapshot, history, historyLoading, message, connect, disconnect, refreshSnapshot } =
    externalHealth ?? internalHealth;

  useEffect(() => {
    if (state === 'connected' && snapshot) {
      onLinked?.();
    }
  }, [state, snapshot, onLinked]);

  if (state === 'connected' && snapshot) {
    return (
      <SmartwatchMetricsDashboard
        snapshot={snapshot}
        history={history}
        historyLoading={historyLoading}
        stressIndex={stressIndex}
        onRefresh={() => void refreshSnapshot('day')}
        onDisconnect={() => {
          disconnect();
          onUnlinked?.();
        }}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showTutorial ? (
        <SmartwatchTutorial
          key="smartwatch-tutorial"
          state={state}
          message={message}
          onConnect={connect}
          onClose={() => setShowTutorial(false)}
        />
      ) : (
        <ConnectSmartwatchCard
          key="smartwatch-connect"
          message={message}
          onStartTutorial={() => setShowTutorial(true)}
        />
      )}
    </AnimatePresence>
  );
};

export default SmartwatchInsights;
