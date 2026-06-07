import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionButton } from '../EmotionButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import type { Emotion } from '@/types/wellmind';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

const emotions: { emotion: Emotion; label: string; icon: string }[] = [
  { emotion: 'happy',     label: 'Happy',     icon: '😊' },
  { emotion: 'neutral',   label: 'Okay',      icon: '😐' },
  { emotion: 'sad',       label: 'Sad',       icon: '😢' },
  { emotion: 'anxious',   label: 'Anxious',   icon: '😰' },
  { emotion: 'stressed',  label: 'Stressed',  icon: '😤' },
  { emotion: 'exhausted', label: 'Exhausted', icon: '😩' },
  { emotion: 'numb',      label: 'Numb',      icon: '😶' },
];

const emotionPillColors: Record<Emotion, string> = {
  happy:     'bg-honey-light text-honey',
  neutral:   'bg-muted text-muted-foreground',
  sad:       'bg-sky-light text-sky',
  anxious:   'bg-lavender-light text-lavender',
  stressed:  'bg-coral-light text-coral',
  exhausted: 'bg-lavender-light text-lavender',
  numb:      'bg-muted text-muted-foreground',
};

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

  const selected = emotions.find((e) => e.emotion === selectedEmotion);

  return (
    <div className="w-full space-y-6">

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-1">
          How are you feeling?
        </h2>
        <p className="text-sm text-muted-foreground">
          Take a moment to check in with yourself
        </p>
      </motion.div>

      {/* Selected emotion pill */}
      <AnimatePresence>
        {selectedEmotion && selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-soft ${emotionPillColors[selectedEmotion]}`}>
              <span className="text-lg">{selected.icon}</span>
              Feeling {selected.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotion grid — aspect-square ensures equal sizing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3"
      >
        {emotions.map((item, index) => (
          <motion.div
            key={item.emotion}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + index * 0.04 }}
            className="aspect-square"
          >
            <EmotionButton
              {...item}
              selected={selectedEmotion === item.emotion}
              onClick={() => handleEmotionSelect(item.emotion)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Note section */}
      <AnimatePresence>
        {showNote && selectedEmotion && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-card rounded-2xl p-4 shadow-soft space-y-3"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sage-light flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-sage" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Want to add a note?
                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
              </p>
            </div>

            {/* Textarea */}
            <Textarea
              placeholder="What's on your mind..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[90px] resize-none border-none shadow-none bg-muted/50 rounded-xl pl-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
            />

            {/* Char count */}
            {note.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">{note.length} characters</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={handleSkipNote}
              >
                Skip
              </Button>
              <Button
                variant="sage"
                className="flex-1 rounded-xl"
                onClick={handleSave}
              >
                Save Mood 💚
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};