import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { BadgeId } from '@/types/wellmind';

interface BadgeInfo {
  name: string;
  description: string;
  icon: string;
}

const badgeData: Record<BadgeId, BadgeInfo> = {
  first_checkin: { name: 'First Step', description: 'Complete your first mood check-in', icon: '🌱' },
  streak_3: { name: 'Getting Started', description: 'Maintain a 3-day streak', icon: '🔥' },
  streak_7: { name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⭐' },
  streak_30: { name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆' },
  breathing_master: { name: 'Breath Master', description: 'Complete 10 breathing exercises', icon: '🌬️' },
  journal_starter: { name: 'Journal Starter', description: 'Write your first journal entry', icon: '📝' },
  journal_master: { name: 'Journal Master', description: 'Write 10 journal entries', icon: '📖' },
  mood_tracker: { name: 'Mood Tracker', description: 'Log 10 mood entries', icon: '📊' },
  calm_explorer: { name: 'Calm Explorer', description: 'Try all mindfulness exercises', icon: '🧘' },
  pet_lover: { name: 'Pet Lover', description: 'Get your pet to maximum happiness', icon: '💕' },
  coin_collector: { name: 'Coin Collector', description: 'Earn 100 Calm Coins', icon: '💰' },
  pet_level_5: { name: 'Pet Trainer', description: 'Get your pet to level 5', icon: '🎓' },
  pet_level_10: { name: 'Pet Master', description: 'Get your pet to level 10', icon: '👑' },
};

interface BadgeCardProps {
  badgeId: BadgeId;
  unlocked: boolean;
  index?: number;
}

export const BadgeCard = ({ badgeId, unlocked, index = 0 }: BadgeCardProps) => {
  const badge = badgeData[badgeId];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative p-4 rounded-xl border transition-all ${
        unlocked
          ? 'bg-card border-primary/30 shadow-card'
          : 'bg-muted/50 border-border opacity-60'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`text-3xl mb-2 ${
            unlocked ? '' : 'grayscale opacity-50'
          }`}
        >
          {unlocked ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
        </div>
        <h4 className="font-medium text-sm text-foreground">{badge.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
      </div>
      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
        >
          <span className="text-xs">✓</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export const getAllBadgeIds = (): BadgeId[] => Object.keys(badgeData) as BadgeId[];
