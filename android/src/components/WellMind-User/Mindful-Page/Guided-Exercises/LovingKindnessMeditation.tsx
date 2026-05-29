import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LovingKindnessMeditationProps {
  onClose: () => void;
}

const stages = [
  {
    recipient: 'Yourself',
    emoji: '🪞',
    instruction: 'Start by sending loving-kindness to yourself. You deserve love and compassion.',
    phrases: [
      'May I be happy',
      'May I be healthy',
      'May I be safe',
      'May I live with ease',
    ],
    duration: 30,
  },
  {
    recipient: 'A Loved One',
    emoji: '💝',
    instruction: 'Think of someone you love deeply. Send them your warmest wishes.',
    phrases: [
      'May you be happy',
      'May you be healthy',
      'May you be safe',
      'May you live with ease',
    ],
    duration: 30,
  },
  {
    recipient: 'A Neutral Person',
    emoji: '🤝',
    instruction: 'Think of someone you neither like nor dislike. Extend kindness to them too.',
    phrases: [
      'May you be happy',
      'May you be healthy',
      'May you be safe',
      'May you live with ease',
    ],
    duration: 30,
  },
  {
    recipient: 'A Difficult Person',
    emoji: '🌱',
    instruction: 'Think of someone you find challenging. This is the hardest but most transformative.',
    phrases: [
      'May you be happy',
      'May you be healthy',
      'May you be safe',
      'May you live with ease',
    ],
    duration: 30,
  },
  {
    recipient: 'All Beings',
    emoji: '🌍',
    instruction: 'Expand your loving-kindness to all living beings everywhere.',
    phrases: [
      'May all beings be happy',
      'May all beings be healthy',
      'May all beings be safe',
      'May all beings live with ease',
    ],
    duration: 30,
  },
];

export const LovingKindnessMeditation = ({ onClose }: LovingKindnessMeditationProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isPaused || isComplete) return;

    const stage = stages[currentStage];
    const phraseDuration = stage.duration / stage.phrases.length;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentPhrase < stage.phrases.length - 1) {
            setCurrentPhrase((p) => p + 1);
            return 0;
          } else if (currentStage < stages.length - 1) {
            setCurrentStage((s) => s + 1);
            setCurrentPhrase(0);
            return 0;
          } else {
            setIsComplete(true);
            return 100;
          }
        }
        return prev + (100 / (phraseDuration * 10));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStage, currentPhrase, isPaused, isComplete]);

  const handleSkip = () => {
    const stage = stages[currentStage];
    if (currentPhrase < stage.phrases.length - 1) {
      setCurrentPhrase((p) => p + 1);
      setProgress(0);
    } else if (currentStage < stages.length - 1) {
      setCurrentStage((s) => s + 1);
      setCurrentPhrase(0);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  const stage = stages[currentStage];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-lavender-light to-background flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5">
        <span className="text-lavender font-medium">Loving-Kindness</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={`${currentStage}-${currentPhrase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Heart animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-32 h-32 rounded-full bg-lavender/20 flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-5xl">{stage.emoji}</span>
              </motion.div>

              <p className="text-sm text-muted-foreground mb-2">
                {currentStage + 1} of {stages.length}
              </p>
              <h2 className="text-2xl font-bold text-foreground mb-2">{stage.recipient}</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                {stage.instruction}
              </p>

              {/* Current phrase */}
              <motion.div
                key={currentPhrase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur rounded-2xl px-6 py-4 shadow-soft mb-6"
              >
                <div className="flex items-center justify-center gap-2 text-lavender">
                  <Heart className="w-5 h-5 fill-lavender" />
                  <span className="text-lg font-medium">{stage.phrases[currentPhrase]}</span>
                  <Heart className="w-5 h-5 fill-lavender" />
                </div>
              </motion.div>

              {/* Phrase indicators */}
              <div className="flex justify-center gap-2 mb-4">
                {stage.phrases.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentPhrase ? 'bg-lavender w-6' : idx < currentPhrase ? 'bg-lavender/60' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-lavender"
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
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
                className="w-24 h-24 rounded-full bg-lavender/20 flex items-center justify-center mx-auto mb-6"
              >
                <Heart className="w-12 h-12 text-lavender fill-lavender" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Heart Full of Love</h2>
              <p className="text-muted-foreground mb-6">
                You've shared kindness with yourself and the world. Carry this feeling with you.
              </p>
              <Button onClick={onClose} className="bg-lavender hover:bg-lavender/90 text-white">
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

export default LovingKindnessMeditation;
