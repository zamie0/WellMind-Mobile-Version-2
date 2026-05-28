import { useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionButton } from './EmotionButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Emotion } from '@/types/wellmind';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

const emotions: { emotion: Emotion; label: string; icon: string }[] = [
  { emotion: 'happy', label: 'Happy', icon: '😊' },
  { emotion: 'neutral', label: 'Okay', icon: '😐' },
  { emotion: 'sad', label: 'Sad', icon: '😢' },
  { emotion: 'anxious', label: 'Anxious', icon: '😰' },
  { emotion: 'stressed', label: 'Stressed', icon: '😤' },
  { emotion: 'exhausted', label: 'Exhausted', icon: '😩' },
  { emotion: 'numb', label: 'Numb', icon: '😶' },
];

interface MoodSelectorProps {
  onComplete?: () => void;
}

export const MoodSelector = ({ onComplete }: MoodSelectorProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const addMoodEntry = useWellMindStore((state) => state.addMoodEntry);

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setShowNote(true);
  };

  const handleSave = () => {
    if (!selectedEmotion) return;
    
    addMoodEntry(selectedEmotion, note || undefined);
    toast.success('Mood logged! Keep it up 💚');
    onComplete?.();
  };

  const handleSkipNote = () => {
    if (!selectedEmotion) return;
    addMoodEntry(selectedEmotion);
    toast.success('Mood logged! Keep it up 💚');
    onComplete?.();
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          How are you feeling?
        </h2>
        <p className="text-muted-foreground">
          Take a moment to check in with yourself
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8"
      >
        {emotions.map((item, index) => (
          <motion.div
            key={item.emotion}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <EmotionButton
              {...item}
              selected={selectedEmotion === item.emotion}
              onClick={() => handleEmotionSelect(item.emotion)}
            />
          </motion.div>
        ))}
      </motion.div>

      {showNote && selectedEmotion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Want to add a note? (optional)
            </label>
            <Textarea
              placeholder="What's on your mind..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px] rounded-xl border-border bg-card resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSkipNote}
            >
              Skip
            </Button>
            <Button
              variant="sage"
              className="flex-1"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
