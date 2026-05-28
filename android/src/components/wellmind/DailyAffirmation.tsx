import { useMemo } from 'react';
import { motion } from 'framer-motion';
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
];

interface DailyAffirmationProps {
  onRefresh?: () => void;
}

export const DailyAffirmation = ({ onRefresh }: DailyAffirmationProps) => {
  const affirmation = useMemo(() => {
    const today = new Date();
    const dayIndex = (today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate()) % affirmations.length;
    return affirmations[dayIndex];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl gradient-sunrise p-6"
    >
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-coral/30">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-coral/10" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌸</span>
          <span className="text-sm font-medium text-coral-foreground/70">Daily Affirmation</span>
        </div>
        
        <p className="text-lg font-medium text-foreground leading-relaxed mb-4">
          "{affirmation}"
        </p>

        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} className="text-muted-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            New affirmation
          </Button>
        )}
      </div>
    </motion.div>
  );
};
