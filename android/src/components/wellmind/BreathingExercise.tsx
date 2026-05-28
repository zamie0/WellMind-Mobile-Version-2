import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete';

const INHALE_DURATION = 4;
const HOLD_DURATION = 4;
const EXHALE_DURATION = 6;
const TOTAL_ROUNDS = 3;

export const BreathingExercise = ({ onClose }: BreathingExerciseProps) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [timer, setTimer] = useState(0);
  const [round, setRound] = useState(1);
  const [isActive, setIsActive] = useState(false);

  const getPhaseConfig = useCallback(() => {
    switch (phase) {
      case 'inhale':
        return { duration: INHALE_DURATION, next: 'hold' as Phase, text: 'Breathe In' };
      case 'hold':
        return { duration: HOLD_DURATION, next: 'exhale' as Phase, text: 'Hold' };
      case 'exhale':
        return { duration: EXHALE_DURATION, next: 'inhale' as Phase, text: 'Breathe Out' };
      default:
        return { duration: 0, next: 'idle' as Phase, text: 'Start' };
    }
  }, [phase]);

  useEffect(() => {
    if (!isActive || phase === 'idle' || phase === 'complete') return;

    const config = getPhaseConfig();
    
    if (timer < config.duration) {
      const interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Move to next phase
      if (phase === 'exhale') {
        if (round >= TOTAL_ROUNDS) {
          setPhase('complete');
          setIsActive(false);
        } else {
          setRound((r) => r + 1);
          setPhase('inhale');
        }
      } else {
        setPhase(config.next);
      }
      setTimer(0);
    }
  }, [isActive, phase, timer, round, getPhaseConfig]);

  const startExercise = () => {
    setPhase('inhale');
    setTimer(0);
    setRound(1);
    setIsActive(true);
  };

  const togglePause = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setPhase('idle');
    setTimer(0);
    setRound(1);
    setIsActive(false);
  };

  const config = getPhaseConfig();
  const progress = phase !== 'idle' && phase !== 'complete' 
    ? (timer / config.duration) * 100 
    : 0;

  const circleScale = phase === 'inhale' 
    ? 1 + (timer / INHALE_DURATION) * 0.5 
    : phase === 'exhale' 
      ? 1.5 - (timer / EXHALE_DURATION) * 0.5 
      : phase === 'hold' 
        ? 1.5 
        : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-foreground">Breathing Exercise</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col items-center">
          {/* Breathing circle */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            {/* Background circle */}
            <div className="absolute w-48 h-48 rounded-full bg-primary-light/50" />
            
            {/* Animated circle */}
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute w-48 h-48 rounded-full gradient-hero opacity-40"
            />
            
            {/* Progress ring */}
            <svg className="absolute w-56 h-56 -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke="hsl(var(--primary-light))"
                strokeWidth="8"
              />
              <motion.circle
                cx="112"
                cy="112"
                r="100"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={628}
                strokeDashoffset={628 - (progress / 100) * 628}
                transition={{ duration: 0.3 }}
              />
            </svg>

            {/* Center content */}
            <div className="relative z-10 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-semibold text-primary"
                >
                  {phase === 'complete' ? '✨ Done!' : config.text}
                </motion.div>
              </AnimatePresence>
              
              {phase !== 'idle' && phase !== 'complete' && (
                <div className="text-4xl font-bold text-foreground mt-2">
                  {config.duration - timer}
                </div>
              )}
            </div>
          </div>

          {/* Round indicator */}
          {phase !== 'idle' && phase !== 'complete' && (
            <div className="flex gap-2 mb-6">
              {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < round ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            {phase === 'idle' && (
              <Button variant="hero" size="lg" onClick={startExercise}>
                <Play className="h-5 w-5 mr-2" />
                Begin
              </Button>
            )}

            {(phase !== 'idle' && phase !== 'complete') && (
              <>
                <Button variant="outline" size="icon-lg" onClick={reset}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button variant="sage" size="lg" onClick={togglePause}>
                  {isActive ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
              </>
            )}

            {phase === 'complete' && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground text-center">
                  Great job! You completed {TOTAL_ROUNDS} rounds.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Again
                  </Button>
                  <Button variant="sage" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
