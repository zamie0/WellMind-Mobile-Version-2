import { useState } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Trophy,
  TrendingUp,
  Coins,
  Target,
  Award,
  Wind,
  Gamepad2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useWellMindStore } from "@/stores/wellmindStore";
import { BottomNav } from "@/components/WellMind-User/BottomNav";
import { VirtualPet } from "@/components/WellMind-User/MindBuddy-Page/MindBuddy/VirtualPet";
import {
  BadgeCard,
  getAllBadgeIds,
  getRecentBadges,
} from "@/components/WellMind-User/MindBuddy-Page/BadgeCard";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ---------------- Earn Rules ---------------- */

const coinRules = [
  {
    icon: Target,
    text: "Daily check-in: +10 coins",
    color: "text-yellow-400",
  },
  {
    icon: Gift,
    text: "Daily bonus: +15 coins",
    color: "text-pink-400",
  },
  {
    icon: Award,
    text: "Unlock badge: +25 coins",
    color: "text-amber-400",
  },
  {
    icon: Wind,
    text: "Complete exercise: +5 coins",
    color: "text-cyan-400",
  },
  {
    icon: Gamepad2,
    text: "Play games: up to +15 coins",
    color: "text-purple-400",
  },
];

/* ---------------- Page ---------------- */

const MindBuddy = () => {
  const navigate = useNavigate();
  const {
    calmCoins,
    badges,
    claimDailyBonus,
    canClaimDailyBonus,
    currentStreak,
  } = useWellMindStore();

  const allBadges = getAllBadgeIds();
  const unlockedCount = badges.length;
  const recentBadges = getRecentBadges(badges, 4);

  /* ---------------- Easter Egg State ---------------- */
  const [achievementsClicks, setAchievementsClicks] = useState(0);

  const handleAchievementsClick = () => {
    const next = achievementsClicks + 1;
    setAchievementsClicks(next);

    if (next === 5) {
      useWellMindStore.setState((state) => ({
        calmCoins: state.calmCoins + 200,
        totalCoinsEarned: state.totalCoinsEarned + 200,
      }));

      setAchievementsClicks(0);

      toast.success("+200 Coins Secret Bonus!", {
        description: "Easter egg unlocked 🎉",
      });
    }
  };

  const handleClaimBonus = () => {
    const bonus = claimDailyBonus();

    if (bonus > 0) {
      toast.success(`+${bonus} Calm Coins earned!`, {
        description: "Daily bonus claimed successfully",
      });
    }
  };

  const handleViewAllAchievements = () => {
    navigate("/achievements", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-foreground">MindBuddy</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Earn coins, unlock badges, care for your pet
        </p>
      </motion.header>

      <div className="px-5 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-honey/10 rounded-xl p-4 text-center">
            <Coins className="w-5 h-5 text-honey mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{calmCoins}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </div>

          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">
              {unlockedCount}/{allBadges.length}
            </p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>

          <div className="bg-coral/10 rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-coral mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">
              {currentStreak}
            </p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </motion.div>

        {/* Daily Bonus */}
        {canClaimDailyBonus() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Button
              onClick={handleClaimBonus}
              className="w-full bg-gradient-to-r from-honey to-coral text-foreground py-6 rounded-xl shadow-card"
            >
              <Gift className="w-5 h-5 mr-2" />
              Claim Daily Bonus (+25 Coins)
            </Button>
          </motion.div>
        )}

        {/* Virtual Pet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Your Calm Companion
          </h2>
          <VirtualPet />
        </motion.div>

        {/* Achievements (CLICK 5X EASTER EGG) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              onClick={handleAchievementsClick}
              className="text-lg font-semibold text-foreground cursor-pointer select-none"
            >
              Achievements
            </h2>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {unlockedCount}/{allBadges.length}
            </span>
          </div>

          {/* Recent Achievements Preview */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {recentBadges.map((badgeId, index) => (
                <BadgeCard
                  key={badgeId}
                  badgeId={badgeId}
                  unlocked={badges.includes(badgeId)}
                  index={index}
                />
              ))}
            </div>

            {/* More Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAllAchievements}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card border border-border hover:bg-card/80 transition-colors"
            >
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">
                View All Achievements
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </motion.button>
          </div>
        </motion.div>

        {/* How to Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl p-4 shadow-soft"
        >
          <h3 className="font-medium text-foreground mb-3">
            How to Earn Calm Coins
          </h3>

          <ul className="space-y-2 text-sm text-muted-foreground">
            {coinRules.map((rule, i) => {
              const Icon = rule.icon;

              return (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${rule.color}`} />
                  </span>
                  {rule.text}
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MindBuddy;