import { motion } from 'framer-motion';
import { Bluetooth, ShieldCheck, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectSmartwatchCardProps {
  message?: string | null;
  onStartTutorial: () => void;
}

export const ConnectSmartwatchCard = ({ message, onStartTutorial }: ConnectSmartwatchCardProps) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl bg-card p-5 shadow-soft"
  >
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-light text-sky">
        <Watch className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-foreground">Smartwatch Tracking</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect Android Health Connect to add live steps, sleep, heart rate, oxygen, and recovery metrics to your insights.
        </p>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-background p-3">
        <Bluetooth className="mb-2 h-5 w-5 text-primary" />
        <p className="text-sm font-medium">Optional</p>
        <p className="text-xs text-muted-foreground">Your mental insights still work without a watch.</p>
      </div>
      <div className="rounded-2xl bg-background p-3">
        <ShieldCheck className="mb-2 h-5 w-5 text-sage" />
        <p className="text-sm font-medium">Permission based</p>
        <p className="text-xs text-muted-foreground">Android controls every Health Connect data type.</p>
      </div>
    </div>

    {message ? <p className="mt-4 text-xs text-muted-foreground">{message}</p> : null}

    <Button className="mt-5 w-full py-6" onClick={onStartTutorial}>
      <Watch className="h-5 w-5" />
      Connect Smartwatch
    </Button>
  </motion.section>
);

export default ConnectSmartwatchCard;
