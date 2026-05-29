import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MoodSelector } from '@/components/WellMind-User/Home-Page/MoodSelector';
import { DailyAffirmation } from '@/components/WellMind-User/Home-Page/DailyAffirmation';
import { MoodChart } from '@/components/WellMind-User/Home-Page/MoodChart';
import { QuickActions } from '@/components/WellMind-User/Home-Page/QuickActions';
import { BreathingExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/BreathingExercise';
import { JournalEntry } from '@/components/WellMind-User/Profile-Page/JournalEntry';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { PanicButton } from '@/components/WellMind-User/Home-Page/PanicButton';
import { MoodPrediction } from '@/components/WellMind-User/Insight-Page/MoodPrediction';
import { ActivitySuggestion } from '@/components/WellMind-User/Home-Page/ActivitySuggestion';
import { HealingGoals } from '@/components/WellMind-User/Home-Page/Goals/HealingGoals';
import { YourGoals } from '@/components/WellMind-User/Home-Page/Goals/YourGoals';
import { InAppSection } from '@/components/WellMind-User/Home-Page/InApp/InAppSection';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Flame, Plus } from 'lucide-react';
import { toast } from 'sonner';


export const Home = () => {
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  
  const user = useWellMindStore((state) => state.user);
  const currentStreak = useWellMindStore((state) => state.currentStreak);
  const moodEntries = useWellMindStore((state) => state.moodEntries);
  
  // Compute today's mood from entries
  const todaysMood = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return moodEntries.find((entry) => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
  })();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleJournalClick = () => {
    setShowJournal(true);
  };

  const handleChatClick = () => {
    toast.info('MindBuddy is coming soon!', {
      description: 'Your AI companion will be ready shortly.',
    });
  };

  const handleAffirmationClick = () => {
    toast.success('You are valued and worthy! 💚', {
      description: 'Remember to be kind to yourself today.',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-calm pt-safe-top">
        <div className="px-5 pt-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <p className="text-muted-foreground text-sm">{getGreeting()}</p>
              <h1 className="text-2xl font-bold text-foreground">
                {user?.name || 'Friend'} 🌿
              </h1>
            </div>
            
            {/* Streak badge */}
            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-coral-light px-4 py-2 rounded-full"
              >
                <Flame className="h-5 w-5 text-coral" />
                <span className="font-semibold text-coral">{currentStreak}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Today's mood or check-in prompt */}
          {!todaysMood ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => setShowMoodSelector(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                How are you feeling today?
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <p className="text-sm text-muted-foreground mb-1">Today you felt</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {todaysMood.emotion === 'happy' && '😊'}
                  {todaysMood.emotion === 'neutral' && '😐'}
                  {todaysMood.emotion === 'sad' && '😢'}
                  {todaysMood.emotion === 'anxious' && '😰'}
                  {todaysMood.emotion === 'stressed' && '😤'}
                  {todaysMood.emotion === 'exhausted' && '😩'}
                  {todaysMood.emotion === 'numb' && '😶'}
                </span>
                <span className="font-medium text-foreground capitalize">
                  {todaysMood.emotion}
                </span>
              </div>
              {todaysMood.note && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{todaysMood.note}"
                </p>
              )}
            </motion.div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="px-5 py-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <QuickActions
            onBreathingClick={() => setShowBreathing(true)}
            onJournalClick={handleJournalClick}
            onChatClick={handleChatClick}
            onAffirmationClick={handleAffirmationClick}
          />
        </section>

        {/* Daily Affirmation */}
        <section>
          <DailyAffirmation />
        </section>

        {/* Activity Suggestion */}
        <section>
          <ActivitySuggestion />
        </section>

        {/* Mood Prediction */}
        <section>
          <MoodPrediction />
        </section>

        {/* Mood Chart */}
        <section>
          <MoodChart />
        </section>

        <HealingGoals />

        <YourGoals />

        <InAppSection />
      </main>

      {/* Panic Button FAB */}
      <PanicButton variant="fab" />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Mood Selector Modal */}
      <AnimatePresence>
        {showMoodSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <MoodSelector onComplete={() => setShowMoodSelector(false)} />
              <button
                onClick={() => setShowMoodSelector(false)}
                className="w-full text-center text-muted-foreground text-sm mt-4 hover:text-foreground"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing Exercise Modal */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingExercise onClose={() => setShowBreathing(false)} />
        )}
      </AnimatePresence>

      {/* Journal Modal */}
      <AnimatePresence>
        {showJournal && (
          <JournalEntry onClose={() => setShowJournal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
