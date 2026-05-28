import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreathingGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const phases = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly...', color: 'from-primary/40 to-primary/20' },
  { name: 'Hold', duration: 4, instruction: 'Hold your breath...', color: 'from-honey/40 to-honey/20' },
  { name: 'Exhale', duration: 4, instruction: 'Breathe out slowly...', color: 'from-coral/40 to-coral/20' },
  { name: 'Rest', duration: 2, instruction: 'Rest...', color: 'from-sage/40 to-sage/20' },
];

export const BreathingGame = ({ onClose, onComplete }: BreathingGameProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalCycles] = useState(5);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    if (!isPlaying || gameComplete) return;

    const timer = setInterval(() => {
      setPhaseTime((prev) => {
        const phase = phases[currentPhase];
        if (prev >= phase.duration) {
          // Move to next phase
          const nextPhase = (currentPhase + 1) % phases.length;
          setCurrentPhase(nextPhase);
          
          // If completed a full cycle
          if (nextPhase === 0) {
            setCycles((c) => {
              const newCycles = c + 1;
              if (newCycles >= totalCycles) {
                setGameComplete(true);
                setIsPlaying(false);
              }
              return newCycles;
            });
          }
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPlaying, currentPhase, gameComplete, totalCycles]);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentPhase(0);
    setPhaseTime(0);
    setCycles(0);
    setGameComplete(false);
  };

  const phase = phases[currentPhase];
  const progress = phaseTime / phase.duration;

  const getScale = () => {
    if (phase.name === 'Inhale') return 1 + progress * 0.5;
    if (phase.name === 'Exhale') return 1.5 - progress * 0.5;
    if (phase.name === 'Hold') return 1.5;
    return 1;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">
          {isPlaying && `Cycle ${cycles + 1}/${totalCycles}`}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Game Area */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
        {!isPlaying && !gameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="text-6xl mb-4">🌬️</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Breathing Sync</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-xs">
              Follow the circle to sync your breathing. Complete {totalCycles} cycles to feel calm.
            </p>
            <Button
              onClick={startGame}
              className="bg-primary text-primary-foreground px-8 py-6 text-lg rounded-full"
            >
              Begin
            </Button>
          </motion.div>
        )}

        {isPlaying && (
          <motion.div className="flex flex-col items-center">
            {/* Breathing Circle */}
            <motion.div
              animate={{ scale: getScale() }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-4 border-primary/50 flex items-center justify-center shadow-lg"
            >
              <motion.div
                animate={{ scale: getScale() * 0.6 }}
                transition={{ duration: 0.1, ease: 'linear' }}
                className="w-20 h-20 rounded-full bg-primary/40"
              />
            </motion.div>

            {/* Phase Info */}
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 text-center"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">{phase.name}</h3>
              <p className="text-muted-foreground">{phase.instruction}</p>
            </motion.div>

            {/* Progress Dots */}
            <div className="flex gap-2 mt-6">
              {Array.from({ length: totalCycles }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < cycles ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Wonderfully Calm</h2>
            <p className="text-muted-foreground mb-6">
              You completed {totalCycles} breathing cycles!
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={startGame}>
                Breathe Again
              </Button>
              <Button
                onClick={() => onComplete(totalCycles * 2)}
                className="bg-primary text-primary-foreground"
              >
                Collect Reward
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
