import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Emotion } from '@/types/wellmind';

interface EmotionButtonProps {
  emotion: Emotion;
  label: string;
  icon: string;
  selected?: boolean;
  onClick: () => void;
}

const emotionColors: Record<Emotion, string> = {
  happy: 'bg-emotion-happy/20 border-emotion-happy hover:bg-emotion-happy/30',
  neutral: 'bg-emotion-neutral/20 border-emotion-neutral hover:bg-emotion-neutral/30',
  sad: 'bg-emotion-sad/20 border-emotion-sad hover:bg-emotion-sad/30',
  anxious: 'bg-emotion-anxious/20 border-emotion-anxious hover:bg-emotion-anxious/30',
  stressed: 'bg-emotion-stressed/20 border-emotion-stressed hover:bg-emotion-stressed/30',
  exhausted: 'bg-emotion-exhausted/20 border-emotion-exhausted hover:bg-emotion-exhausted/30',
  numb: 'bg-emotion-numb/20 border-emotion-numb hover:bg-emotion-numb/30',
};

const selectedColors: Record<Emotion, string> = {
  happy: 'bg-emotion-happy border-emotion-happy',
  neutral: 'bg-emotion-neutral border-emotion-neutral',
  sad: 'bg-emotion-sad border-emotion-sad',
  anxious: 'bg-emotion-anxious border-emotion-anxious',
  stressed: 'bg-emotion-stressed border-emotion-stressed',
  exhausted: 'bg-emotion-exhausted border-emotion-exhausted',
  numb: 'bg-emotion-numb border-emotion-numb',
};

export const EmotionButton = ({ emotion, label, icon, selected, onClick }: EmotionButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300',
        selected ? selectedColors[emotion] : emotionColors[emotion],
        selected && 'shadow-card'
      )}
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className={cn(
        'text-sm font-medium',
        selected ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {label}
      </span>
    </motion.button>
  );
};
