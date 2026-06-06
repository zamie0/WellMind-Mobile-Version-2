import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodSelector } from '@/components/WellMind-User/Home-Page/MoodSelector';
import { DailyAffirmation } from '@/components/WellMind-User/Home-Page/DailyAffirmation';
import { QuickActions } from '@/components/WellMind-User/Home-Page/Quick Actions/QuickActions';
import { BreathingExercise } from '@/components/WellMind-User/Mindful-Page/Guided-Exercises/BreathingExercise';
import { JournalEntry } from '@/components/WellMind-User/Home-Page/Quick Actions/JournalEntry';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { PanicButton } from '@/components/WellMind-User/Home-Page/PanicButton';
import { MoodPrediction } from '@/components/WellMind-User/Insight-Page/MoodPrediction';
import { ActivitySuggestion } from '@/components/WellMind-User/Home-Page/ActivitySuggestion';
import { RelaxGamesSheet } from '@/components/WellMind-User/Home-Page/RelaxGames';
import { AmbientSoundsSheet } from '@/components/WellMind-User/Home-Page/Quick Actions/Ambient Sounds/AmbientSoundsSheet';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Flame, Plus, Leaf, Sparkles, Zap, Heart } from 'lucide-react';
import { toast } from 'sonner';

/* ── Helpers ────────────────────────────────────────────────────── */
const SectionHeading = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-3 px-0.5">
    {icon}
    <h2 className="text-base font-bold" style={{ color: '#1a2b38', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  </div>
);

const moodEmoji: Record<string, string> = {
  happy: '😊', neutral: '😐', sad: '😢',
  anxious: '😰', stressed: '😤', exhausted: '😩', numb: '😶',
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/* ── Page ───────────────────────────────────────────────────────── */
export const Home = () => {
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showBreathing, setShowBreathing]       = useState(false);
  const [showJournal, setShowJournal]           = useState(false);
  const [showGames, setShowGames]               = useState(false);
  const [showSounds, setShowSounds]             = useState(false);

  const user          = useWellMindStore((s) => s.user);
  const currentStreak = useWellMindStore((s) => s.currentStreak);
  const moodEntries   = useWellMindStore((s) => s.moodEntries);

  const todaysMood = (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return moodEntries.find((e) => {
      const d = new Date(e.timestamp); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  })();

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-10 pb-8"
      >
        {/* Background rings */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-10 -left-16 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,115,90,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Top row — greeting + streak */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-widest block mb-1"
                style={{ color: '#39a89b' }}
              >
                {getGreeting()}
              </span>
              <h1
                className="text-[2rem] font-bold leading-tight flex items-center gap-2"
                style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
              >
                {user?.name || 'Friend'}
                <Leaf className="h-5 w-5" style={{ color: '#39a89b' }} />
              </h1>
            </div>

            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              >
                <Flame className="h-4 w-4" style={{ color: '#e8735a' }} />
                <span className="font-bold text-sm" style={{ color: '#1a2b38' }}>{currentStreak}</span>
              </motion.div>
            )}
          </div>

          {/* Mood card */}
          {!todaysMood ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }} />
              <div className="px-5 py-4">
                <p className="text-xs font-medium mb-3" style={{ color: '#8fa3b1' }}>
                  Let's check in with yourself
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowMoodSelector(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                    boxShadow: '0 2px 10px rgba(57,168,155,0.3)',
                  }}
                >
                  <Plus className="h-4 w-4" />
                  How are you feeling today?
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }} />
              <div className="px-5 py-4">
                <p className="text-xs font-medium mb-3" style={{ color: '#8fa3b1' }}>Today you felt</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{moodEmoji[todaysMood.emotion] ?? '😐'}</span>
                  <div>
                    <p className="font-bold text-sm capitalize" style={{ color: '#1a2b38' }}>
                      {todaysMood.emotion}
                    </p>
                    {todaysMood.note && (
                      <p
                        className="text-xs italic mt-1 pl-2"
                        style={{ color: '#5f7585', borderLeft: '2px solid #39a89b' }}
                      >
                        "{todaysMood.note}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="px-5 py-6 space-y-6">

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <SectionHeading icon={<Zap className="h-4 w-4" style={{ color: '#39a89b' }} />}>
            Quick Actions
          </SectionHeading>
          <QuickActions
            onJournalClick={() => setShowJournal(true)}
            onGamesClick={() => setShowGames(true)}
            onSoundsClick={() => setShowSounds(true)}
          />
        </motion.div>

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

        <div/>
      </main>

      {/* ── FAB + Nav ─────────────────────────────────────────── */}
      <PanicButton variant="fab" />
      <BottomNav />

      {/* ── Mood Selector Modal ───────────────────────────────── */}
      <AnimatePresence>
        {showMoodSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(240,247,245,0.97)', backdropFilter: 'blur(8px)' }}
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
                className="w-full text-center text-sm mt-4"
                style={{ color: '#8fa3b1' }}
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Other Modals ──────────────────────────────────────── */}
      <AnimatePresence>
        {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
        {showJournal   && <JournalEntry      onClose={() => setShowJournal(false)} />}
      </AnimatePresence>

      <RelaxGamesSheet   open={showGames}  onClose={() => setShowGames(false)} />
      <AmbientSoundsSheet open={showSounds} onClose={() => setShowSounds(false)} />
    </div>
  );
};

export default Home;