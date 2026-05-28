import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ConnectSmartwatchCard from './ConnectSmartwatchCard';
import SmartwatchMetricsDashboard from './SmartwatchMetricsDashboard';
import SmartwatchTutorial from './SmartwatchTutorial';
import { useSmartwatchHealth } from './useSmartwatchHealth';

interface SmartwatchInsightsProps {
  stressIndex: number;
  onUnlinked?: () => void;
  onLinked?: () => void;
}

export const SmartwatchInsights = ({ stressIndex, onUnlinked, onLinked }: SmartwatchInsightsProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const { state, snapshot, message, connect, disconnect, refreshSnapshot } = useSmartwatchHealth();

  useEffect(() => {
    if (state === 'connected' && snapshot) {
      onLinked?.();
    }
  }, [state, snapshot, onLinked]);

  if (state === 'connected' && snapshot) {
    return (
      <SmartwatchMetricsDashboard
        snapshot={snapshot}
        stressIndex={stressIndex}
        onRefresh={refreshSnapshot}
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
