import { motion } from "framer-motion";
import {
  Lock,
  Sprout,
  Flame,
  Star,
  Trophy,
  Wind,
  NotebookPen,
  BookOpen,
  BarChart3,
  Flower2,
  Heart,
  Coins,
  GraduationCap,
  Crown,
  Zap,
  Target,
  Users,
  BookMarked,
  Headphones,
  Music,
  CheckCircle2,
  TrendingUp,
  Award,
  Sunrise,
  Moon,
  Calendar,
  Lightbulb,
  Smile,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { BadgeId } from "@/types/wellmind";

/* ---------------- Types ---------------- */

export type AchievementCategory = 'progress' | 'skills' | 'activities' | 'milestones' | 'special';

interface BadgeInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: AchievementCategory;
  unlockedAt?: Date;
}

/* ---------------- Badge Data ---------------- */

const badgeData: Record<BadgeId, BadgeInfo> = {
  // ===== PROGRESS (10) =====
  first_checkin: {
    name: "First Step",
    description: "Complete your first mood check-in",
    icon: Sprout,
    color: "text-green-400",
    category: "progress",
  },
  streak_3: {
    name: "Getting Started",
    description: "Maintain a 3-day streak",
    icon: Flame,
    color: "text-orange-400",
    category: "progress",
  },
  streak_7: {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: Star,
    color: "text-yellow-400",
    category: "progress",
  },
  streak_14: {
    name: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    icon: Zap,
    color: "text-orange-500",
    category: "progress",
  },
  streak_30: {
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: Trophy,
    color: "text-amber-400",
    category: "progress",
  },
  streak_60: {
    name: "Two Months Strong",
    description: "Maintain a 60-day streak",
    icon: Flame,
    color: "text-red-400",
    category: "progress",
  },
  streak_100: {
    name: "Century Champion",
    description: "Maintain a 100-day streak",
    icon: Crown,
    color: "text-yellow-300",
    category: "progress",
  },
  first_journal: {
    name: "Pen to Paper",
    description: "Write your first journal entry",
    icon: NotebookPen,
    color: "text-blue-400",
    category: "progress",
  },
  first_breathing: {
    name: "First Breath",
    description: "Complete your first breathing exercise",
    icon: Wind,
    color: "text-cyan-400",
    category: "progress",
  },
  first_meditation: {
    name: "Meditative Mind",
    description: "Complete your first meditation",
    icon: Flower2,
    color: "text-pink-400",
    category: "progress",
  },
  
  // ===== SKILLS (10) =====
  breathing_master: {
    name: "Breath Master",
    description: "Complete 10 breathing exercises",
    icon: Wind,
    color: "text-cyan-400",
    category: "skills",
  },
  breathing_expert: {
    name: "Breathing Expert",
    description: "Complete 25 breathing exercises",
    icon: Zap,
    color: "text-cyan-500",
    category: "skills",
  },
  journal_starter: {
    name: "Journal Starter",
    description: "Write 3 journal entries",
    icon: NotebookPen,
    color: "text-blue-400",
    category: "skills",
  },
  journal_master: {
    name: "Journal Master",
    description: "Write 10 journal entries",
    icon: BookOpen,
    color: "text-indigo-400",
    category: "skills",
  },
  journal_pro: {
    name: "Journal Pro",
    description: "Write 25 journal entries",
    icon: BookMarked,
    color: "text-indigo-500",
    category: "skills",
  },
  meditation_beginner: {
    name: "Meditation Beginner",
    description: "Complete 5 meditation sessions",
    icon: Flower2,
    color: "text-pink-400",
    category: "skills",
  },
  meditation_master: {
    name: "Meditation Master",
    description: "Complete 25 meditation sessions",
    icon: Smile,
    color: "text-pink-500",
    category: "skills",
  },
  mood_tracker: {
    name: "Mood Tracker",
    description: "Log 10 mood entries",
    icon: BarChart3,
    color: "text-purple-400",
    category: "skills",
  },
  mood_analyst: {
    name: "Mood Analyst",
    description: "Log 50 mood entries",
    icon: TrendingUp,
    color: "text-purple-500",
    category: "skills",
  },
  gratitude_practice: {
    name: "Gratitude Guru",
    description: "Write 10 gratitude entries",
    icon: Heart,
    color: "text-rose-400",
    category: "skills",
  },

  // ===== ACTIVITIES (10) =====
  calm_explorer: {
    name: "Calm Explorer",
    description: "Try all mindfulness exercises",
    icon: Flower2,
    color: "text-pink-400",
    category: "activities",
  },
  mindfulness_journey: {
    name: "Mindfulness Journey",
    description: "Complete 15 mindfulness exercises",
    icon: Lightbulb,
    color: "text-yellow-400",
    category: "activities",
  },
  exercise_enthusiast: {
    name: "Exercise Enthusiast",
    description: "Complete 10 exercises",
    icon: Target,
    color: "text-green-400",
    category: "activities",
  },
  exercise_warrior: {
    name: "Exercise Warrior",
    description: "Complete 25 exercises",
    icon: Zap,
    color: "text-green-500",
    category: "activities",
  },
  social_butterfly: {
    name: "Social Butterfly",
    description: "Connect with 5 community members",
    icon: Users,
    color: "text-blue-400",
    category: "activities",
  },
  reading_lover: {
    name: "Reading Lover",
    description: "Read 5 wellness articles",
    icon: BookOpen,
    color: "text-orange-400",
    category: "activities",
  },
  podcast_listener: {
    name: "Podcast Listener",
    description: "Listen to 10 wellness podcasts",
    icon: Headphones,
    color: "text-purple-400",
    category: "activities",
  },
  music_therapist: {
    name: "Music Therapist",
    description: "Complete 20 music therapy sessions",
    icon: Music,
    color: "text-fuchsia-400",
    category: "activities",
  },
  wellness_routine: {
    name: "Wellness Routine",
    description: "Complete 7 days of wellness activities",
    icon: Calendar,
    color: "text-teal-400",
    category: "activities",
  },
  perfect_week: {
    name: "Perfect Week",
    description: "Complete all tasks for 7 consecutive days",
    icon: CheckCircle2,
    color: "text-lime-400",
    category: "activities",
  },

  // ===== MILESTONES (10) =====
  coin_collector: {
    name: "Coin Collector",
    description: "Earn 100 Calm Coins",
    icon: Coins,
    color: "text-yellow-400",
    category: "milestones",
  },
  coin_wealthy: {
    name: "Coin Wealthy",
    description: "Earn 500 Calm Coins",
    icon: Coins,
    color: "text-yellow-500",
    category: "milestones",
  },
  coin_rich: {
    name: "Coin Rich",
    description: "Earn 1000 Calm Coins",
    icon: Coins,
    color: "text-yellow-600",
    category: "milestones",
  },
  coin_elite: {
    name: "Coin Elite",
    description: "Earn 2500 Calm Coins",
    icon: Trophy,
    color: "text-amber-500",
    category: "milestones",
  },
  monthly_champion: {
    name: "Monthly Champion",
    description: "Achieve milestone after 1 month",
    icon: Award,
    color: "text-blue-400",
    category: "milestones",
  },
  quarterly_champion: {
    name: "Quarterly Champion",
    description: "Achieve milestone after 3 months",
    icon: Award,
    color: "text-blue-500",
    category: "milestones",
  },
  yearly_champion: {
    name: "Yearly Champion",
    description: "Achieve milestone after 1 year",
    icon: Trophy,
    color: "text-amber-400",
    category: "milestones",
  },
  consistency_king: {
    name: "Consistency King",
    description: "Never miss a daily check-in for 30 days",
    icon: Star,
    color: "text-yellow-400",
    category: "milestones",
  },
  comeback_champion: {
    name: "Comeback Champion",
    description: "Return to your routine after a break",
    icon: Zap,
    color: "text-orange-400",
    category: "milestones",
  },
  milestone_master: {
    name: "Milestone Master",
    description: "Reach 10 milestones",
    icon: Crown,
    color: "text-violet-400",
    category: "milestones",
  },

  // ===== SPECIAL (10) =====
  pet_lover: {
    name: "Pet Lover",
    description: "Get your pet to maximum happiness",
    icon: Heart,
    color: "text-rose-400",
    category: "special",
  },
  pet_trainer: {
    name: "Pet Trainer",
    description: "Get your pet to level 5",
    icon: GraduationCap,
    color: "text-sky-400",
    category: "special",
  },
  pet_master: {
    name: "Pet Master",
    description: "Get your pet to level 10",
    icon: Crown,
    color: "text-violet-400",
    category: "special",
  },
  pet_level_25: {
    name: "Pet Legend",
    description: "Get your pet to level 25",
    icon: Flame,
    color: "text-red-400",
    category: "special",
  },
  perfect_pet: {
    name: "Perfect Pet",
    description: "Max out all pet stats",
    icon: Heart,
    color: "text-red-500",
    category: "special",
  },
  early_bird: {
    name: "Early Bird",
    description: "Complete 7 morning check-ins",
    icon: Sunrise,
    color: "text-orange-300",
    category: "special",
  },
  night_owl: {
    name: "Night Owl",
    description: "Complete 7 evening check-ins",
    icon: Moon,
    color: "text-indigo-400",
    category: "special",
  },
  weekend_warrior: {
    name: "Weekend Warrior",
    description: "Check-in every weekend for 4 weeks",
    icon: Zap,
    color: "text-lime-400",
    category: "special",
  },
  community_helper: {
    name: "Community Helper",
    description: "Help 5 community members",
    icon: Users,
    color: "text-cyan-400",
    category: "special",
  },
  wellness_ambassador: {
    name: "Wellness Ambassador",
    description: "Unlock achievements in all categories",
    icon: Smile,
    color: "text-green-400",
    category: "special",
  },
};

