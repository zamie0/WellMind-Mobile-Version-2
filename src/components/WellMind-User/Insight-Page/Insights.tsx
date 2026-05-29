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
import { Activity, Brain, Target, TrendingUp } from 'lucide-react';

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

export const Insights = () => {
    const [isSmartwatchLinked, setIsSmartwatchLinked] = useState(() => localStorage.getItem(CONNECTED_KEY) === 'true');
    const [showSmartwatchSetup, setShowSmartwatchSetup] = useState(false);
    const smartwatchHealth: SmartwatchHealthController = useSmartwatchHealth();

    const moodEntries = useWellMindStore((state) => state.moodEntries);
    const currentStreak = useWellMindStore((state) => state.currentStreak);
    const weeklyPlan = useWellMindStore((state) => state.weeklyPlan);
    const sortedEntries = useMemo(
        () => [...moodEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        [moodEntries]
    );

    const monthEntries = useMemo(() => filterMoodEntriesByPeriod(sortedEntries, 'month'), [sortedEntries]);

    const planCompletion = useMemo(() => {
        if (!weeklyPlan?.tasks.length) return 0;
        const completed = weeklyPlan.tasks.filter((task) => task.completed).length;
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
        const positive = monthEntries.filter((entry) => entry.emotion === 'happy').length;
        return Math.round((positive / monthEntries.length) * 100);
    }, [monthEntries]);

    const topSummaryCards = [
        {
            icon: <Activity className="h-5 w-5" />,
            label: 'Total Check-ins',
            value: String(monthEntries.length),
            subtext: 'Last 30 days',
            color: 'bg-sky-light text-sky',
        },
        {
            icon: <TrendingUp className="h-5 w-5" />,
            label: 'Current Streak',
            value: `${currentStreak} days`,
            subtext: 'Consecutive check-in days',
            color: 'bg-coral-light text-coral',
        },
        {
            icon: <Target className="h-5 w-5" />,
            label: 'Positive Days',
            value: `${positiveDays}%`,
            subtext: 'Happy mood check-ins',
            color: 'bg-sage-light text-sage',
        },
        {
            icon: <Brain className="h-5 w-5" />,
            label: 'Most Frequent',
            value: dominantMood ? emotionLabels[dominantMood] : 'N/A',
            subtext: 'Top mood (30 days)',
            color: 'bg-lavender-light text-lavender',
        },
    ];

    const showSmartwatchFlow = showSmartwatchSetup || isSmartwatchLinked;

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="px-5 pt-safe-top">
                <div className="pt-6 pb-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-foreground"
                    >
                        Your Insights
                    </motion.h1>
                    <p className="text-muted-foreground">
                        Track your emotional patterns
                    </p>
                </div>
            </header>

            <main className="px-5 py-4 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                >
                    {topSummaryCards.map((card, index) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card rounded-2xl p-4 shadow-soft"
                        >
                            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                                {card.icon}
                            </div>
                            <p className="text-2xl font-bold text-foreground">{card.value}</p>
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <MoodChart />

                {!isSmartwatchLinked && !showSmartwatchSetup && (
                    <section className="bg-card rounded-2xl p-5 shadow-soft">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Link Smartwatch</h2>
                                <p className="text-sm text-muted-foreground">
                                    Connect your smartwatch to unlock advanced health insights.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSmartwatchSetup(true)}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                            >
                                Link Now
                            </button>
                        </div>
                    </section>
                )}

                {showSmartwatchFlow && (
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
                )}

                {smartwatchHealth.state === 'connected' && smartwatchHealth.snapshot && (
                    <InsightsHealthPanels healthLinked />
                )}
            </main>

            <BottomNav />
        </div>
    );
};

export default Insights;
