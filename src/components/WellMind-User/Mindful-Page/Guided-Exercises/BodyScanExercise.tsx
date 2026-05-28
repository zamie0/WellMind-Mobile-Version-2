import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BodyScanExerciseProps {
  onClose: () => void;
}

const bodyParts = [
  { name: 'Feet', instruction: 'Notice any tension in your feet. Wiggle your toes gently, then let them relax completely.', duration: 15 },
  { name: 'Legs', instruction: 'Feel your calves and thighs. Notice any tightness. Breathe into that area and release.', duration: 15 },
  { name: 'Hips', instruction: 'Bring awareness to your hips and lower back. Let gravity pull the tension away.', duration: 15 },
  { name: 'Stomach', instruction: 'Notice your belly rising and falling with each breath. Release any tightness.', duration: 15 },
  { name: 'Chest', instruction: 'Feel your chest expand and contract. Allow your heart to beat calmly.', duration: 15 },
  { name: 'Hands', instruction: 'Notice your fingers and palms. Unclench any fists and let your hands rest.', duration: 15 },
  { name: 'Arms', instruction: 'Feel the weight of your arms. Let them be heavy and completely relaxed.', duration: 15 },
  { name: 'Shoulders', instruction: 'Drop your shoulders away from your ears. Release all the tension you hold here.', duration: 15 },
  { name: 'Neck', instruction: 'Gently move awareness to your neck. Let it be soft and relaxed.', duration: 15 },
  { name: 'Face', instruction: 'Relax your jaw, soften your eyes, smooth your forehead. Let your whole face be peaceful.', duration: 15 },
  { name: 'Whole Body', instruction: 'Feel your entire body as one. Notice the peaceful feeling flowing through you.', duration: 20 },
];

export const BodyScanExercise = ({ onClose }: BodyScanExerciseProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isPaused || isComplete) return;

    const duration = bodyParts[currentStep].duration;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStep < bodyParts.length - 1) {
            setCurrentStep((s) => s + 1);
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
  }, [currentStep, isPaused, isComplete]);

  const handleSkip = () => {
    if (currentStep < bodyParts.length - 1) {
      setCurrentStep((s) => s + 1);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  const currentPart = bodyParts[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-sage-light to-background flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5">
        <span className="text-sage font-medium">Body Scan</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Body Visualization */}
              <div className="relative w-48 h-64 mx-auto mb-8">
                <svg viewBox="0 0 100 160" className="w-full h-full">
                  {/* Simple body outline */}
                  <ellipse cx="50" cy="20" rx="15" ry="18" fill={currentPart.name === 'Face' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <rect x="35" y="38" width="30" height="5" rx="2" fill={currentPart.name === 'Neck' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <rect x="20" y="43" width="60" height="10" rx="3" fill={currentPart.name === 'Shoulders' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <rect x="30" y="53" width="40" height="15" rx="3" fill={currentPart.name === 'Chest' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <rect x="30" y="68" width="40" height="20" rx="3" fill={currentPart.name === 'Stomach' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <rect x="30" y="88" width="40" height="12" rx="3" fill={currentPart.name === 'Hips' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  {/* Arms */}
                  <rect x="10" y="53" width="10" height="30" rx="3" fill={currentPart.name === 'Arms' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <rect x="80" y="53" width="10" height="30" rx="3" fill={currentPart.name === 'Arms' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  {/* Hands */}
                  <ellipse cx="15" cy="88" rx="6" ry="8" fill={currentPart.name === 'Hands' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <ellipse cx="85" cy="88" rx="6" ry="8" fill={currentPart.name === 'Hands' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  {/* Legs */}
                  <rect x="32" y="100" width="15" height="35" rx="4" fill={currentPart.name === 'Legs' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <rect x="53" y="100" width="15" height="35" rx="4" fill={currentPart.name === 'Legs' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  {/* Feet */}
                  <ellipse cx="40" cy="140" rx="10" ry="6" fill={currentPart.name === 'Feet' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  <ellipse cx="60" cy="140" rx="10" ry="6" fill={currentPart.name === 'Feet' ? 'hsl(var(--sage))' : 'hsl(var(--muted))'} className="transition-all duration-500" />
                  {/* Whole body glow */}
                  {currentPart.name === 'Whole Body' && (
                    <rect x="8" y="2" width="84" height="145" rx="10" fill="hsl(var(--sage))" fillOpacity="0.3" className="animate-pulse" />
                  )}
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">{currentPart.name}</h2>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                {currentPart.instruction}
              </p>

              {/* Step indicator */}
              <div className="flex justify-center gap-1 mb-4">
                {bodyParts.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStep ? 'bg-sage w-6' : idx < currentStep ? 'bg-sage/60' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-sage"
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Body Scan Complete</h2>
              <p className="text-muted-foreground mb-6">
                Your body is now relaxed and at peace.
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

export default BodyScanExercise;