/* ---------------- Props ---------------- */

interface BadgeCardProps {
  badgeId: BadgeId;
  unlocked: boolean;
  index?: number;
}

/* ---------------- Component ---------------- */

export const BadgeCard = ({
  badgeId,
  unlocked,
  index = 0,
}: BadgeCardProps) => {
  const badge = badgeData[badgeId];
  const Icon = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative p-4 rounded-xl border transition-all ${
        unlocked
          ? "bg-card border-primary/30 shadow-card"
          : "bg-muted/50 border-border opacity-60"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`mb-2 ${unlocked ? "" : "opacity-50"}`}>
          {unlocked ? (
            <Icon
              className={`w-8 h-8 ${badge.color} drop-shadow-[0_0_6px_currentColor]`}
            />
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <h4 className="font-medium text-sm text-foreground">
          {badge.name}
        </h4>

        <p className="text-xs text-muted-foreground mt-1">
          {badge.description}
        </p>
      </div>

      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
        >
          <span className="text-xs text-white">✓</span>
        </motion.div>
      )}
    </motion.div>
  );
};

/* ---------------- Helpers ---------------- */

export const getAllBadgeIds = (): BadgeId[] =>
  Object.keys(badgeData) as BadgeId[];

export const getBadgeInfo = (badgeId: BadgeId): BadgeInfo => badgeData[badgeId];

export const getBadgesInCategory = (category: AchievementCategory): BadgeId[] =>
  Object.entries(badgeData)
    .filter(([_, info]) => info.category === category)
    .map(([id]) => id as BadgeId);

export const getCategoryLabel = (category: AchievementCategory): string => {
  const labels: Record<AchievementCategory, string> = {
    progress: "Progress",
    skills: "Skills",
    activities: "Activities",
    milestones: "Milestones",
    special: "Special",
  };
  return labels[category];
};

export const getAllCategories = (): AchievementCategory[] => [
  "progress",
  "skills",
  "activities",
  "milestones",
  "special",
];

export const getRecentBadges = (unlockedBadges: BadgeId[], count: number = 4): BadgeId[] =>
  unlockedBadges.slice(-count).reverse();

export { badgeData };