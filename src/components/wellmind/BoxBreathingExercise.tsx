import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoxBreathingExerciseProps {
  onClose: () => void;
}

const phases = [
  { name: 'Inhale', instruction: 'Breathe in slowly', duration: 4 },
  { name: 'Hold', instruction: 'Hold your breath', duration: 4 },
  { name: 'Exhale', instruction: 'Breathe out slowly', duration: 4 },
  { name: 'Hold', instruction: 'Hold empty', duration: 4 },
];

export const BoxBreathingExercise = ({ onClose }: BoxBreathingExerciseProps) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(phases[0].duration);
  const [isComplete, setIsComplete] = useState(false);
  const totalCycles = 4;

  useEffect(() => {
    if (isPaused || isComplete) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextPhase = (currentPhase + 1) % 4;
          if (nextPhase === 0) {
            const newCycles = cycles + 1;
            if (newCycles >= totalCycles) {
              setIsComplete(true);
              return 0;
            }
            setCycles(newCycles);
          }
          setCurrentPhase(nextPhase);
          return phases[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase, cycles, isPaused, isComplete]);

  const phase = phases[currentPhase];

  // Calculate box position based on phase
  const getBoxPosition = () => {
    switch (currentPhase) {
      case 0: return { x: 0, y: -60 }; // Top (inhale - moving up)
      case 1: return { x: 60, y: -60 }; // Right (hold at top)
      case 2: return { x: 60, y: 0 }; // Bottom right (exhale - moving down)
      case 3: return { x: 0, y: 0 }; // Start (hold at bottom)
      default: return { x: 0, y: 0 };
    }
  };

  const position = getBoxPosition();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-sky-light to-background flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5">
        <span className="text-sky font-medium">Box Breathing</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              {/* Box visualization */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                {/* Box outline */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <rect
                    x="10"
                    y="10"
                    width="80"
                    height="80"
                    fill="none"
                    stroke="hsl(var(--sky))"
                    strokeWidth="3"
                    strokeDasharray="80"
                    strokeDashoffset={80 - (80 * countdown / phases[currentPhase].duration)}
                    className="transition-all"
                    style={{
                      transformOrigin: 'center',
                      transform: `rotate(${currentPhase * 90}deg)`,
                    }}
                  />
                  <rect
                    x="10"
                    y="10"
                    width="80"
                    height="80"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                </svg>

                {/* Moving dot */}
                <motion.div
                  animate={{
                    x: position.x,
                    y: position.y,
                  }}
                  transition={{ duration: phases[currentPhase].duration, ease: 'linear' }}
                  className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-sky shadow-lg"
                />

                {/* Center countdown */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-sky">{countdown}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">{phase.name}</h2>
              <p className="text-muted-foreground mb-4">{phase.instruction}</p>

              {/* Cycle indicator */}
              <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: totalCycles }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx < cycles ? 'bg-sky' : idx === cycles ? 'bg-sky/50 animate-pulse' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Cycle {cycles + 1} of {totalCycles}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-sky/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-sky" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Box Breathing Complete</h2>
              <p className="text-muted-foreground mb-6">
                You've completed {totalCycles} cycles. Your nervous system is now calm and balanced.
              </p>
              <Button onClick={onClose} className="bg-sky hover:bg-sky/90 text-white">
                Finish
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {!isComplete && (
        <div className="flex justify-center gap-4 p-8">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="p-5 text-center">
        <p className="text-xs text-muted-foreground">
          Box breathing (4-4-4-4) is used by Navy SEALs to stay calm under pressure
        </p>
      </div>
    </motion.div>
  );
};

export default BoxBreathingExercise;
