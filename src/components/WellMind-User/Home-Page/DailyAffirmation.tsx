import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const affirmations = [
  "You are doing your best, and that is enough.",
  "This moment is temporary — you are stronger than you feel.",
  "It's okay to take things one step at a time.",
  "You deserve peace and happiness.",
  "Your feelings are valid, and so are you.",
  "Every breath is a new beginning.",
  "You have overcome challenges before. You will again.",
  "Be gentle with yourself today.",
  "Your worth is not measured by your productivity.",
  "It's okay to rest. It's okay to pause.",
  "You are not alone in how you feel.",
  "Small steps still move you forward.",
  "You are allowed to set boundaries.",
  "Today, choose kindness — especially to yourself.",
  "You are more resilient than you know.",
  "Your journey is unique and beautiful.",
  "Progress, not perfection, is what matters.",
  "You bring light to the world around you.",
  "It's okay to ask for help when you need it.",
  "You are worthy of love and belonging.",
  "Every day is a fresh start.",
  "Your struggles do not define you.",
  "You are capable of amazing things.",
  "Trust the timing of your life.",
  "You are enough, just as you are.",
  "Your presence makes a difference.",
  "It's okay to not have all the answers.",
  "You are growing, even when it doesn't feel like it.",
  "Your voice matters.",
  "Celebrate your small victories.",
  "You are braver than you believe.",
  "Peace begins with a single breath.",
  "You deserve moments of joy.",
  "Your efforts are making a difference.",
  "It's okay to feel what you're feeling.",
  "You are a work in progress, and that's beautiful.",
  "Tomorrow holds new possibilities.",
  "You are worthy of your own compassion.",
  "Let go of what you cannot control.",
  "You have the power to create change.",
  "Your heart knows the way — trust it.",
  "Rest is productive too.",
  "You are more than your thoughts.",
  "Every challenge is an opportunity to grow.",
  "You are deserving of good things.",
  "Take it one moment at a time.",
  "You are not your mistakes.",
  "Your potential is limitless.",
  "It's okay to put yourself first sometimes.",
  "You are healing at your own pace.",
  "Happiness looks different for everyone — find yours.",
  "You are stronger than yesterday.",
  "Allow yourself to dream big.",
  "Your kindness creates ripples.",
  "You are exactly where you need to be.",
  "Embrace your imperfections — they make you unique.",
  "You have survived 100% of your worst days.",
  "Your inner strength is remarkable.",
  "It's okay to change your mind.",
  "You are loved more than you know.",
  "Give yourself permission to feel joy.",
  "You are making progress every day.",
  "Your story is still being written.",
  "Breathe deeply — you've got this.",
  "You are a gift to this world.",
];

interface DailyAffirmationProps {
  onRefresh?: () => void;
}

export const DailyAffirmation = ({ onRefresh }: DailyAffirmationProps) => {
  const getAffirmationIndex = useCallback(() => {
    const now = new Date();
    const halfHourSlot = Math.floor(now.getTime() / (30 * 60 * 1000));
    return halfHourSlot % affirmations.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(getAffirmationIndex);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const checkForUpdate = () => {
      const newIndex = getAffirmationIndex();
      if (newIndex !== currentIndex) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex(newIndex);
          setIsAnimating(false);
        }, 300);
      }
    };

    const interval = setInterval(checkForUpdate, 60000);
    return () => clearInterval(interval);
  }, [currentIndex, getAffirmationIndex]);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * affirmations.length);
      setCurrentIndex(randomIndex);
      setIsAnimating(false);
      onRefresh?.();
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl gradient-sunrise p-6"
    >
      <div className="absolute top-4 right-4 text-coral/30">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-coral/10" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌸</span>
          <span className="text-sm font-medium text-coral-foreground/70">Daily Affirmation</span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? -10 : 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-medium text-foreground leading-relaxed mb-4"
          >
            "{affirmations[currentIndex]}"
          </motion.p>
        </AnimatePresence>

        <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-muted-foreground">
          <RefreshCw className="h-4 w-4 mr-2" />
          New affirmation
        </Button>
      </div>
    </motion.div>
  );
};
