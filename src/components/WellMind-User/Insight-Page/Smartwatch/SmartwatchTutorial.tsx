import { motion } from 'framer-motion';
import { CheckCircle2, HeartPulse, LockKeyhole, Settings, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SmartwatchConnectionState } from './types';

interface SmartwatchTutorialProps {
  state: SmartwatchConnectionState;
  message?: string | null;
  onConnect: () => void;
  onClose: () => void;
}

const steps = [
  {
    icon: Watch,
    title: 'Pair your watch',
    description: 'Connect your Samsung, Wear OS, or compatible device to its companion app first.',
  },
  {
    icon: HeartPulse,
    title: 'Sync to Health Connect',
    description: 'Open Health Connect and confirm your wearable app is writing steps, heart rate, and sleep.',
  },
  {
    icon: LockKeyhole,
    title: 'Grant WellMind access',
    description: 'Allow WellMind to read Health Connect data. You can revoke this later in Android Settings.',
  },
  {
    icon: CheckCircle2,
    title: 'View live insights',
    description: 'Your smartwatch metrics will appear below your mental wellness insights after connection.',
  },
];

export const SmartwatchTutorial = ({ state, message, onConnect, onClose }: SmartwatchTutorialProps) => {
  const isBusy = state === 'connecting' || state === 'checking';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="rounded-2xl bg-card p-5 shadow-soft"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Connect Smartwatch</h2>
          <p className="mt-1 text-sm text-muted-foreground">Follow these steps once. WellMind only reads data after your consent.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-3 rounded-2xl bg-background p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-light text-sage">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {message ? (
        <div className="mt-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
            <Settings className="h-4 w-4" />
            Connection note
          </div>
          {message}
        </div>
      ) : null}

      <Button className="mt-5 w-full py-6" onClick={onConnect} disabled={isBusy}>
        <Watch className="h-5 w-5" />
        {isBusy ? 'Opening Health Connect...' : 'Continue to Health Connect'}
      </Button>
    </motion.section>
  );
};

export default SmartwatchTutorial;
