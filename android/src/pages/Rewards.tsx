import { motion } from 'framer-motion';
import { Sparkles, Gift, Trophy, TrendingUp } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { BottomNav } from '@/components/wellmind/BottomNav';
import { VirtualPet } from '@/components/wellmind/VirtualPet';
import { BadgeCard, getAllBadgeIds } from '@/components/wellmind/BadgeCard';
import { RelaxGames } from '@/components/wellmind/RelaxGames';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Rewards = () => {
  const { 
    calmCoins, 
    totalCoinsEarned, 
    badges, 
    claimDailyBonus, 
    canClaimDailyBonus,
    currentStreak,
  } = useWellMindStore();

  const allBadges = getAllBadgeIds();
  const unlockedCount = badges.length;

  const handleClaimBonus = () => {
    const bonus = claimDailyBonus();
    if (bonus > 0) {
      toast.success(`+${bonus} Calm Coins earned!`, {
        description: 'Daily bonus claimed successfully',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-foreground">Rewards</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Earn coins, unlock badges, care for your pet
        </p>
      </motion.header>

      <div className="px-5 space-y-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-honey/10 rounded-xl p-4 text-center">
            <Sparkles className="w-5 h-5 text-honey mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{calmCoins}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{unlockedCount}/{allBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
          <div className="bg-coral/10 rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-coral mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{currentStreak}</p>
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
              Claim Daily Bonus (+15 Coins)
            </Button>
          </motion.div>
        )}

        {/* Virtual Pet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">Your Calm Companion</h2>
          <VirtualPet />
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {allBadges.map((badgeId, index) => (
              <BadgeCard
                key={badgeId}
                badgeId={badgeId}
                unlocked={badges.includes(badgeId)}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Relaxation Games */}
        <RelaxGames />

        {/* How to Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl p-4 shadow-soft"
        >
          <h3 className="font-medium text-foreground mb-3">How to Earn Calm Coins</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🎯</span>
              Daily check-in: +10 coins
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🎁</span>
              Daily bonus: +15 coins
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🏅</span>
              Unlock badge: +25 coins
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🌬️</span>
              Complete exercise: +5 coins
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🎮</span>
              Play games: up to +15 coins
            </li>
          </ul>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Rewards;
