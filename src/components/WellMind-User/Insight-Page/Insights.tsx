import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { MoodChart } from '@/components/WellMind-User/Home-Page/MoodChart';
import { InsightsHealthPanels } from './insights/InsightsHealthPanels';
import { filterMoodEntriesByPeriod, computeMoodStressIndex } from './insights/periodUtils';
import SmartwatchInsights, { type SmartwatchHealthController } from './Smartwatch/SmartwatchInsights';
import { useSmartwatchHealth } from './Smartwatch/useSmartwatchHealth';
import type { Emotion } from '@/types/wellmind';
import { Activity, Brain, Target, TrendingUp, BarChart2, Watch } from 'lucide-react';

/* ── Emotion labels ─────────────────────────────────────────────── */
const emotionLabels: Record<Emotion, string> = {
  happy: 'Happy',
  neutral: 'Okay',
  sad: 'Sad',
  anxious: 'Anxious',
  stressed: 'Stressed',
  exhausted: 'Exhausted',
  numb: 'Numb',
};

const CONNECTED_KEY = 'wellmind-health-connect-enabled';

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

/* ── Page ───────────────────────────────────────────────────────── */
export const Insights = () => {
  const [isSmartwatchLinked, setIsSmartwatchLinked] = useState(
    () => localStorage.getItem(CONNECTED_KEY) === 'true'
  );
  const [showSmartwatchSetup, setShowSmartwatchSetup] = useState(false);
  const smartwatchHealth: SmartwatchHealthController = useSmartwatchHealth();

  const moodEntries   = useWellMindStore((s) => s.moodEntries);
  const currentStreak = useWellMindStore((s) => s.currentStreak);
  const weeklyPlan    = useWellMindStore((s) => s.weeklyPlan);

  const sortedEntries = useMemo(
    () => [...moodEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [moodEntries]
  );

  const monthEntries = useMemo(
    () => filterMoodEntriesByPeriod(sortedEntries, 'month'),
    [sortedEntries]
  );

  const planCompletion = useMemo(() => {
    if (!weeklyPlan?.tasks.length) return 0;
    const completed = weeklyPlan.tasks.filter((t) => t.completed).length;
    return Math.round((completed / weeklyPlan.tasks.length) * 100);
  }, [weeklyPlan]);

  const moodCounts = useMemo(
    () =>
      monthEntries.reduce((acc, entry) => {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
        return acc;
      }, {} as Record<Emotion, number>),
    [monthEntries]
  );

  const dominantMood = useMemo(() => {
    const top = Object.entries(moodCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
    return top ? (top[0] as Emotion) : null;
  }, [moodCounts]);

  const stressIndex = useMemo(() => computeMoodStressIndex(monthEntries), [monthEntries]);

  const positiveDays = useMemo(() => {
    if (!monthEntries.length) return 0;
    const positive = monthEntries.filter((e) => e.emotion === 'happy').length;
    return Math.round((positive / monthEntries.length) * 100);
  }, [monthEntries]);

  const summaryCards = [
    {
      Icon: Activity,
      label: 'Total Check-ins',
      value: String(monthEntries.length),
      subtext: 'Last 30 days',
      accent: '#39a89b',
    },
    {
      Icon: TrendingUp,
      label: 'Current Streak',
      value: `${currentStreak} days`,
      subtext: 'Consecutive check-ins',
      accent: '#e8735a',
    },
    {
      Icon: Target,
      label: 'Positive Days',
      value: `${positiveDays}%`,
      subtext: 'Happy mood check-ins',
      accent: '#6bab9e',
    },
    {
      Icon: Brain,
      label: 'Most Frequent',
      value: dominantMood ? emotionLabels[dominantMood] : 'N/A',
      subtext: 'Top mood (30 days)',
      accent: '#8fa3b1',
    },
  ];

  const showSmartwatchFlow = showSmartwatchSetup || isSmartwatchLinked;

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
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Insights
            </span>
          </div>

          <h1
            className="text-[2rem] font-bold leading-tight mb-2"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your Insights
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: '#5f7585' }}>
            Track your emotional patterns and well-being over time.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-6">

        {/* ── Summary Cards ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SectionHeading icon={<TrendingUp className="h-4 w-4" style={{ color: '#39a89b' }} />}>
            Monthly Overview
          </SectionHeading>

          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map(({ Icon, label, value, subtext, accent }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }}
                />
                <div className="px-4 py-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${accent}18` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  <p className="text-xl font-bold leading-none mb-1" style={{ color: accent }}>{value}</p>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#1a2b38' }}>{label}</p>
                  <p className="text-[11px]" style={{ color: '#8fa3b1' }}>{subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Mood Chart ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <SectionHeading icon={<Activity className="h-4 w-4" style={{ color: '#39a89b' }} />}>
            Mood Trends
          </SectionHeading>
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <MoodChart />
          </div>
        </motion.div>

        {/* ── Link Smartwatch ────────────────────────────────── */}
        {!isSmartwatchLinked && !showSmartwatchSetup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.44, type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(143,163,177,0.2)' }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #8fa3b1, #b0c4ce)' }} />
            <div
              className="flex items-center gap-4 px-5 py-4"
              style={{ background: 'white' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(143,163,177,0.12)' }}
              >
                <Watch className="h-5 w-5" style={{ color: '#8fa3b1' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>Link Smartwatch</p>
                <p className="text-xs mt-0.5" style={{ color: '#8fa3b1' }}>
                  Connect your device to unlock advanced health insights
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowSmartwatchSetup(true)}
                className="text-xs font-bold px-4 py-2 rounded-full flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
                }}
              >
                Link Now
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Smartwatch Flow ────────────────────────────────── */}
        {showSmartwatchFlow && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #8fa3b1, #6b8fa3)' }} />
            <div className="p-4">
              <SmartwatchInsights
                health={smartwatchHealth}
                stressIndex={stressIndex}
                onLinked={() => {
                  setIsSmartwatchLinked(true);
                  setShowSmartwatchSetup(false);
                }}
                onUnlinked={() => {
                  setIsSmartwatchLinked(false);
                  setShowSmartwatchSetup(false);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Health Panels ──────────────────────────────────── */}
        {smartwatchHealth.state === 'connected' && smartwatchHealth.snapshot && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }} />
            <div className="p-4">
              <InsightsHealthPanels healthLinked />
            </div>
          </motion.div>
        )}

        <div/>
      </main>

      <BottomNav />
    </div>
  );
};

export default Insights;