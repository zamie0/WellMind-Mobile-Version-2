import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisualizationExerciseProps {
  onClose: () => void;
}

const scenes = [
  {
    title: 'Preparation',
    instruction: 'Close your eyes. Take three deep breaths. Let your body relax completely.',
    visual: '🌅',
    background: 'from-sky-light to-background',
    duration: 15,
  },
  {
    title: 'A Peaceful Beach',
    instruction: 'Imagine yourself on a warm, sandy beach. Feel the soft sand beneath your feet.',
    visual: '🏖️',
    background: 'from-honey-light to-background',
    duration: 20,
  },
  {
    title: 'The Gentle Waves',
    instruction: 'Watch the crystal-clear waves rolling in and out. Hear their soothing rhythm.',
    visual: '🌊',
    background: 'from-sky-light to-background',
    duration: 20,
  },
  {
    title: 'Warm Sunlight',
    instruction: 'Feel the warm sun on your skin. It fills you with golden, healing energy.',
    visual: '☀️',
    background: 'from-honey-light to-background',
    duration: 20,
  },
  {
    title: 'A Gentle Breeze',
    instruction: 'A soft, cool breeze brushes your face. It carries away all your worries.',
    visual: '🍃',
    background: 'from-sage-light to-background',
    duration: 20,
  },
  {
    title: 'Peace Within',
    instruction: 'Feel a deep sense of peace washing over you. You are safe. You are calm.',
    visual: '🕊️',
    background: 'from-lavender-light to-background',
    duration: 20,
  },
  {
    title: 'Carrying Peace',
    instruction: 'Slowly bring your awareness back. This peace stays with you always.',
    visual: '✨',
    background: 'from-primary-light to-background',
    duration: 15,
  },
];

export const VisualizationExercise = ({ onClose }: VisualizationExerciseProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isPaused || isComplete) return;

    const duration = scenes[currentScene].duration;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentScene < scenes.length - 1) {
            setCurrentScene((s) => s + 1);
            return 0;
          } else {
            setIsComplete(true);
            return 100;
          }
        }
        return prev + (100 / (duration * 10));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentScene, isPaused, isComplete]);

  const handleSkip = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene((s) => s + 1);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  const scene = scenes[currentScene];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-gradient-to-b ${scene.background} flex flex-col transition-all duration-1000`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5">
        <span className="text-foreground/80 font-medium">Peaceful Visualization</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Visual */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-8xl mb-8"
              >
                {scene.visual}
              </motion.div>

              <h2 className="text-2xl font-bold text-foreground mb-4">{scene.title}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                {scene.instruction}
              </p>

              {/* Scene indicators */}
              <div className="flex justify-center gap-2 mb-4">
                {scenes.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentScene ? 'bg-primary w-6' : idx < currentScene ? 'bg-primary/60' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-64 h-2 bg-muted/50 rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-primary/80"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Journey Complete</h2>
              <p className="text-muted-foreground mb-6">
                You've returned from your peaceful place, refreshed and calm.
              </p>
              <Button onClick={onClose}>
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
            className="w-14 h-14 rounded-full bg-white/50"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full bg-white/50"
            onClick={handleSkip}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default VisualizationExercise;
