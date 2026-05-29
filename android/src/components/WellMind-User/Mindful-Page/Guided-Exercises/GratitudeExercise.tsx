import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface GratitudeExerciseProps {
  onClose: () => void;
}

const prompts = [
  { emoji: '🌅', prompt: 'Something that made you smile today' },
  { emoji: '🤝', prompt: 'A person you are grateful for' },
  { emoji: '✨', prompt: 'A small thing you often take for granted' },
];

export const GratitudeExercise = ({ onClose }: GratitudeExerciseProps) => {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [entries, setEntries] = useState<string[]>(['', '', '']);
  const [isComplete, setIsComplete] = useState(false);

  const handleNext = () => {
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt((p) => p + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentPrompt > 0) {
      setCurrentPrompt((p) => p - 1);
    }
  };

  const updateEntry = (value: string) => {
    const newEntries = [...entries];
    newEntries[currentPrompt] = value;
    setEntries(newEntries);
  };

  const prompt = prompts[currentPrompt];
  const filledEntries = entries.filter((e) => e.trim().length > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-honey-light to-background flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5">
        <span className="text-honey font-medium">Gratitude Practice</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentPrompt}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md"
            >
              {/* Prompt indicator */}
              <div className="flex justify-center gap-2 mb-6">
                {prompts.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentPrompt
                        ? 'bg-honey w-8'
                        : entries[idx].trim()
                        ? 'bg-honey/60'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Emoji */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl text-center mb-4"
              >
                {prompt.emoji}
              </motion.div>

              {/* Prompt text */}
              <h2 className="text-xl font-semibold text-center text-foreground mb-6">
                {prompt.prompt}
              </h2>

              {/* Text input */}
              <Textarea
                value={entries[currentPrompt]}
                onChange={(e) => updateEntry(e.target.value)}
                placeholder="Write your gratitude here..."
                className="w-full h-32 bg-white/80 border-honey/30 focus:border-honey resize-none mb-6"
              />

              {/* Navigation */}
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentPrompt === 0}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-honey hover:bg-honey/90 text-white"
                >
                  {currentPrompt === prompts.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center px-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: 2 }}
                className="w-24 h-24 rounded-full bg-honey/20 flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-12 h-12 text-honey" />
              </motion.div>

              <h2 className="text-2xl font-bold text-foreground mb-4">
                Beautiful! 🌟
              </h2>

              <p className="text-muted-foreground mb-6">
                You found {filledEntries} thing{filledEntries !== 1 ? 's' : ''} to be grateful for today.
              </p>

              {/* Summary */}
              <div className="bg-white/80 rounded-2xl p-4 mb-6 text-left space-y-3">
                {entries.map((entry, idx) => (
                  entry.trim() && (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-xl">{prompts[idx].emoji}</span>
                      <p className="text-sm text-foreground flex-1">{entry}</p>
                    </div>
                  )
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Heart className="w-4 h-4 text-coral fill-coral" />
                <span>Gratitude rewires your brain for happiness</span>
              </div>

              <Button onClick={onClose} className="bg-honey hover:bg-honey/90 text-white">
                Finish
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GratitudeExercise;
