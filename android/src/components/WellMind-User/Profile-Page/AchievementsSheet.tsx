import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Trophy } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';

interface AchievementsSheetProps {
  open: boolean;
  onClose: () => void;
}

interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number; // 0-100
  color: string;
}

export const AchievementsSheet = ({ open, onClose }: AchievementsSheetProps) => {
  const currentStreak = useWellMindStore((s) => s.currentStreak);
  const moodEntries = useWellMindStore((s) => s.moodEntries);
  const journalEntries = useWellMindStore((s) => s.journalEntries);
  const totalCoinsEarned = useWellMindStore((s) => s.totalCoinsEarned);

  const pct = (v: number, target: number) => Math.min(100, Math.round((v / target) * 100));

  const achievements: Achievement[] = [
    { id: 'first', emoji: '🌱', title: 'First Step', description: 'Log your first mood', unlocked: moodEntries.length >= 1, progress: pct(moodEntries.length, 1), color: 'bg-coral-light' },
    { id: 'streak3', emoji: '🔥', title: '3 Day Streak', description: 'Check in 3 days in a row', unlocked: currentStreak >= 3, progress: pct(currentStreak, 3), color: 'bg-sage-light' },
    { id: 'streak7', emoji: '⭐', title: 'Week Warrior', description: '7-day check-in streak', unlocked: currentStreak >= 7, progress: pct(currentStreak, 7), color: 'bg-honey-light' },
    { id: 'streak30', emoji: '👑', title: 'Monthly Master', description: '30-day streak', unlocked: currentStreak >= 30, progress: pct(currentStreak, 30), color: 'bg-lavender-light' },
    { id: 'dedicated', emoji: '💪', title: 'Dedicated', description: 'Log 10 moods', unlocked: moodEntries.length >= 10, progress: pct(moodEntries.length, 10), color: 'bg-sky-light' },
    { id: 'reflective', emoji: '📓', title: 'Reflective Mind', description: 'Write 5 journal entries', unlocked: journalEntries.length >= 5, progress: pct(journalEntries.length, 5), color: 'bg-lavender-light' },
    { id: 'writer', emoji: '✍️', title: 'Wordsmith', description: 'Write 20 journal entries', unlocked: journalEntries.length >= 20, progress: pct(journalEntries.length, 20), color: 'bg-sage-light' },
    { id: 'mood50', emoji: '🌈', title: 'Mood Explorer', description: 'Log 50 moods', unlocked: moodEntries.length >= 50, progress: pct(moodEntries.length, 50), color: 'bg-coral-light' },
    { id: 'coins100', emoji: '🪙', title: 'Coin Collector', description: 'Earn 100 Calm Coins', unlocked: totalCoinsEarned >= 100, progress: pct(totalCoinsEarned, 100), color: 'bg-honey-light' },
    { id: 'coins500', emoji: '💰', title: 'Calm Treasury', description: 'Earn 500 Calm Coins', unlocked: totalCoinsEarned >= 500, progress: pct(totalCoinsEarned, 500), color: 'bg-honey-light' },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col"
          >
            <div className="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-honey-light flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-honey" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Achievements</h2>
                  <p className="text-xs text-muted-foreground">{unlockedCount} / {achievements.length} unlocked</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4 ${!a.unlocked ? 'opacity-70' : ''}`}
                >
                  <div className={`w-14 h-14 rounded-full ${a.color} flex items-center justify-center text-2xl shrink-0`}>
                    {a.unlocked ? a.emoji : <Lock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${a.unlocked ? 'bg-sage' : 'bg-primary/40'}`}
                        style={{ width: `${a.progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementsSheet;
