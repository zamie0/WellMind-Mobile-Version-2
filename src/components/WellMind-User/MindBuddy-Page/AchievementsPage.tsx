import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWellMindStore } from "@/stores/wellmindStore";
import {
  BadgeCard,
  getAllBadgeIds,
  getBadgesInCategory,
  getCategoryLabel,
  getAllCategories,
  getBadgeInfo,
} from "./BadgeCard";
import { Button } from "@/components/ui/button";

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { badges } = useWellMindStore();
  const [selectedCategory, setSelectedCategory] = useState("progress");

  const categories = getAllCategories();
  const allBadges = getAllBadgeIds();
  const badgesInCategory = getBadgesInCategory(selectedCategory as any);

  const unlockedInCategory = badgesInCategory.filter((id) =>
    badges.includes(id)
  );
  const lockedInCategory = badgesInCategory.filter((id) => !badges.includes(id));

  const totalUnlocked = badges.length;
  const totalBadges = allBadges.length;
  const progressPercentage = Math.round((totalUnlocked / totalBadges) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      >
        <div className="px-5 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/MindBuddy", { replace: true })}
            className="h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">All Achievements</h1>
            <p className="text-sm text-muted-foreground">
              {totalUnlocked} of {totalBadges} unlocked
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-4">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-coral"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {progressPercentage}% Complete
          </p>
        </div>
      </motion.header>

      <div className="px-5 space-y-6 pt-6">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-card text-muted-foreground hover:bg-card/80"
              }`}
            >
              {getCategoryLabel(category)}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Unlocked Achievements */}
            {unlockedInCategory.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Unlocked ({unlockedInCategory.length})
                </h2>
                <motion.div className="grid grid-cols-2 gap-3">
                  {unlockedInCategory.map((badgeId, index) => (
                    <motion.div
                      key={badgeId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BadgeCard
                        badgeId={badgeId}
                        unlocked={true}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedInCategory.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-muted rounded-full" />
                  Locked ({lockedInCategory.length})
                </h2>
                <motion.div className="grid grid-cols-2 gap-3">
                  {lockedInCategory.map((badgeId, index) => (
                    <motion.div
                      key={badgeId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BadgeCard
                        badgeId={badgeId}
                        unlocked={false}
                        index={unlockedInCategory.length + index}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Empty State */}
            {badgesInCategory.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <p className="text-muted-foreground">
                  No achievements in this category yet
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Achievement Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-4 shadow-soft border border-border"
        >
          <h3 className="font-semibold text-foreground mb-3">Achievement Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Regular check-ins help you build streaks and unlock progress badges</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Try different activities to unlock new skill and activity badges</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Care for your pet consistently to reach higher levels</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Special badges are unlocked through unique accomplishments</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default AchievementsPage;
