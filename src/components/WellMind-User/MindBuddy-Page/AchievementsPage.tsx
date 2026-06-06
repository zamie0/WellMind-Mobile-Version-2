import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trophy, Lock, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWellMindStore } from "@/stores/wellmindStore";
import {
  BadgeCard,
  getAllBadgeIds,
  getBadgesInCategory,
  getCategoryLabel,
  getAllCategories,
} from "./BadgeCard";

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { badges } = useWellMindStore();
  const [selectedCategory, setSelectedCategory] = useState("progress");

  const categories = getAllCategories();
  const allBadges = getAllBadgeIds();
  const badgesInCategory = getBadgesInCategory(selectedCategory as any);

  const unlockedInCategory = badgesInCategory.filter((id) => badges.includes(id));
  const lockedInCategory = badgesInCategory.filter((id) => !badges.includes(id));

  const totalUnlocked = badges.length;
  const totalBadges = allBadges.length;
  const progressPercentage = Math.round((totalUnlocked / totalBadges) * 100);

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: "linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)" }}
    >

      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-10 pb-7">
        {/* Soft background rings */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-10 -left-16 w-56 h-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,115,90,0.08) 0%, transparent 70%)" }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Back button */}
          <button
            onClick={() => navigate("/MindBuddy", { replace: true })}
            className="flex items-center gap-1.5 mb-5 text-sm font-semibold transition-colors"
            style={{ color: "#39a89b" }}
          >
            <ChevronLeft className="w-4 h-4" />
            MindBuddy
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#39a89b" }}>
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#39a89b" }}>
              Achievements
            </span>
          </div>

          <h1
            className="text-[2rem] font-bold leading-tight mb-2"
            style={{ color: "#1a2b38", letterSpacing: "-0.02em" }}
          >
            Your Badges
          </h1>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: "#5f7585" }}>
            {totalUnlocked} of {totalBadges} unlocked — keep going!
          </p>

          {/* Stats row */}
          <div className="flex gap-3">
            {[
              { value: totalUnlocked,              label: "Unlocked",   accent: "#39a89b" },
              { value: totalBadges - totalUnlocked, label: "Remaining", accent: "#e8735a" },
              { value: `${progressPercentage}%`,   label: "Complete",   accent: "#f59e0b" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                className="flex-1 rounded-2xl px-3 py-4 text-center"
                style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <p className="text-2xl font-bold leading-none mb-1" style={{ color: item.accent }}>
                  {item.value}
                </p>
                <p className="text-[11px] font-medium" style={{ color: "#8fa3b1" }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <main className="px-5 space-y-6">

        {/* ── Progress bar card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
        >
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #39a89b, #6bab9e)" }} />
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8fa3b1" }}>
                Overall Progress
              </span>
              <span className="text-xs font-bold" style={{ color: "#39a89b" }}>{progressPercentage}%</span>
            </div>
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(57,168,155,0.1)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #39a89b, #6bab9e)" }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Category tabs ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <motion.button
                key={category}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: active ? "linear-gradient(135deg, #e8735a, #d45f47)" : "white",
                  color: active ? "white" : "#5f7585",
                  boxShadow: active
                    ? "0 4px 14px rgba(232,115,90,0.28)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {getCategoryLabel(category)}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Badge grids ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Unlocked */}
            {unlockedInCategory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <Trophy className="h-4 w-4" style={{ color: "#39a89b" }} />
                  <h2 className="text-base font-bold" style={{ color: "#1a2b38", letterSpacing: "-0.01em" }}>
                    Unlocked
                  </h2>
                  <span
                    className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(57,168,155,0.1)", color: "#39a89b" }}
                  >
                    {unlockedInCategory.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {unlockedInCategory.map((badgeId, index) => (
                    <motion.div
                      key={badgeId}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 280, damping: 22 }}
                    >
                      <BadgeCard badgeId={badgeId} unlocked={true} index={index} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedInCategory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <Lock className="h-4 w-4" style={{ color: "#8fa3b1" }} />
                  <h2 className="text-base font-bold" style={{ color: "#1a2b38", letterSpacing: "-0.01em" }}>
                    Locked
                  </h2>
                  <span
                    className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.05)", color: "#8fa3b1" }}
                  >
                    {lockedInCategory.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {lockedInCategory.map((badgeId, index) => (
                    <motion.div
                      key={badgeId}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 280, damping: 22 }}
                    >
                      <BadgeCard badgeId={badgeId} unlocked={false} index={unlockedInCategory.length + index} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {badgesInCategory.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl flex flex-col items-center justify-center py-14 text-center"
                style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(57,168,155,0.09)" }}
                >
                  <Trophy className="h-7 w-7" style={{ color: "#39a89b" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "#8fa3b1" }}>
                  No achievements in this category yet
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Tips card ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
        >
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4" style={{ color: "#f59e0b" }} />
              <h3 className="text-base font-bold" style={{ color: "#1a2b38", letterSpacing: "-0.01em" }}>
                Achievement Tips
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Regular check-ins help you build streaks and unlock progress badges",
                "Try different activities to unlock new skill and activity badges",
                "Care for your pet consistently to reach higher levels",
                "Special badges are unlocked through unique accomplishments",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
                    style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: "#5f7585" }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="h-4" />
      </main>
    </div>
  );
};

export default AchievementsPage;