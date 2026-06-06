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
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { BadgeId } from "@/types/wellmind";

/* ---------------- Types ---------------- */

interface BadgeInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

/* ---------------- Badge Data ---------------- */

const badgeData: Record<BadgeId, BadgeInfo> = {
  first_checkin: {
    name: "First Step",
    description: "Complete your first mood check-in",
    icon: Sprout,
    color: "text-green-400",
  },
  streak_3: {
    name: "Getting Started",
    description: "Maintain a 3-day streak",
    icon: Flame,
    color: "text-orange-400",
  },
  streak_7: {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: Star,
    color: "text-yellow-400",
  },
  streak_30: {
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: Trophy,
    color: "text-amber-400",
  },
  breathing_master: {
    name: "Breath Master",
    description: "Complete 10 breathing exercises",
    icon: Wind,
    color: "text-cyan-400",
  },
  journal_starter: {
    name: "Journal Starter",
    description: "Write your first journal entry",
    icon: NotebookPen,
    color: "text-blue-400",
  },
  journal_master: {
    name: "Journal Master",
    description: "Write 10 journal entries",
    icon: BookOpen,
    color: "text-indigo-400",
  },
  mood_tracker: {
    name: "Mood Tracker",
    description: "Log 10 mood entries",
    icon: BarChart3,
    color: "text-purple-400",
  },
  calm_explorer: {
    name: "Calm Explorer",
    description: "Try all mindfulness exercises",
    icon: Flower2,
    color: "text-pink-400",
  },
  pet_lover: {
    name: "Pet Lover",
    description: "Get your pet to maximum happiness",
    icon: Heart,
    color: "text-rose-400",
  },
  coin_collector: {
    name: "Coin Collector",
    description: "Earn 100 Calm Coins",
    icon: Coins,
    color: "text-yellow-500",
  },
  pet_level_5: {
    name: "Pet Trainer",
    description: "Get your pet to level 5",
    icon: GraduationCap,
    color: "text-sky-400",
  },
  pet_level_10: {
    name: "Pet Master",
    description: "Get your pet to level 10",
    icon: Crown,
    color: "text-violet-400",
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

/* ---------------- Helper ---------------- */

export const getAllBadgeIds = (): BadgeId[] =>
  Object.keys(badgeData) as BadgeId[];