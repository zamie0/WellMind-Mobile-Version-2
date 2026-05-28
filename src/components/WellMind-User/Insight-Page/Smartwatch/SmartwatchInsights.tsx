import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ConnectSmartwatchCard from './ConnectSmartwatchCard';
import SmartwatchMetricsDashboard from './SmartwatchMetricsDashboard';
import SmartwatchTutorial from './SmartwatchTutorial';
import { useSmartwatchHealth } from './useSmartwatchHealth';

interface SmartwatchInsightsProps {
  stressIndex: number;
}

export const SmartwatchInsights = ({ stressIndex }: SmartwatchInsightsProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const { state, snapshot, message, connect, disconnect, refreshSnapshot } = useSmartwatchHealth();

  if (state === 'connected' && snapshot) {
    return (
      <SmartwatchMetricsDashboard
        snapshot={snapshot}
        stressIndex={stressIndex}
        onRefresh={refreshSnapshot}
        onDisconnect={disconnect}
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
