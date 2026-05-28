import { motion } from 'framer-motion';
import { useWellMindStore } from '@/stores/wellmindStore';
import { BottomNav } from '@/components/wellmind/BottomNav';
import { MoodChart } from '@/components/wellmind/MoodChart';
import { TrendingUp, Calendar, Target, Brain } from 'lucide-react';
import type { Emotion } from '@/types/wellmind';

const emotionLabels: Record<Emotion, string> = {
  happy: 'Happy',
  neutral: 'Okay',
  sad: 'Sad',
  anxious: 'Anxious',
  stressed: 'Stressed',
  exhausted: 'Exhausted',
  numb: 'Numb',
};

export const Insights = () => {
  const moodEntries = useWellMindStore((state) => state.moodEntries);
  const currentStreak = useWellMindStore((state) => state.currentStreak);

  // Calculate stats
  const totalEntries = moodEntries.length;
  
  const moodCounts = moodEntries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequent = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const positiveCount = moodEntries.filter(e => 
    e.emotion === 'happy' || e.emotion === 'neutral'
  ).length;
  
  const positivePercentage = totalEntries > 0 
    ? Math.round((positiveCount / totalEntries) * 100) 
    : 0;

  const stats = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Total Check-ins',
      value: totalEntries,
      color: 'bg-sky-light text-sky',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'Current Streak',
      value: `${currentStreak} days`,
      color: 'bg-coral-light text-coral',
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: 'Positive Days',
      value: `${positivePercentage}%`,
      color: 'bg-sage-light text-sage',
    },
    {
      icon: <Brain className="h-5 w-5" />,
      label: 'Most Frequent',
      value: mostFrequent ? emotionLabels[mostFrequent[0] as Emotion] : '—',
      color: 'bg-lavender-light text-lavender',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-safe-top">
        <div className="pt-6 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Your Insights
          </motion.h1>
          <p className="text-muted-foreground">Track your emotional patterns</p>
        </div>
      </header>

      <main className="px-5 py-4 space-y-6">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mood Chart */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Overview</h2>
          <MoodChart />
        </section>

        {/* Mood Distribution */}
        {totalEntries > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Mood Distribution</h2>
            <div className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
              {Object.entries(moodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => {
                  const percentage = Math.round((count / totalEntries) * 100);
                  return (
                    <div key={emotion}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground capitalize">{emotionLabels[emotion as Emotion]}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="h-full gradient-hero rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.section>
        )}

        {/* Empty state */}
        {totalEntries === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No data yet</h3>
            <p className="text-muted-foreground">
              Start tracking your mood to see insights here
            </p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Insights;
