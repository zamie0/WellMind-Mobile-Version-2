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
  Sparkles,
  Flame,
  Star,
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
import { toast } from "sonner";

/* ── Earn Rules ─────────────────────────────────────────────────── */
const coinRules = [
  { icon: Target,   text: "Daily check-in",    bonus: "+10 coins", accent: "#39a89b" },
  { icon: Gift,     text: "Daily bonus",        bonus: "+15 coins", accent: "#e8735a" },
  { icon: Award,    text: "Unlock badge",       bonus: "+25 coins", accent: "#f59e0b" },
  { icon: Wind,     text: "Complete exercise",  bonus: "+5 coins",  accent: "#6bab9e" },
  { icon: Gamepad2, text: "Play games",         bonus: "up to +15", accent: "#8fa3b1" },
];

/* ── Helpers ────────────────────────────────────────────────────── */
const SectionHeading = ({
  children,
  icon,
  badge,
  onHeadingClick,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onHeadingClick?: () => void;
}) => (
  <div className="flex items-center gap-2 mb-3 px-0.5">
    {icon}
    <h2
      className="text-base font-bold"
      style={{ color: "#1a2b38", letterSpacing: "-0.01em", cursor: onHeadingClick ? "pointer" : undefined }}
      onClick={onHeadingClick}
    >
      {children}
    </h2>
    {badge && <div className="ml-auto">{badge}</div>}
  </div>
);

/* ── Page ───────────────────────────────────────────────────────── */
const MindBuddy = () => {
  const navigate = useNavigate();
  const { calmCoins, badges, claimDailyBonus, canClaimDailyBonus, currentStreak } =
    useWellMindStore();

  const allBadges = getAllBadgeIds();
  const unlockedCount = badges.length;
  const recentBadges = getRecentBadges(badges, 4);

  /* Easter egg */
  const [achievementsClicks, setAchievementsClicks] = useState(0);
  const handleAchievementsClick = () => {
    const next = achievementsClicks + 1;
    setAchievementsClicks(next);
    if (next === 5) {
      useWellMindStore.setState((s) => ({
        calmCoins: s.calmCoins + 200,
        totalCoinsEarned: s.totalCoinsEarned + 200,
      }));
      setAchievementsClicks(0);
      toast.success("+200 Coins Secret Bonus!", { description: "Easter egg unlocked 🎉" });
    }
  };

  const handleClaimBonus = () => {
    const bonus = claimDailyBonus();
    if (bonus > 0)
      toast.success(`+${bonus} Calm Coins earned!`, { description: "Daily bonus claimed!" });
  };

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: "linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)" }}
    >

      {/* ── Hero ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-10 pb-8"
      >
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
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#39a89b" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#39a89b" }}>
              MindBuddy
            </span>
          </div>

          <h1 className="text-[2rem] font-bold leading-tight mb-2" style={{ color: "#1a2b38", letterSpacing: "-0.02em" }}>
            Your Calm Journey
          </h1>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: "#5f7585" }}>
            Earn coins, unlock badges, and care for your companion.
          </p>

          {/* Stats row */}
          <div className="flex gap-3">
            {[
              { value: calmCoins,       label: "Calm Coins",  accent: "#39a89b" },
              { value: `${unlockedCount}/${allBadges.length}`, label: "Badges", accent: "#e8735a" },
              { value: currentStreak,   label: "Day Streak",  accent: "#f59e0b" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                className="flex-1 rounded-2xl px-3 py-4 text-center"
                style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <p className="text-2xl font-bold leading-none mb-1" style={{ color: item.accent }}>{item.value}</p>
                <p className="text-[11px] font-medium" style={{ color: "#8fa3b1" }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-6">

        {/* ── Daily Bonus ─────────────────────────────────────── */}
        {canClaimDailyBonus() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 22 }}
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(232,115,90,0.22)" }}
          >
            {/* Accent line matching counselor card style */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #e8735a, #f0957f)" }} />
            <button
              onClick={handleClaimBonus}
              className="relative w-full flex items-center gap-4 px-5 py-4 text-left transition-all active:scale-[0.99]"
              style={{ background: "white" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(232,115,90,0.1)" }}
              >
                <Gift className="h-5 w-5" style={{ color: "#e8735a" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: "#1a2b38" }}>Daily Bonus Available</p>
                <p className="text-xs mt-0.5" style={{ color: "#8fa3b1" }}>Tap to claim your coins for today</p>
              </div>
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #e8735a, #d45f47)", color: "white", boxShadow: "0 2px 8px rgba(232,115,90,0.3)" }}
              >
                +25
              </span>
            </button>
          </motion.div>
        )}

        {/* ── Virtual Pet ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <SectionHeading>Your Calm Companion</SectionHeading>
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
          >
            {/* Accent line */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #39a89b, #6bab9e)" }} />
            <div className="p-1">
              <VirtualPet />
            </div>
          </div>
        </motion.div>

        {/* ── Achievements ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeading
            icon={<Trophy className="h-4 w-4" style={{ color: "#f59e0b" }} />}
            onHeadingClick={handleAchievementsClick}
            badge={
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}
              >
                {unlockedCount}/{allBadges.length}
              </span>
            }
          >
            Achievements
          </SectionHeading>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {recentBadges.map((badgeId, index) => (
              <BadgeCard
                key={badgeId}
                badgeId={badgeId}
                unlocked={badges.includes(badgeId)}
                index={index}
              />
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/achievements", { replace: true })}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-colors border-2"
            style={{
              borderColor: "rgba(57,168,155,0.3)",
              color: "#39a89b",
              background: "rgba(57,168,155,0.05)",
            }}
          >
            <Trophy className="w-4 h-4" />
            View All Achievements
            <ArrowRight className="w-4 h-4 ml-auto" style={{ color: "rgba(57,168,155,0.4)" }} />
          </motion.button>
        </motion.div>

        {/* ── How to Earn ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <SectionHeading
            icon={<Coins className="h-4 w-4" style={{ color: "#39a89b" }} />}
          >
            How to Earn Coins
          </SectionHeading>

          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
          >
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #39a89b, #6bab9e)" }} />
            <ul className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
              {coinRules.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + i * 0.06 }}
                    className="flex items-center gap-3.5 px-5 py-3.5"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${rule.accent}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: rule.accent }} />
                    </div>
                    <span className="flex-1 text-sm font-medium" style={{ color: "#5f7585" }}>
                      {rule.text}
                    </span>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: `${rule.accent}15`, color: rule.accent }}
                    >
                      {rule.bonus}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.div>

        <div/>
      </main>

      <BottomNav />
    </div>
  );
};

export default MindBuddy;