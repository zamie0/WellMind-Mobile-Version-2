import { motion } from 'framer-motion';
import { useWellMindStore } from '@/stores/wellmindStore';
import type { Emotion } from '@/types/wellmind';

const emotionValues: Record<Emotion, number> = {
  happy: 5,
  neutral: 4,
  sad: 2,
  anxious: 2,
  stressed: 2,
  exhausted: 1,
  numb: 3,
};

const emotionIcons: Record<Emotion, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  stressed: '😤',
  exhausted: '😩',
  numb: '😶',
};

export const MoodChart = () => {
  const allMoodEntries = useWellMindStore((state) => state.moodEntries);
  
  // Filter to last 7 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const moodEntries = allMoodEntries.filter(
    (entry) => new Date(entry.timestamp) >= cutoff
  );
  
  // Group by day
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const dataPoints = last7Days.map((date) => {
    const dayEntry = moodEntries.find((entry) => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    });
    
    return {
      date,
      entry: dayEntry,
      value: dayEntry ? emotionValues[dayEntry.emotion] : null,
    };
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-soft"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">This Week's Mood</h3>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {dataPoints.map((point, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex-1 flex items-end w-full justify-center mb-2">
              {point.value !== null ? (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(point.value / 5) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-8 rounded-t-lg gradient-hero min-h-[8px]"
                />
              ) : (
                <div className="w-8 h-2 rounded bg-muted" />
              )}
            </div>
            
            {/* Emoji indicator */}
            <div className="h-8 flex items-center justify-center">
              {point.entry && (
                <span className="text-lg">{emotionIcons[point.entry.emotion]}</span>
              )}
            </div>
            
            {/* Day label */}
            <span className="text-xs text-muted-foreground mt-1">
              {dayLabels[point.date.getDay()]}
            </span>
          </div>
        ))}
      </div>

      {moodEntries.length === 0 && (
        <p className="text-center text-muted-foreground text-sm mt-4">
          Start tracking to see your mood patterns
        </p>
      )}
    </motion.div>
  );
};
