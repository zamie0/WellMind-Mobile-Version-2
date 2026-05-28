import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Button } from '@/components/ui/button';
import type { Emotion } from '@/types/wellmind';

const moodEmojis: Record<Emotion, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  stressed: '😫',
  exhausted: '😩',
  numb: '😶',
};

const moodColors: Record<Emotion, string> = {
  happy: 'from-honey/20 to-honey/5',
  neutral: 'from-sky/20 to-sky/5',
  sad: 'from-lavender/20 to-lavender/5',
  anxious: 'from-coral/20 to-coral/5',
  stressed: 'from-destructive/20 to-destructive/5',
  exhausted: 'from-muted/30 to-muted/10',
  numb: 'from-muted/20 to-muted/5',
};

export const MoodPrediction = () => {
  const { moodPrediction, moodEntries, generateMoodPrediction } = useWellMindStore();

  useEffect(() => {
    if (moodEntries.length >= 3 && !moodPrediction) {
      generateMoodPrediction();
    }
  }, [moodEntries.length, moodPrediction, generateMoodPrediction]);

  if (moodEntries.length < 3) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-card"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mood Prediction</h3>
            <p className="text-xs text-muted-foreground">AI-powered insights</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Log at least 3 mood entries to unlock AI mood predictions.
        </p>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                moodEntries.length >= i ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!moodPrediction) {
    return null;
  }

  const predictionDate = new Date(moodPrediction.predictedFor);
  const isToday = predictionDate.toDateString() === new Date().toDateString();
  const dayLabel = isToday ? 'Today' : 'Tomorrow';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${moodColors[moodPrediction.predictedMood]} rounded-2xl p-5 shadow-card border border-border/50`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-card/80 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mood Prediction</h3>
            <p className="text-xs text-muted-foreground">For {dayLabel}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={generateMoodPrediction}
          className="h-8 w-8"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-5xl"
        >
          {moodEmojis[moodPrediction.predictedMood]}
        </motion.div>
        <div>
          <p className="font-medium text-foreground capitalize">
            {moodPrediction.predictedMood}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>{moodPrediction.confidence}% confidence</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-card/60 rounded-lg p-3">
          <p className="text-sm text-foreground">{moodPrediction.reason}</p>
        </div>
        
        <div className="flex items-start gap-2 bg-primary/10 rounded-lg p-3">
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{moodPrediction.suggestion}</p>
        </div>
      </div>
    </motion.div>
  );
};
