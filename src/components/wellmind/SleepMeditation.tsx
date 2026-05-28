import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Moon, Pause, Play, SkipForward } from 'lucide-react';

interface SleepMeditationProps {
  onClose: () => void;
}

const meditationSteps = [
  {
    title: 'Get Comfortable',
    instruction: 'Lie down in a comfortable position. Close your eyes gently.',
    duration: 10,
  },
  {
    title: 'Deep Breath',
    instruction: 'Take a slow, deep breath in through your nose... and exhale slowly through your mouth.',
    duration: 15,
  },
  {
    title: 'Release Tension',
    instruction: 'Feel your body sinking into the bed. Let go of any tension in your shoulders.',
    duration: 15,
  },
  {
    title: 'Calm Your Mind',
    instruction: 'If thoughts arise, acknowledge them gently and let them drift away like clouds.',
    duration: 15,
  },
  {
    title: 'Body Relaxation',
    instruction: 'Starting from your toes, feel each part of your body becoming heavy and relaxed.',
    duration: 20,
  },
  {
    title: 'Peaceful Visualization',
    instruction: 'Imagine a calm, peaceful place. Perhaps a quiet beach or a serene forest.',
    duration: 20,
  },
  {
    title: 'Gentle Waves',
    instruction: 'Feel waves of relaxation washing over you with each breath.',
    duration: 20,
  },
  {
    title: 'Drift Away',
    instruction: 'Allow yourself to drift into peaceful, restful sleep...',
    duration: 30,
  },
];

export const SleepMeditation = ({ onClose }: SleepMeditationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const step = meditationSteps[currentStep];
  const totalDuration = step.duration;

  useEffect(() => {
    if (isPaused || isComplete) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStep < meditationSteps.length - 1) {
            setCurrentStep((s) => s + 1);
            return 0;
          } else {
            setIsComplete(true);
            return 100;
          }
        }
        return prev + (100 / totalDuration);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, isPaused, isComplete, totalDuration]);

  const handleSkip = () => {
    if (currentStep < meditationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[hsl(260,40%,15%)] to-[hsl(260,50%,8%)] flex flex-col"
    >
      {/* Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-lavender" />
          <span className="text-white/80 text-sm">Sleep Meditation</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 relative z-10">
        <div className="flex gap-1">
          {meditationSteps.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden"
            >
              <motion.div
                className="h-full bg-lavender"
                initial={{ width: 0 }}
                animate={{
                  width: index < currentStep ? '100%' : index === currentStep ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Moon Animation */}
              <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-lavender/30 to-lavender/10 mx-auto mb-8 flex items-center justify-center relative"
                animate={{
                  boxShadow: [
                    '0 0 40px hsl(260, 60%, 65%, 0.3)',
                    '0 0 80px hsl(260, 60%, 65%, 0.5)',
                    '0 0 40px hsl(260, 60%, 65%, 0.3)',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Moon className="h-16 w-16 text-lavender" />
              </motion.div>

              {/* Step Title */}
              <h3 className="text-xl font-semibold text-white mb-4">
                {step.title}
              </h3>

              {/* Instruction */}
              <p className="text-white/70 text-lg leading-relaxed max-w-sm mx-auto">
                {step.instruction}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                className="text-6xl mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌙
              </motion.div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Sweet Dreams
              </h3>
              <p className="text-white/70 mb-8">
                May you have a peaceful, restful sleep.
              </p>
              <Button
                onClick={onClose}
                className="bg-lavender hover:bg-lavender/90 text-white"
              >
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {!isComplete && (
        <div className="p-6 flex justify-center gap-4 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className="w-14 h-14 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="w-14 h-14 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default SleepMeditation;
