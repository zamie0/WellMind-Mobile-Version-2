import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressiveMuscleRelaxationProps {
  onClose: () => void;
}

const muscleGroups = [
  { name: 'Hands', tense: 'Make fists with both hands. Squeeze tightly...', release: 'Now release. Feel the tension melt away.', duration: 12 },
  { name: 'Forearms', tense: 'Bend your wrists back, stretching your forearms...', release: 'Release and let your arms go limp.', duration: 12 },
  { name: 'Biceps', tense: 'Flex your biceps. Make a muscle like you\'re showing off...', release: 'Let go. Feel the heaviness in your arms.', duration: 12 },
  { name: 'Shoulders', tense: 'Raise your shoulders up to your ears. Hold them tight...', release: 'Drop them down. Feel the release.', duration: 12 },
  { name: 'Forehead', tense: 'Raise your eyebrows high, wrinkling your forehead...', release: 'Smooth it out. Let your forehead be calm.', duration: 12 },
  { name: 'Eyes', tense: 'Squeeze your eyes shut tightly...', release: 'Relax. Keep them gently closed.', duration: 12 },
  { name: 'Jaw', tense: 'Clench your jaw. Press your teeth together...', release: 'Let your jaw hang loose. Mouth slightly open.', duration: 12 },
  { name: 'Chest', tense: 'Take a deep breath and hold it. Feel your chest expand...', release: 'Exhale slowly. Let your chest relax.', duration: 12 },
  { name: 'Stomach', tense: 'Tighten your stomach muscles. Make them hard...', release: 'Release. Let your belly be soft.', duration: 12 },
  { name: 'Thighs', tense: 'Press your thighs together. Squeeze them tight...', release: 'Let them fall apart. Feel the relief.', duration: 12 },
  { name: 'Calves', tense: 'Point your toes down, flexing your calves...', release: 'Relax. Let your feet go loose.', duration: 12 },
  { name: 'Feet', tense: 'Curl your toes tightly, like you\'re gripping sand...', release: 'Spread them out and relax.', duration: 12 },
];

export const ProgressiveMuscleRelaxation = ({ onClose }: ProgressiveMuscleRelaxationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<'tense' | 'release'>('tense');
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isPaused || isComplete) return;

    const halfDuration = muscleGroups[currentStep].duration / 2;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (phase === 'tense') {
            setPhase('release');
            return 0;
          } else {
            if (currentStep < muscleGroups.length - 1) {
              setCurrentStep((s) => s + 1);
              setPhase('tense');
              return 0;
            } else {
              setIsComplete(true);
              return 100;
            }
          }
        }
        return prev + (100 / (halfDuration * 10));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, phase, isPaused, isComplete]);

  const handleSkip = () => {
    if (phase === 'tense') {
      setPhase('release');
      setProgress(0);
    } else if (currentStep < muscleGroups.length - 1) {
      setCurrentStep((s) => s + 1);
      setPhase('tense');
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  const currentGroup = muscleGroups[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-coral-light to-background flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5">
        <span className="text-coral font-medium">Progressive Muscle Relaxation</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={`${currentStep}-${phase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Visual indicator */}
              <motion.div
                animate={{
                  scale: phase === 'tense' ? [1, 1.2, 1.2] : [1.2, 1, 1],
                  backgroundColor: phase === 'tense' ? 'hsl(var(--coral))' : 'hsl(var(--sage))',
                }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
              >
                <span className="text-4xl text-white font-bold">
                  {phase === 'tense' ? '💪' : '😌'}
                </span>
              </motion.div>

              <p className="text-sm text-muted-foreground mb-2">
                Step {currentStep + 1} of {muscleGroups.length}
              </p>
              <h2 className="text-2xl font-bold text-foreground mb-2">{currentGroup.name}</h2>
              <p className={`text-lg mb-6 max-w-xs mx-auto ${phase === 'tense' ? 'text-coral' : 'text-sage'}`}>
                {phase === 'tense' ? currentGroup.tense : currentGroup.release}
              </p>

              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                phase === 'tense' ? 'bg-coral/20 text-coral' : 'bg-sage/20 text-sage'
              }`}>
                {phase === 'tense' ? '⚡ TENSE' : '🌿 RELEASE'}
              </div>

              {/* Progress bar */}
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
                <motion.div
                  className={`h-full ${phase === 'tense' ? 'bg-coral' : 'bg-sage'}`}
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
              <div className="w-24 h-24 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-sage" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Fully Relaxed</h2>
              <p className="text-muted-foreground mb-6">
                Your muscles are now tension-free. Notice how light you feel.
              </p>
              <Button onClick={onClose} className="bg-sage hover:bg-sage/90">
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
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full"
            onClick={handleSkip}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProgressiveMuscleRelaxation;
